import Database from 'better-sqlite3';
const db = new Database('./data/db.sqlite');

// Check current users
console.log('Current users:');
const users = db.prepare('SELECT id, username, email FROM users').all();
console.log(users);

// Check related data (using actual column names from database)
console.log('\nCases:');
const cases = db.prepare('SELECT id, name FROM cases').all();
console.log(cases);

console.log('\nCase Info:');
const caseInfo = db.prepare('SELECT id, case_id FROM case_info').all();
console.log(caseInfo);

console.log('\nCase Images:');
const caseImages = db.prepare('SELECT id, case_id FROM case_images').all();
console.log(caseImages);

console.log('\nCase Documents:');
const caseDocuments = db.prepare('SELECT id, case_id, user_id FROM case_documents').all();
console.log(caseDocuments);

// Delete all data in reverse dependency order
console.log('\nDeleting all case documents...');
const deleteDocs = db.prepare('DELETE FROM case_documents');
console.log(`Deleted ${deleteDocs.run().changes} documents`);

console.log('Deleting all case images...');
const deleteImages = db.prepare('DELETE FROM case_images');
console.log(`Deleted ${deleteImages.run().changes} images`);

console.log('Deleting all case info...');
const deleteInfo = db.prepare('DELETE FROM case_info');
console.log(`Deleted ${deleteInfo.run().changes} case info records`);

console.log('Deleting all cases...');
const deleteCases = db.prepare('DELETE FROM cases');
console.log(`Deleted ${deleteCases.run().changes} cases`);

console.log('Deleting all users...');
const deleteUsers = db.prepare('DELETE FROM users');
console.log(`Deleted ${deleteUsers.run().changes} users`);

// Verify everything is clean
console.log('\n=== VERIFICATION ===');
console.log('Remaining users:', db.prepare('SELECT COUNT(*) as count FROM users').get());
console.log('Remaining cases:', db.prepare('SELECT COUNT(*) as count FROM cases').get());
console.log('Remaining case info:', db.prepare('SELECT COUNT(*) as count FROM case_info').get());
console.log('Remaining case images:', db.prepare('SELECT COUNT(*) as count FROM case_images').get());
console.log('Remaining case documents:', db.prepare('SELECT COUNT(*) as count FROM case_documents').get());

db.close();
console.log('\nDatabase cleanup complete!');
