// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Client } = pkg;

// ==========================================
// 2. SCHEMA EXECUTION RUNNER
// ==========================================
// Connects to PostgreSQL using DATABASE_URL and executes schema.sql
async function runSchema() {
  // Initialize client with connection string from environment
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Establish database connection
    await client.connect();
    console.log('Connected to DB. Running schema.sql...');

    // Read and run schema script
    const schemaPath = path.resolve('../supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);

    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    // Cleanly close database connection
    await client.end();
  }
}

// ==========================================
// 3. EXECUTION TRIGGER
// ==========================================
runSchema();
