import Database from 'better-sqlite3';
const db = new Database('./data/db.sqlite');

// Check table structure
console.log('=== TABLE STRUCTURES ===');
const tables = ['users', 'cases', 'case_info', 'case_images', 'case_documents'];

for (const table of tables) {
  try {
    console.log(`\n${table.toUpperCase()} table structure:`);
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    console.log(columns.map(col => `${col.name} (${col.type})`).join(', '));
  } catch (error) {
    console.log(`Error checking ${table}:`, error.message);
  }
}

// Check data in each table
console.log('\n=== DATA COUNTS ===');
for (const table of tables) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`${table}: ${count.count} records`);
  } catch (error) {
    console.log(`Error counting ${table}:`, error.message);
  }
}

db.close();
