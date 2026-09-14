import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Client } = pkg;

async function runSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to DB. Running schema.sql...');
    const schemaPath = path.resolve('../supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await client.end();
  }
}

runSchema();
