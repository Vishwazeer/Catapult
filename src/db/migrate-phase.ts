import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log('Running migration to add missing columns to leads table...');
  try {
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS phase text DEFAULT 'Incoming';`;
    console.log('Added column "phase" successfully.');
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_notes text;`;
    console.log('Added column "call_notes" successfully.');
    console.log('Migration completed cleanly!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

migrate();
