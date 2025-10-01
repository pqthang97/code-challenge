require("dotenv").config()

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      user: process.env.DATABASE_USER
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations"
    },
    acquireConnectionTimeout: 30000
  }
}
