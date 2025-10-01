
exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary()
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.string('fullName').notNullable()
    table.date('birthday')
    table.string('phone')
    table.text('address')
    table.integer('status').defaultTo(1)
    table.datetime('deletedAt')
    table.datetime('createdAt').defaultTo(knex.fn.now())
    table.datetime('updatedAt').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('users')
}
