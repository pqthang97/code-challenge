# Problem 5 - User Management API

A Node.js/TypeScript REST API for user management with basic CURD support filtering

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Git

## Installation

1. Clone the repository and navigate to the project directory:

```bash
cd src/problem5
```

2. Install dependencies:

```bash
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

## Database Configuration

1. Create a `.env` file in the root of the problem5 directory:

```bash
touch .env
```

2. Add the following environment variables to your `.env` file:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=problem5
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password_here

# Server Configuration
PORT=3000
```

3. Make sure your PostgreSQL server is running and create the database:

```sql
CREATE DATABASE problem5;
```

## Running Migrations

Migrations create the database tables. Run the following command to execute all pending migrations:

```bash
npx knex migrate:latest --knexfile ./knexfile.cjs
```

To rollback the last migration:

```bash
npx knex migrate:rollback --knexfile ./knexfile.cjs
```

To check migration status:

```bash
npx knex migrate:status --knexfile ./knexfile.cjs
```

## Running Seeds

Seeds populate the database with sample data. Run the following command to seed the database:

```bash
npx knex seed:run --knexfile ./knexfile.cjs
```

This will create 10 sample users with hashed passwords.

## Starting the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Base URL: `http://localhost:3000/api`

| Method | Endpoint        | Description                                                                                            |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | `/users`        | Get all users with filtering, sorting, and pagination                                                  |
| POST   | `/users/filter` | Get all users with filtering, sorting, and pagination (for advanced filter because query string limit) |
| GET    | `/users/:id`    | Get a specific user by ID                                                                              |
| POST   | `/users`        | Create a new user                                                                                      |
| PUT    | `/users/:id`    | Update an existing user                                                                                |
| DELETE | `/users/:id`    | Delete a user (soft delete)                                                                            |

## Filter Operators

The API supports various filter operators for querying users:

| Operator     | Description                       | Example                                                            |
| ------------ | --------------------------------- | ------------------------------------------------------------------ |
| `eq`         | Equals                            | `{"field": "status", "operator": "eq", "value": 1}`                |
| `ne`         | Not equals                        | `{"field": "status", "operator": "ne", "value": 0}`                |
| `lt`         | Less than                         | `{"field": "id", "operator": "lt", "value": 5}`                    |
| `lte`        | Less than or equal                | `{"field": "id", "operator": "lte", "value": 5}`                   |
| `gt`         | Greater than                      | `{"field": "id", "operator": "gt", "value": 5}`                    |
| `gte`        | Greater than or equal             | `{"field": "id", "operator": "gte", "value": 5}`                   |
| `in`         | In array                          | `{"field": "id", "operator": "in", "value": [1,2,3]}`              |
| `nin`        | Not in array                      | `{"field": "id", "operator": "nin", "value": [1,2,3]}`             |
| `contains`   | Contains (case-insensitive)       | `{"field": "fullName", "operator": "contains", "value": "john"}`   |
| `ncontains`  | Does not contain                  | `{"field": "fullName", "operator": "ncontains", "value": "test"}`  |
| `containss`  | Contains (case-sensitive)         | `{"field": "fullName", "operator": "containss", "value": "John"}`  |
| `ncontainss` | Does not contain (case-sensitive) | `{"field": "fullName", "operator": "ncontainss", "value": "Test"}` |
| `ilike`      | Case-insensitive like             | `{"field": "email", "operator": "ilike", "value": "gmail"}`        |
| `null`       | Is null/not null                  | `{"field": "deletedAt", "operator": "null", "value": true}`        |
| `or`         | Logical OR                        | `{"field": "", "operator": "or", "value": [filter1, filter2]}`     |

## Usage Examples

### 1. Get All Users (Basic)

```bash
curl -X GET "http://localhost:3000/api/users"
```

### 2. Get Users with Pagination

```bash
curl -X GET "http://localhost:3000/api/users?page=1&pageSize=5"
```

### 3. Filter Users by Status

```bash
curl -X GET "http://localhost:3000/api/users?filter=[{\"field\":\"status\",\"operator\":\"eq\",\"value\":1}]"
```

### 4. Filter Users by Name (Contains)

```bash
curl -X GET "http://localhost:3000/api/users?filter=[{\"field\":\"fullName\",\"operator\":\"contains\",\"value\":\"john\"}]"
```

### 5. Filter Users by Multiple Conditions

```bash
curl -X GET "http://localhost:3000/api/users?filter=[{\"field\":\"status\",\"operator\":\"eq\",\"value\":1},{\"field\":\"fullName\",\"operator\":\"contains\",\"value\":\"john\"}]"
```

### 6. Filter with OR Condition

```bash
curl -X GET "http://localhost:3000/api/users?filter=[{\"operator\":\"or\",\"value\":[{\"field\":\"fullName\",\"operator\":\"contains\",\"value\":\"john\"},{\"field\":\"fullName\",\"operator\":\"contains\",\"value\":\"jane\"}]}]"
```

### 7. Sort Users by Name (Ascending)

```bash
curl -X GET "http://localhost:3000/api/users?sort=[{\"field\":\"fullName\",\"value\":\"asc\"}]"
```

### 8. Sort Users by Creation Date (Descending)

```bash
curl -X GET "http://localhost:3000/api/users?sort=[{\"field\":\"createdAt\",\"value\":\"desc\"}]"
```

### 9. Complex Query (Filter + Sort + Pagination)

```bash
curl -X GET "http://localhost:3000/api/users?filter=[{\"field\":\"status\",\"operator\":\"eq\",\"value\":1}]&sort=[{\"field\":\"fullName\",\"value\":\"asc\"}]&page=1&pageSize=5"
```

### 10. Create a New User

```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword",
    "fullName": "New User",
    "birthday": "1990-01-01",
    "phone": "+1234567890",
    "address": "123 New Street"
  }'
```

### 11. Get User by ID

```bash
curl -X GET "http://localhost:3000/api/users/1"
```

### 12. Update User

```bash
curl -X PUT "http://localhost:3000/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "phone": "+0987654321"
  }'
```

### 13. Delete User

```bash
curl -X DELETE "http://localhost:3000/api/users/1"
```

### 14. Filter by Date Range

```bash
curl -X GET "http://localhost:3000/api/users?filter=[{\"field\":\"birthday\",\"operator\":\"gte\",\"value\":\"1990-01-01\"},{\"field\":\"birthday\",\"operator\":\"lt\",\"value\":\"2000-01-01\"}]"
```

### 15. Filter by Email Domain

```bash
curl -X GET "http://localhost:3000/api/users?filter=[{\"field\":\"email\",\"operator\":\"contains\",\"value\":\"example.com\"}]"
```

## Response Format

### Success Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "error": "Error message"
}
```
