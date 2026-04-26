/**
 * Import script — reads JSON files from backup/ and inserts them into a new MongoDB database.
 * Usage:
 *   NEW_MONGODB_URI="mongodb+srv://..." node import.js
 *
 * By default it skips documents that already exist (_id collision).
 * Set CLEAR_BEFORE_IMPORT=true to wipe each collection first.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const NEW_URI = process.env.NEW_MONGODB_URI;
if (!NEW_URI) {
  console.error('\n❌  Pass NEW_MONGODB_URI as an environment variable.\n');
  console.error('   NEW_MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/sellmix" node import.js\n');
  process.exit(1);
}

const BACKUP_DIR = path.join(__dirname, 'backup');
const CLEAR = process.env.CLEAR_BEFORE_IMPORT === 'true';

const COLLECTIONS = [
  { file: 'categories.json', name: 'categories' },
  { file: 'products.json',   name: 'products' },
  { file: 'users.json',      name: 'users' },
  { file: 'orders.json',     name: 'orders' },
];

async function run() {
  console.log('\n🔗  Connecting to new database…');
  await mongoose.connect(NEW_URI, { dbName: 'sellmix' });
  const db = mongoose.connection.db;
  console.log('✅  Connected.\n');

  for (const { file, name } of COLLECTIONS) {
    const filePath = path.join(BACKUP_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️   ${file} not found — skipping ${name}`);
      continue;
    }

    const docs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const col = db.collection(name);

    if (CLEAR) {
      await col.deleteMany({});
      console.log(`🗑️   Cleared ${name}`);
    }

    if (docs.length === 0) {
      console.log(`ℹ️   ${name}: empty file, nothing to import`);
      continue;
    }

    // ordered: false so a duplicate _id doesn't abort the whole batch
    let inserted = 0;
    let skipped = 0;
    try {
      const res = await col.insertMany(docs, { ordered: false });
      inserted = res.insertedCount;
    } catch (err) {
      if (err.code === 11000 || err.name === 'MongoBulkWriteError') {
        inserted = err.result?.nInserted ?? err.insertedCount ?? 0;
        skipped = docs.length - inserted;
      } else {
        throw err;
      }
    }

    const skipNote = skipped > 0 ? ` (${skipped} skipped — already exist)` : '';
    console.log(`✅  ${name}: imported ${inserted}/${docs.length}${skipNote}`);
  }

  await mongoose.disconnect();
  console.log('\n🎉  Import complete!\n');
}

run().catch((err) => {
  console.error('\n❌  Import failed:', err.message);
  process.exit(1);
});
