// ==========================================
// 1. IMPORTS & ENVIRONMENT SETUP
// ==========================================
import fs from "fs/promises";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

// Load environment variables from parent .env.local file
dotenv.config({ path: path.resolve("..", ".env.local") });

// ==========================================
// 2. CONFIGURATION & FILE READ
// ==========================================
// Read raw SQL schema file from supabase directory
const rawSql = await fs.readFile(path.resolve("..", "supabase", "schema.sql"), "utf8");

const connectionString = process.env.DATABASE_URL;

// Validate database connection string presence
if (!connectionString) {
  console.error("DATABASE_URL is missing from .env.local");
  process.exit(1);
}

// Instantiate PostgreSQL client with SSL
const client = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ==========================================
// 3. SCHEMA EXECUTION SCRIPT
// ==========================================
// Connect to Supabase PostgreSQL database and execute SQL statements
try {
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  // Execute schema definitions
  await client.query(rawSql);
  console.log("Schema applied successfully.");
} catch (error) {
  console.error("Failed to apply schema:");
  console.error(error);
  process.exit(1);
} finally {
  // Ensure connection pool closes cleanly
  await client.end();
}
