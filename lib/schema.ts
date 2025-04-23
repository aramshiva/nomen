import {
  mysqlTable,
  varchar,
  char,
  int,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const names = mysqlTable("names", {
  name: varchar("name", { length: 25 }).notNull().primaryKey().default(""),
  sex: char("sex", { length: 1 }).notNull().default(""),
  amount: int("amount").notNull(),
  year: int("year").notNull(),
});

export const namesbyarea = mysqlTable("namesbyarea", {
  name: varchar("name", { length: 25 }).notNull().primaryKey().default(""),
  sex: char("sex", { length: 1 }).notNull().default(""),
  amount: int("amount").notNull(),
  year: int("year").notNull(),
  state: char("state", { length: 2 }).notNull(),
});

export const uniquenames = mysqlTable("uniquenames", {
  name: varchar("name", { length: 25 }).notNull().primaryKey().default(""),
});

export const unique_names = mysqlTable("unique_names", {
  name: varchar("name", { length: 25 }).notNull().primaryKey().default(""),
  amount: int("amount").notNull(),
  sex: char("sex", { length: 1 }).notNull().default(""),
});

export const uniquenamesbyarea = mysqlTable("uniquenamesbyarea", {
  name: varchar("name", { length: 25 }).notNull().primaryKey().default(""),
  amount: int("amount").notNull(),
  sex: char("sex", { length: 1 }).notNull().default(""),
  state: char("state", { length: 2 }).notNull(),
});

export const actuary = mysqlTable("actuary", {
  id: int("id").notNull().primaryKey(),
  gender: mysqlEnum("gender", ["M", "F"]).notNull(),
  year: int("year").notNull(),
  age: int("age").notNull(),
  probability_of_death: int("probability_of_death").notNull(),
}); // actuary table
