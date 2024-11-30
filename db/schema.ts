import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const formsTable = pgTable("forms", {
    id: serial('id').notNull().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    user_id: varchar('user_id', { length: 255 }).notNull()
});

export const choicesTable = pgTable("choices", {
    choices_id: serial('choices_id').notNull().primaryKey(),
    question: varchar('question', { length: 255 }),
    form_id: serial('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull(),
    choicesOrderIndex: integer('order_index').default(0).notNull()
});

export const choicesOptionsTable = pgTable("choices_options", {
    option_id: serial('option_id').notNull().primaryKey(),
    option: varchar('option'),
    choices_id: serial('choices_id').notNull().references(() => choicesTable.choices_id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').default(-1).notNull()
});

export const textQuestionsTable = pgTable("text_questions", {
    text_question_id: serial('text_question_id').notNull().primaryKey(),
    question: varchar('question', { length: 255 }),
    form_id: serial('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull(),
    textOrderIndex: integer('order_index').default(0).notNull()
})

export const ratingQuestionTable = pgTable("rating_questions", {
    rating_question_id: serial('rating_question_id').notNull().primaryKey(),
    question: varchar('question', { length: 255 }),
    ratingLevels: integer('levels').default(5).notNull(),
    orderIndex: integer('order_index').default(-1).notNull(),
    form_id: serial('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull()
})