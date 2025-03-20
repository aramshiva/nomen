import { mysqlTable, varchar, char, int } from "drizzle-orm/mysql-core";

export const names = mysqlTable("names", {
  name: varchar("name", { length: 255 }).notNull().primaryKey().default(""),
  sex: char("sex", { length: 1 }).notNull().default(""),
  amount: int("amount").notNull().default(0),
  year: int("year").notNull().default(0),
}); // default names db

export const namesbyarea = mysqlTable("namesbyarea", {
  name: varchar("name", { length: 255 }).notNull().primaryKey().default(""),
  sex: char("sex", { length: 1 }).notNull().default(""),
  amount: int("amount").notNull().default(0),
  year: int("year").notNull().default(0),
  state: char("state", { length: 2 }).notNull().default(""),
}); // name db but with a state column

export const uniquenames = mysqlTable("uniquenames", {
  name: varchar("name", { length: 25 }).notNull().primaryKey().default(""),
}); // only names

export const unique_names = mysqlTable("unique_names", {
  name: varchar("name", { length: 25 }).notNull().primaryKey().default(""),
  amount: int("amount").notNull().default(0),
  sex: char("sex", { length: 1 }).notNull().default(""),
}); // names with amount

export const uniquenamesbyarea = mysqlTable("uniquenamesbyarea", {
  name: varchar("name", { length: 25 }).notNull().primaryKey().default(""),
  amount: int("amount").notNull().default(0),
  sex: char("sex", { length: 1 }).notNull().default(""),
  state: char("state", { length: 2 }).notNull().default(""),
}); // names with amount and state
