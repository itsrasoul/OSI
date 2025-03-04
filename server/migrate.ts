import { db } from './db';
import fs from 'fs/promises';
import path from 'path';
import type { Database } from 'better-sqlite3';
import BetterSQLite3 from 'better-sqlite3';

// Get the SQLite client from the Drizzle wrapper
const sqlite = (db as any).$client as Database;

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

// Verify database state after migrations
async function verifyDatabaseState() {
  try {
    // Check if tables exist
    const tables = [
      'cases',
      'case_info',
      'case_images',
      '_migrations'
    ];

    for (const table of tables) {
      const exists = sqlite.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
      console.log(`Table ${table}: ${exists ? 'exists' : 'does not exist'}`);
    }
  } catch (error) {
    console.error('Error verifying database state:', error);
    throw error;
  }
}

// Run migrations and verify state
(async () => {
  try {
    await runMigrations();
    await verifyDatabaseState();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})(); 