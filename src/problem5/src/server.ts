import type { Request, Response } from "express";
import express from "express";

import Knex from "knex";
import { Model } from "objection";

import dotenv from "dotenv";
import middlewares from "./middlewares/index.js";
import routes from "./routes/index.js";

dotenv.config();

const knex = Knex({
  client: "pg",
  connection: {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    database: process.env.DATABASE_NAME || "problem5",
    password: process.env.DATABASE_PASSWORD || "123456",
    user: process.env.DATABASE_USER || "postgres",
    timezone: "UTC"
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "migrations"
  }
});

Model.knex(knex);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewares.consoleRequestInfo);

app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express and TypeScript!");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
