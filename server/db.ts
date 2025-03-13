import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';
import fs from 'fs';

// Use mounted storage on Render.com or local data directory
const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : './data';

function ensureDirectoryExists(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o777 });
    }
    // Test write access
    const testFile = path.join(dir, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch (err: any) {
    console.warn(`Warning: Directory ${dir} is not writable: ${err?.message || err}`);
    return false;
  }
}

// Try both absolute and relative paths
const dirs = [DATA_DIR, './data'];
let usableDir = null;

for (const dir of dirs) {
  if (ensureDirectoryExists(dir)) {
    usableDir = dir;
    break;
  }
}

if (!usableDir) {
  console.error('Fatal: Could not find or create a writable data directory');
  process.exit(1);
}

const dbPath = path.join(usableDir, 'db.sqlite');
console.log(`Using database at: ${dbPath}`);

const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');

// For development, enable WAL mode
if (process.env.NODE_ENV === 'development') {
  sqlite.pragma('journal_mode = WAL'); // Better concurrency
} else {
  // For production, use DELETE journal mode which is more reliable for cloud environments
  sqlite.pragma('journal_mode = DELETE');
}

// Set busy timeout to handle concurrent connections
sqlite.pragma('busy_timeout = 5000');

export const db = drizzle(sqlite, { schema });

// Test the connection
try {
  sqlite.exec('SELECT 1');
  console.log('Database connection successful');
} catch (err) {
  console.error('Database connection failed:', err);
  process.exit(-1);
}
