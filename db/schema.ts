import { boolean, integer, pgTable, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const formsTable = pgTable("forms", {
    id: uuid('id').notNull().primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    user_id: varchar('user_id', { length: 255 }).notNull()
});

export const choicesTable = pgTable("choices", {
    choices_id: serial('choices_id').notNull().primaryKey(),
    question: varchar('question', { length: 255 }),
    form_id: uuid('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull(),
    choicesOrderIndex: integer('order_index').default(0).notNull(),
    required: boolean('required').default(false).notNull()
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
    form_id: uuid('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull(),
    textOrderIndex: integer('order_index').default(0).notNull(),
    required: boolean('required').default(false).notNull()
})

export const ratingQuestionTable = pgTable("rating_questions", {
    rating_question_id: serial('rating_question_id').notNull().primaryKey(),
    question: varchar('question', { length: 255 }),
    ratingLevels: integer('levels').default(5).notNull(),
    orderIndex: integer('order_index').default(-1).notNull(),
    form_id: uuid('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull(),
    required: boolean('required').default(false).notNull()
});

export const dateQuestionTable = pgTable("date_questions", {
    date_question_id: serial('date_question_id').notNull().primaryKey(),
    question: varchar('question', { length: 255 }),
    orderIndex: integer('order_index').default(-1).notNull(),
    form_id: uuid('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull(),
    required: boolean('required').default(false).notNull()
});

export const rankingQuestionTable = pgTable("ranking_questions", {
    ranking_question_id: serial('ranking_question_id').notNull().primaryKey(),
    question: varchar('question', { length: 255 }),
    orderIndex: integer('order_index').default(-1).notNull(),
    form_id: uuid('form_id').references(() => formsTable.id, { onDelete: 'cascade' }).notNull(),
    required: boolean('required').default(false).notNull()
});

export const rankingOptionsTable = pgTable("ranking_options", {
    ranking_option_id: serial('ranking_option_id').notNull().primaryKey(),
    option: varchar('option'),
    orderIndex: integer('order_index').default(-1).notNull(),
    ranking_id: serial('ranking_id').references(() => rankingQuestionTable.ranking_question_id, { onDelete: 'cascade' }).notNull()
});

export const userTable = pgTable("user", {
	id: text("id").primaryKey(),
    username: text("username").notNull(),
    password_hash: text("password_hash").notNull(),
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});