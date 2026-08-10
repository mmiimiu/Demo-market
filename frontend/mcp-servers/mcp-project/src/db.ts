// Uses Node.js 22+ built-in SQLite — zero native compilation needed
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(path.join(DATA_DIR, 'project.db'));

db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS sections (
    name    TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    updated TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS decisions (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    title     TEXT NOT NULL,
    choice    TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    status    TEXT NOT NULL DEFAULT 'decided',
    created   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'todo',
    priority    TEXT NOT NULL DEFAULT 'medium',
    created     TEXT DEFAULT (datetime('now')),
    updated     TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    tag     TEXT DEFAULT '',
    created TEXT DEFAULT (datetime('now'))
  );
`);

export default db;
