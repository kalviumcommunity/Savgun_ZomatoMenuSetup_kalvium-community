import fs from "fs/promises";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve("..", ".env.local") });

const rawSql = await fs.readFile(path.resolve("..", "supabase", "schema.sql"), "utf8");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing from .env.local");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  await client.query(rawSql);
  console.log("Schema applied successfully.");
} catch (error) {
  console.error("Failed to apply schema:");
  console.error(error);
  process.exit(1);
} finally {
  await client.end();
}
