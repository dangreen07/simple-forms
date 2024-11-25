import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const formsTable = pgTable("forms", {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }),
    user_id: varchar('user_id', { length: 255 })
});