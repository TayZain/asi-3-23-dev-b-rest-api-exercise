export const up = async (knex) => {
  await knex.schema
    .createTable("role", (table) => {
      table.increments("id")
      table.text("name").notNullable()
      table.text("permission")
      table.timestamps(true, true, true)
    })
    .then(() =>
      knex("role").insert([
        { name: "admin" },
        { name: "manager" },
        { name: "editor" },
      ])
    )
  await knex.schema.createTable("users", (table) => {
    table.increments("id")
    table.text("email").notNullable().unique()
    table.text("firstName").notNullable().unique()
    table.text("lastName").notNullable().unique()
    table.integer("roleId").references("id").inTable("role").notNullable()
    table.text("passwordHash").notNullable()
    table.text("passwordSalt").notNullable()
    table.timestamps(true, true, true)
  })
  await knex.schema.createTable("pages", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("url").notNullable()
    table.integer("createdBy")
    table.integer("editBy")
    table.text("status").notNullable().defaultTo("draft")
    table.timestamps(true, true, true)
  })
  await knex.schema.createTable("navigationMenu", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.json("hierarchical").notNullable()
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("role")
  await knex.schema.dropTable("users")
  await knex.schema.dropTable("pages")
  await knex.schema.dropTable("navigationMenu")
}
