import {
  mysqlTable,
  varchar,
  char,
  mysqlEnum,
  int,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const names = mysqlTable("names", {
  name: varchar("name", { length: 255 }).notNull().primaryKey().default(""),
  sex: char("sex", { length: 1 }).notNull().default(""),
  amount: int("amount").notNull().default(0),
  year: int("year").notNull().default(0),
});

export const namesbyarea = mysqlTable("namesbyarea", {
  name: varchar("name", { length: 255 }).notNull().primaryKey().default(""),
  sex: char("sex", { length: 1 }).notNull().default(""),
  amount: int("amount").notNull().default(0),
  year: int("year").notNull().default(0),
  state: char("state", { length: 2 }).notNull().default(""),
});
