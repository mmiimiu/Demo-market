import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import db from './db.js';
const execAsync = promisify(exec);
// ─── HELPER FOR PROJECT PATH ───────────────────────────────────────────────
export function getProjectDir() {
    const row = db.prepare("SELECT content FROM sections WHERE name = 'project_dir'").get();
    if (!row) {
        return process.cwd();
    }
    return row.content;
}
// Common ignore lists for scanning
const IGNORE_DIRS = new Set([
    'node_modules', 'dist', 'build', '.git', '.next', 'out', 'coverage',
    '.idea', '.vscode', 'bin', 'obj', 'vendor', 'tmp'
]);
const IGNORE_EXTS = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
    '.mp4', '.mp3', '.pdf', '.zip', '.tar', '.gz', '.db', '.sqlite',
    '.map', '.woff', '.woff2', '.ttf', '.eot'
]);
// Helper to recursively find files in a directory
function getFilesRecursively(dir, fileList = []) {
    let files = [];
    try {
        files = fs.readdirSync(dir);
    }
    catch {
        return fileList;
    }
    for (const file of files) {
        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        }
        catch {
            continue;
        }
        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.has(file)) {
                getFilesRecursively(fullPath, fileList);
            }
        }
        else {
            const ext = path.extname(file).toLowerCase();
            if (stat.size < 500000 && !IGNORE_EXTS.has(ext)) {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}
export function scanTodos(targetDir, syncToTasks = false) {
    const files = getFilesRecursively(targetDir);
    const todos = [];
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            if (!content.includes('TODO') && !content.includes('FIXME'))
                continue;
            const lines = content.split('\n');
            lines.forEach((lineText, index) => {
                const match = lineText.match(/(?:\/\/|#|\/\*|\*|--)\s*(TODO|FIXME):?\s*(.+)$/i);
                if (match) {
                    const type = match[1].toUpperCase();
                    const text = match[2].trim();
                    const relativePath = path.relative(targetDir, file);
                    todos.push({ type, text, file: relativePath, line: index + 1 });
                }
            });
        }
        catch {
            // Ignore unreadable files
        }
    }
    if (syncToTasks && todos.length > 0) {
        const insertTask = db.prepare(`
      INSERT INTO tasks (title, description, priority, status) VALUES (?, ?, 'medium', 'todo')
    `);
        let added = 0;
        for (const todo of todos) {
            const desc = `${todo.text}\n\nLocated in ${todo.file}:${todo.line}`;
            const existing = db.prepare('SELECT id FROM tasks WHERE description LIKE ?').get(`%${todo.file}:${todo.line}%`);
            if (!existing) {
                insertTask.run(`${todo.type}: ${todo.text.substring(0, 50)}`, desc);
                added++;
            }
        }
    }
    return todos;
}
export function getApiRoutes(targetDir) {
    const routes = [];
    // Check Next.js App Router API directory (app/api/...)
    const appApiDir = path.join(targetDir, 'src/app/api');
    const appApiDirRoot = path.join(targetDir, 'app/api');
    const targetAppApi = fs.existsSync(appApiDir) ? appApiDir : (fs.existsSync(appApiDirRoot) ? appApiDirRoot : null);
    if (targetAppApi) {
        const files = getFilesRecursively(targetAppApi);
        for (const file of files) {
            const basename = path.basename(file);
            if (basename.startsWith('route.')) {
                const relPath = path.relative(targetAppApi, path.dirname(file));
                routes.push({
                    path: `/api/${relPath.replace(/\\/g, '/')}`,
                    file: path.relative(targetDir, file),
                    type: 'Next.js App',
                });
            }
        }
    }
    // Check Next.js Pages Router API directory (pages/api/...)
    const pagesApiDir = path.join(targetDir, 'src/pages/api');
    const pagesApiDirRoot = path.join(targetDir, 'pages/api');
    const targetPagesApi = fs.existsSync(pagesApiDir) ? pagesApiDir : (fs.existsSync(pagesApiDirRoot) ? pagesApiDirRoot : null);
    if (targetPagesApi) {
        const files = getFilesRecursively(targetPagesApi);
        for (const file of files) {
            const ext = path.extname(file);
            if (['.ts', '.js', '.tsx', '.jsx'].includes(ext)) {
                const relPath = path.relative(targetPagesApi, file);
                const routePath = relPath.slice(0, -ext.length).replace(/\\/g, '/');
                routes.push({
                    path: `/api/${routePath === 'index' ? '' : routePath}`,
                    file: path.relative(targetDir, file),
                    type: 'Next.js Pages',
                });
            }
        }
    }
    // Scan Express/Custom route patterns in 'routes/' folder
    const routesDir = path.join(targetDir, 'routes');
    const routesDirSrc = path.join(targetDir, 'src/routes');
    const targetRoutes = fs.existsSync(routesDirSrc) ? routesDirSrc : (fs.existsSync(routesDir) ? routesDir : null);
    if (targetRoutes) {
        try {
            const files = fs.readdirSync(targetRoutes);
            for (const file of files) {
                const ext = path.extname(file);
                if (['.ts', '.js'].includes(ext)) {
                    routes.push({
                        path: `Defined in routes/${file}`,
                        file: path.relative(targetDir, path.join(targetRoutes, file)),
                        type: 'Express / Custom',
                    });
                }
            }
        }
        catch {
            // Skip
        }
    }
    return routes;
}
export function checkEnvVars(targetDir) {
    const envVars = new Map();
    // 1. Check .env.example or .env
    const examplePaths = [
        path.join(targetDir, '.env.example'),
        path.join(targetDir, '.env.local.example'),
        path.join(targetDir, '.env'),
    ];
    let exampleContent = '';
    for (const p of examplePaths) {
        if (fs.existsSync(p)) {
            try {
                exampleContent += '\n' + fs.readFileSync(p, 'utf8');
            }
            catch { }
        }
    }
    const envLines = exampleContent.split('\n');
    for (const line of envLines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
            if (match) {
                const name = match[1];
                envVars.set(name, { name, inExample: true, inCode: false, isSetLocally: false });
            }
        }
    }
    // 2. Scan codebase for process.env.VAR or process.env['VAR']
    const files = getFilesRecursively(targetDir);
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            if (!content.includes('process.env'))
                continue;
            // Regex matches
            const dotRegex = /process\.env\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
            const bracketRegex = /process\.env\[['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]\]/g;
            let match;
            while ((match = dotRegex.exec(content)) !== null) {
                const name = match[1];
                const existing = envVars.get(name) || { name, inExample: false, inCode: false, isSetLocally: false };
                existing.inCode = true;
                envVars.set(name, existing);
            }
            while ((match = bracketRegex.exec(content)) !== null) {
                const name = match[1];
                const existing = envVars.get(name) || { name, inExample: false, inCode: false, isSetLocally: false };
                existing.inCode = true;
                envVars.set(name, existing);
            }
        }
        catch { }
    }
    // 3. Check if variables are set in local .env or current process.env (without leaking values)
    let localEnvContent = '';
    const localEnvPath = path.join(targetDir, '.env');
    if (fs.existsSync(localEnvPath)) {
        try {
            localEnvContent = fs.readFileSync(localEnvPath, 'utf8');
        }
        catch { }
    }
    const localEnvVars = new Set();
    const localLines = localEnvContent.split('\n');
    for (const line of localLines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=(.*)/);
            if (match) {
                const name = match[1];
                const val = match[2].trim();
                if (val)
                    localEnvVars.add(name);
            }
        }
    }
    const report = [];
    envVars.forEach((val, key) => {
        const isSet = localEnvVars.has(key) || !!process.env[key];
        report.push({
            name: key,
            inExample: val.inExample || false,
            inCode: val.inCode || false,
            isSetLocally: isSet,
        });
    });
    return report;
}
export function getDbSchema(targetDir) {
    const schemaFiles = [
        { type: 'Prisma Schema', path: 'prisma/schema.prisma' },
        { type: 'Prisma Schema', path: 'src/prisma/schema.prisma' },
        { type: 'SQL Schema', path: 'schema.sql' },
        { type: 'SQL Schema', path: 'db/schema.sql' },
        { type: 'SQL Schema', path: 'src/db/schema.sql' },
        { type: 'Drizzle Schema', path: 'src/db/schema.ts' },
        { type: 'Drizzle Schema', path: 'db/schema.ts' },
    ];
    for (const item of schemaFiles) {
        const fullPath = path.join(targetDir, item.path);
        if (fs.existsSync(fullPath)) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                return {
                    type: item.type,
                    file: item.path,
                    content: content.substring(0, 10000), // Limit payload length to 10k chars
                };
            }
            catch { }
        }
    }
    return null;
}
// ─── 5. RUN LINTER ─────────────────────────────────────────────────────────
export async function runLinter(targetDir) {
    // Read package.json to see if a lint script exists
    let command = 'npx eslint .';
    const pkgPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg.scripts && pkg.scripts.lint) {
                command = 'npm run lint';
            }
        }
        catch { }
    }
    try {
        const { stdout, stderr } = await execAsync(command, { cwd: targetDir, timeout: 30000 });
        return {
            success: true,
            output: stdout || stderr || 'Lint completed with no output.',
        };
    }
    catch (err) {
        const error = err;
        return {
            success: false,
            output: error.stdout || error.stderr || error.message || 'Linter failed.',
        };
    }
}
// ─── 6. CHECK VULNERABILITIES ──────────────────────────────────────────────
export async function checkVulnerabilities(targetDir) {
    const pkgPath = path.join(targetDir, 'package.json');
    if (!fs.existsSync(pkgPath)) {
        return { output: 'No package.json found, unable to run npm audit.' };
    }
    try {
        const { stdout, stderr } = await execAsync('npm audit', { cwd: targetDir, timeout: 30000 });
        return {
            output: stdout || stderr || 'Vulnerability scan complete. No issues found.',
        };
    }
    catch (err) {
        const error = err;
        // npm audit returns non-zero code if vulnerabilities are found, which is a catch block but not a real command failure
        return {
            output: error.stdout || error.stderr || error.message || 'Vulnerability scan complete.',
        };
    }
}
