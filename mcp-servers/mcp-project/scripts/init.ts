import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

// ─── UTILS & SETUP ─────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../data/project.db');

// Ensure db directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Helper for terminal prompt
const askQuestion = (query: string, defaultValue: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${query} [${defaultValue}]: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
};

// ─── COMMAND LINE ARGUMENTS ────────────────────────────────────────────────

const args = process.argv.slice(2);
let targetDir = process.cwd();
let nonInteractive = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' && args[i + 1]) {
    targetDir = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === '--non-interactive') {
    nonInteractive = true;
  }
}

if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(`Error: Directory "${targetDir}" does not exist.`);
  process.exit(1);
}

console.log(`\n🚀 Initializing project context for: ${targetDir}`);

// ─── SCAN PROJECT INFO ─────────────────────────────────────────────────────

let projectName = path.basename(targetDir);
let projectVision = '';
let techStack = 'Not specified';
let detectedArchitecture = 'Standard Layout';

// 1. Parse package.json
const packageJsonPath = path.join(targetDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.name) projectName = pkg.name;
    if (pkg.description) projectVision = pkg.description;

    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    const allDeps = [...deps, ...devDeps];

    if (allDeps.length > 0) {
      techStack = allDeps.slice(0, 10).join(', ');
      if (allDeps.length > 10) techStack += `, and ${allDeps.length - 10} more`;
    }
  } catch (err) {
    console.warn(`⚠️ Warning: Failed to parse package.json: ${(err as Error).message}`);
  }
}

// 2. Parse README.md
const readmePath = path.join(targetDir, 'README.md');
if (fs.existsSync(readmePath)) {
  try {
    const readme = fs.readFileSync(readmePath, 'utf8');
    // Extract first paragraph or heading
    const lines = readme.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const contentLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith('#')) continue; // Skip title headers
      contentLines.push(line);
      if (contentLines.length >= 3) break; // Get top 3 paragraphs/sentences
    }
    if (contentLines.length > 0 && !projectVision) {
      projectVision = contentLines.join(' ');
    }
  } catch (err) {
    console.warn(`⚠️ Warning: Failed to read README.md: ${(err as Error).message}`);
  }
}

if (!projectVision) {
  projectVision = `Building ${projectName} application.`;
}

// 3. Scan directory structure to guess architecture
const rootDirs = fs.readdirSync(targetDir);
const hasPages = rootDirs.includes('pages') || (rootDirs.includes('src') && fs.existsSync(path.join(targetDir, 'src/pages')));
const hasApp = rootDirs.includes('app') || (rootDirs.includes('src') && fs.existsSync(path.join(targetDir, 'src/app')));
const hasControllers = rootDirs.includes('controllers') || (rootDirs.includes('src') && fs.existsSync(path.join(targetDir, 'src/controllers')));
const hasCargo = rootDirs.includes('Cargo.toml');
const hasGoMod = rootDirs.includes('go.mod');

if (hasApp && hasPages) detectedArchitecture = 'Next.js App & Pages Router (Hybrid)';
else if (hasApp) detectedArchitecture = 'Next.js App Router Monorepo/Workspace';
else if (hasPages) detectedArchitecture = 'Next.js Pages Router';
else if (hasControllers) detectedArchitecture = 'MVC (Model-View-Controller) structure';
else if (hasCargo) detectedArchitecture = 'Rust Cargo Workspace / Project';
else if (hasGoMod) detectedArchitecture = 'Go Module Layout';

// ─── RECURSIVE TODO SCANNER ────────────────────────────────────────────────

const IGNORE_DIRS = new Set([
  'node_modules', 'dist', 'build', '.git', '.next', 'out', 'coverage',
  '.idea', '.vscode', 'bin', 'obj', 'vendor', 'tmp'
]);

const IGNORE_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.mp4', '.mp3', '.pdf', '.zip', '.tar', '.gz', '.db', '.sqlite',
  '.map', '.woff', '.woff2', '.ttf', '.eot'
]);

interface TodoTask {
  title: string;
  description: string;
  file: string;
  line: number;
}

const foundTodos: TodoTask[] = [];

function scanDirForTodos(dir: string) {
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return;
  }

  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.has(file)) {
        scanDirForTodos(fullPath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (stat.size < 500000 && !IGNORE_EXTS.has(ext)) { // Ignore files > 500KB or binary extensions
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('TODO') || content.includes('FIXME')) {
            const lines = content.split('\n');
            lines.forEach((lineText, index) => {
              // Look for TODO or FIXME comments
              const match = lineText.match(/(?:\/\/|#|\/\*|\*|--)\s*(TODO|FIXME):?\s*(.+)$/i);
              if (match) {
                const type = match[1].toUpperCase();
                const taskText = match[2].trim();
                const relativePath = path.relative(targetDir, fullPath);
                foundTodos.push({
                  title: `${type}: ${taskText.substring(0, 50)}${taskText.length > 50 ? '...' : ''}`,
                  description: `${taskText}\n\nLocated in ${relativePath}:${index + 1}`,
                  file: relativePath,
                  line: index + 1,
                });
              }
            });
          }
        } catch {
          // Skip unreadable files
        }
      }
    }
  }
}

console.log('🔍 Scanning target directory for TODOs and FIXMEs...');
scanDirForTodos(targetDir);
console.log(`📝 Found ${foundTodos.length} TODO/FIXME items in codebase.`);

// ─── INTERACTIVE SESSION ───────────────────────────────────────────────────

let finalVision = projectVision;
let finalTechStack = techStack;
let finalArchitecture = detectedArchitecture;

if (!nonInteractive && process.stdin.isTTY) {
  console.log('\n✍️  Please refine the project details (press Enter to accept defaults):');
  finalVision = await askQuestion('1. Project Vision/Goal', projectVision);
  finalTechStack = await askQuestion('2. Primary Tech Stack', techStack);
  finalArchitecture = await askQuestion('3. Key Architecture/Deployment', detectedArchitecture);
} else {
  console.log('\n🤖 Running in non-interactive mode. Using detected values.');
}

// ─── POPULATE DATABASE ─────────────────────────────────────────────────────

console.log('\n💾 Writing details to direction-mcp SQLite database...');

// Ensure tables exist (normally db.ts creates them, but let's be safe)
db.exec(`
  CREATE TABLE IF NOT EXISTS sections (
    name    TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    updated TEXT DEFAULT (datetime('now'))
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
`);

// Insert path & basic sections
const upsertSection = db.prepare(`
  INSERT INTO sections (name, content, updated) VALUES (?, ?, datetime('now'))
  ON CONFLICT(name) DO UPDATE SET content = excluded.content, updated = datetime('now')
`);

upsertSection.run('project_dir', targetDir);
upsertSection.run('vision', finalVision);
upsertSection.run('tech_stack', finalTechStack);
upsertSection.run('architecture', finalArchitecture);

// Clear old tasks if starting fresh or keep them?
// Let's check if the user has tasks. For a clean init, let's keep existing tasks but insert new TODOs if not present.
const insertTask = db.prepare(`
  INSERT INTO tasks (title, description, priority, status) VALUES (?, ?, ?, 'todo')
`);

let addedTasksCount = 0;
for (const todo of foundTodos) {
  // Check if a task with the same description already exists
  const existing = db.prepare('SELECT id FROM tasks WHERE description LIKE ?').get(`%${todo.file}:${todo.line}%`);
  if (!existing) {
    insertTask.run(todo.title, todo.description, 'medium');
    addedTasksCount++;
  }
}

console.log(`✅ Project initialization complete!`);
console.log(`- Project Path: ${targetDir}`);
console.log(`- Vision: ${finalVision}`);
console.log(`- Tech Stack: ${finalTechStack}`);
console.log(`- Architecture: ${finalArchitecture}`);
console.log(`- Added ${addedTasksCount} new tasks from codebase TODOs.`);
console.log(`\nNow you can start the direction-mcp server to read/write this context!`);
