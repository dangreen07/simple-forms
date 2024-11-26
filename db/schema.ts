import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const formsTable = pgTable("forms", {
    id: serial('id').notNull().primaryKey(),
    name: varchar('name', { length: 255 }),
    user_id: varchar('user_id', { length: 255 })
});

export const choicesTable = pgTable("choices", {
    choices_id: serial('choices_id').notNull().primaryKey(),
    question: varchar('question', { length: 255 }),
    form_id: serial('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull()
});

export const choicesOptionsTable = pgTable("choices_options", {
    option_id: serial('option_id').notNull().primaryKey(),
    option: varchar('option', { length: 255 }),
    choices_id: serial('choices_id').notNull().references(() => choicesTable.choices_id, { onDelete: 'cascade' }),
});