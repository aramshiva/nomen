import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./src/drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HST || "localhost",
    user: process.env.DB_USR || "aramsh_name",
    password: process.env.DB_PWD || "",
    database: process.env.DB_NAM || "aramsh_names",
  },
});
