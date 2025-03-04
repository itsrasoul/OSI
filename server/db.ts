import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const DATA_DIR = './data';
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const sqlite = new Database(path.join(DATA_DIR, 'db.sqlite'));

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');

// For development, enable verbose logging
if (process.env.NODE_ENV === 'development') {
  sqlite.pragma('journal_mode = WAL'); // Better concurrency
}

export const db = drizzle(sqlite, { schema });

// Test the connection
try {
  sqlite.exec('SELECT 1');
  console.log('Database connection successful');
} catch (err) {
  console.error('Database connection failed:', err);
  process.exit(-1);
}
