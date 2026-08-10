import db from '../src/db.js';

const name = process.argv[2];
const content = process.argv[3];

if (!name || !content) {
  console.error('Usage: update-db.ts <name> <content>');
  process.exit(1);
}

try {
  db.prepare(`
    INSERT INTO sections (name, content, updated) VALUES (?, ?, datetime('now'))
    ON CONFLICT(name) DO UPDATE SET content = excluded.content, updated = datetime('now')
  `).run(name, content);
  console.log(`Successfully updated section "${name}"`);
} catch (err) {
  console.error('Failed to update database:', err);
  process.exit(1);
}
