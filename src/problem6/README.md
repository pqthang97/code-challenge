# Scoreboard Service Module — Specification (API Backend)

This module powers a **Top‑10 live scoreboard** with secure score updates, cached reads, and realtime pushes.

---

## goals

- Show **Top 10** users’ scores on the website.
- **Live updates** to clients via WebSocket.
- **Fast** (cached) reads; **no live DB query** on every page load.
- **Secure** write path to prevent unauthorized score inflation.
- Provide: 
  + common internal function to adjust score.
  + external API with API key/secret.
- Backfill cache via **cron job every 1 minute**.

---

## high-level architecture

- **DB** (e.g., PostgreSQL): `users`, `scores` (or denormalized `users.score`), `score_events` (append-only audit).
- **Cache** (Redis): `scoreboard:top10` (JSON list), `user:score:{id}`, locks, rate-limit buckets.
- **HTTP API**: authenticated routes for score updates and fetch.
- **WebSocket Gateway**: room `scoreboard` broadcasts cache changes.
- **Worker / Cron**: runs every 60s → recompute Top 10 from DB → write Redis → broadcast delta.
- **Auth / Security**: API key + HMAC signature, replay prevention, RBAC, rate-limits, abuse detection.

See the diagram: [`diagram.png`](diagram.png).

---

## data model

### Tables

- **users(id, display_name, …)**
- **scores(user_id PK/FK users.id, score BIGINT NOT NULL DEFAULT 0, updated_at)**  
  _Alternative_: store score in `users.score` if you don’t need isolation.
- **score_events(id, user_id, delta INT, reason TEXT, source ENUM('internal','external_api'), request_id UUID, created_at, meta JSONB)**
  - Unique index on `request_id` for idempotency.
  - Index `(user_id, created_at DESC)`.

### Redis keys

- `scoreboard:top10` → JSON payload `[ {userId, name, score}, … ]` + TTL 2–5 minutes (refreshed by cron)
- `user:score:{id}` → integer (optional micro‑cache for profile widgets)
- `rl:score:update:{apiKey}` → tokens for rate-limit
- `nonce:{apiKey}:{nonce}` → 5‑minute TTL for replay prevention (optional if `X-Timestamp`+skew check suffices)

---

## cache & refresh strategy

1. **Reads** (public scoreboard):

   - Serve from `Redis scoreboards:top10`. **Never** hit DB on hot path.
   - Miss/expired → _do not_ recompute on request; return stale‑while‑revalidate (include `asOf` timestamp).

2. **Writes** (score changes):

   - Write path updates DB **transactionally** and appends a `score_events` row.
   - If the changed user will affect Top 10, **optimistic patch** the cached array; else leave cache to cron.
   - Always **broadcast** on WebSocket with the minimal delta: `{ userId, oldScore, newScore, mayAffectTop10 }`.

3. **Cron (every 1m)**:
   - Recompute `SELECT … ORDER BY score DESC LIMIT 10` in DB.
   - Write full payload to `scoreboard:top10` and emit `scoreboard.replace` event.
   - (Optional) compute a checksum to skip broadcast if unchanged.

---

## realtime (websocket)

- Namespace/room: `scoreboard`.
- Events:
  - `scoreboard.delta` → `{ userId, oldScore, newScore }`
  - `scoreboard.replace` → `{ top10: […], asOf }`
- Clients connect on page load, render cache-first API response, then apply deltas/replace.

---

## public API (HTTP)

> Base path: `/api/v1/scoreboard`

### GET `/top10`

- **Purpose:** fetch cached Top‑10 in O(1).
- **Response 200:**

```json
{ "asOf": "2025-10-01T07:00:00Z",
  "top10": [ { "userId": 1, "name": "Alice", "score": 1234 }, … ] }
```

- **Notes:** Always served from Redis. Include `Cache-Control: no-store` for proxies but allow CDN edge cache of 1–5s if needed.

### POST `/update`

- **Purpose:** securely adjust a user’s score from other services.
- **Auth:** `X-Api-Key` + HMAC `X-Signature` over the canonical body, plus `X-Timestamp` (±300s) to prevent replay.
- **Body:**

```json
{
  "requestId": "uuid",
  "userId": 42,
  "delta": 10,
  "reason": "task_complete",
  "meta": { "source": "game-A" }
}
```

- **Responses:**
  - `200` `{ "userId": 42, "oldScore": 100, "newScore": 110, "asOf": "…" }`
  - `400` validation errors; `401/403` auth failures; `409` duplicate `requestId` (idempotency).

**HMAC construction**

- Canonical JSON (sorted keys, compact), UTF‑8 bytes.
- `signature = base64(hmac_sha256(secret, timestamp + "
" + body))`
- Server validates:
  - API key exists and is active.
  - `abs(now - X-Timestamp) <= skew`.
  - `signature` matches.
  - `requestId` not seen (or return last result to be idempotent).

---

## internal API (common function)

Provide a reusable module callable from any backend feature:

```ts
updateUserScore({
  requestId,       // string (can use uuid)
  userId,          // number
  delta,           // integer (can be negative if allowed by business rules)
  reason,          // string
  source = "internal",
  meta = {}
}): Promise<{ oldScore: number; newScore: number; touchedTop10: boolean }>
```

**Behavior**

1. Validate input, RBAC (if acting on behalf of another user/service).
2. Start DB transaction:
   - `SELECT … FOR UPDATE` current score.
   - Apply bounded delta (e.g., 0 ≤ score ≤ MAX_INT, optional per‑day caps).
   - Insert `score_events` with `request_id`.
3. Commit; publish a domain event `score.updated` to a queue/bus.
4. Patch Redis Top‑10 if needed and broadcast WebSocket delta.

---

## security & abuse prevention

- **Auth** for external updates: API key + secret per integrator; store as hashed; rotateable; per‑key permissions; whitelist IPs (optional)
- **HMAC signatures** + timestamp skew check; **idempotent** `requestId` to stop replay.
- **Rate limits**: e.g., 60 updates/min per API key; 10 updates/min per userId (configurable).
- **Delta bounds**: server‑side whitelist (e.g., −100 to +100 per call) and optional per‑day ceilings.
- **Audit**: every update logged to `score_events`; expose internal admin view & anomaly detection.
- **Monitoring**: emit metrics (`score_update_count`, `score_update_denied`, cache hit rate, WS connections).

---

## cron job (scheduler)

- Runs every minute (configurable via env `SCOREBOARD_REFRESH_CRON=*/1 * * * *`).
- Steps:
  1. Query DB Top‑10 with a covering index on `score DESC, user_id`.
  2. Serialize to JSON, store into Redis with TTL (e.g., 5m) and `asOf` timestamp.
  3. Compare checksum; if changed → broadcast `scoreboard.replace`.
- Implementation options: Node cron (Single instance / pod on k8s).

---

## performance notes

- Target p99 **GET /top10** < 10ms from cache.
- Keep payload under a few KB (Top‑10).
- Use Redis pipelines and Lua for atomic cache patch if needed.
- WebSocket fanout via a Pub/Sub (Redis, NATS, Kafka) for multi‑instance scale.

---

## configuration (12‑factor)

- `REDIS_URL`, `DATABASE_URL`
- `WEBSOCKET_ORIGIN_WHITELIST`
- `API_KEY_HEADER=X-Api-Key`, `SIGNATURE_HEADER=X-Signature`, `TIMESTAMP_HEADER=X-Timestamp`
- `REQUEST_SKEW_SECONDS=300`, `RATE_LIMITS_*`
- `SCORE_DELTA_MIN`, `SCORE_DELTA_MAX`, `SCORE_DAILY_CAP`
- `CRON_REFRESH_SPEC`

---

## testing strategy

- **Unit**: signature verify, idempotency, delta bounds, cache patching, sorter (Top‑10 ordering & ties).
- **Integration**: DB tx + score_events, Redis write + WS broadcast.
- **Security**: replay attack, invalid HMAC, key rotation.
- **Load**: 1k updates/s sustained; observe cache hit > 99% on GETs.
- **Chaos**: Redis down → serve last in‑memory snapshot; DB lag → skip replace broadcast.

---

## API examples (cURL)

**Update score (external):**

```
Method: POST
Path: /api/v1/scoreboard/update
Headers: 
  X-Api-Key:
  X-Timestamp:
  X-Signature:
Body: {"requestId": "random-string", "userId": 1, "delta": 10, "reason": "task_complete"}
```

**Fetch top10:**

```
Method: GET
Path: /api/v1/scoreboard/top10
```

---

## implementation checklist

- [ ] DB migrations for `scores` and `score_events`
- [ ] Redis keys & TTLs
- [ ] Internal `updateUserScore` function
- [ ] POST `/update` with HMAC & rate‑limits
- [ ] GET `/top10` (cache-only)
- [ ] WebSocket gateway with `scoreboard` room
- [ ] Cron job: refresh & broadcast
- [ ] Metrics & dashboards, alerts for anomaly spikes (Prometheus or cloud monitoring)
- [ ] Admin audit page (logs for audit)
