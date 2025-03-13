import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';

// Use mounted storage on Render.com or local data directory
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : './data';

// Initialize database connection
const dbPath = path.join(DATA_DIR, 'db.sqlite');
console.log(`Using database at: ${dbPath}`);

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function runMigrations() {
  console.log('Running migrations...');

  try {
    // First, check if the migrations table exists
    try {
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          executed_at TEXT NOT NULL
        );
      `);
    } catch (error) {
      console.error('Failed to create migrations table:', error);
      throw error;
    }

    const migrationsDir = path.join(process.cwd(), 'drizzle');
    const files = await fs.readdir(migrationsDir);
    
    // Filter and sort SQL files
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .filter(file => !file.includes('_journal')) // Exclude journal files
      .sort();

    for (const file of sqlFiles) {
      // Check if migration was already executed
      const migrationExists = sqlite.prepare('SELECT 1 FROM _migrations WHERE name = ?').get(file);
      
      if (migrationExists) {
        console.log(`Migration ${file} already executed, skipping...`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('--')); // Remove empty statements and comments
      
      try {
        // Start a transaction for each migration file
        sqlite.exec('BEGIN TRANSACTION;');
        
        for (const statement of statements) {
          if (statement) {
            try {
              console.log(`Executing statement: ${statement}`);
              sqlite.exec(statement + ';');
            } catch (error) {
              console.error(`Error running statement: ${statement}`);
              console.error(error);
              sqlite.exec('ROLLBACK;');
              throw error;
            }
          }
        }

        // Record the migration with current timestamp
        const now = new Date().toISOString();
        const insertMigration = sqlite.prepare('INSERT INTO _migrations (name, executed_at) VALUES (?, ?)');
        insertMigration.run(file, now);
        
        // Commit the transaction
        sqlite.exec('COMMIT;');
        console.log(`Successfully ran migration: ${file}`);
      } catch (error) {
        console.error(`Failed to run migration ${file}:`, error);
        // Ensure transaction is rolled back
        try {
          sqlite.exec('ROLLBACK;');
        } catch (rollbackError) {
          console.error('Error rolling back transaction:', rollbackError);
        }
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
(async () => {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})(); 