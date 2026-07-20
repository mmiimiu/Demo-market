import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import db from './db.js';
import {
  getProjectDir,
  scanTodos,
  getApiRoutes,
  checkEnvVars,
  getDbSchema,
  runLinter,
  checkVulnerabilities
} from './project-scanner.js';

// ─── SERVER INIT ───────────────────────────────────────────────────────────

const server = new Server(
  { name: 'direction-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// ─── HELPERS ───────────────────────────────────────────────────────────────

const ok = (data: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
});

// ─── TOOL DEFINITIONS ──────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // ── Overview ──
    {
      name: 'get_direction',
      description:
        'Get the FULL project direction: all sections, decisions, active tasks, recent notes. ' +
        'Call this first to understand the project context before anything else.',
      inputSchema: { type: 'object', properties: {} },
    },

    // ── Sections ──
    {
      name: 'set_section',
      description:
        'Create or update a named context section. ' +
        'Common names: vision, tech_stack, architecture, goals, constraints, api_design, deployment.',
      inputSchema: {
        type: 'object',
        properties: {
          name:    { type: 'string', description: 'Section name in snake_case' },
          content: { type: 'string', description: 'Content (markdown supported)' },
        },
        required: ['name', 'content'],
      },
    },
    {
      name: 'get_section',
      description: 'Read a specific section by name.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
    },
    {
      name: 'list_sections',
      description: 'List all section names and their last-updated timestamps.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'delete_section',
      description: 'Delete a section by name.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
    },

    // ── Decisions ──
    {
      name: 'add_decision',
      description: 'Log a project decision with its reasoning so AI never asks the same question twice.',
      inputSchema: {
        type: 'object',
        properties: {
          title:     { type: 'string', description: 'Short title of what was decided' },
          choice:    { type: 'string', description: 'What was chosen (e.g. "PostgreSQL over MongoDB")' },
          reasoning: { type: 'string', description: 'Why this choice was made' },
          status: {
            type: 'string',
            enum: ['decided', 'in_review', 'rejected'],
            description: 'Default: decided',
          },
        },
        required: ['title', 'choice', 'reasoning'],
      },
    },
    {
      name: 'list_decisions',
      description: 'List all decisions, optionally filtered by status.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['decided', 'in_review', 'rejected'],
          },
        },
      },
    },
    {
      name: 'update_decision',
      description: 'Update the status of a decision by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id:     { type: 'number' },
          status: { type: 'string', enum: ['decided', 'in_review', 'rejected'] },
        },
        required: ['id', 'status'],
      },
    },

    // ── Tasks ──
    {
      name: 'add_task',
      description: 'Add a task to the project backlog.',
      inputSchema: {
        type: 'object',
        properties: {
          title:       { type: 'string' },
          description: { type: 'string' },
          priority:    { type: 'string', enum: ['low', 'medium', 'high'], description: 'Default: medium' },
        },
        required: ['title'],
      },
    },
    {
      name: 'update_task',
      description: 'Update task status or priority by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id:       { type: 'number' },
          status:   { type: 'string', enum: ['todo', 'in_progress', 'done'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          title:    { type: 'string' },
        },
        required: ['id'],
      },
    },
    {
      name: 'list_tasks',
      description: 'List tasks. Filter by status to see just todo / in_progress / done.',
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        },
      },
    },

    // ── Notes ──
    {
      name: 'add_note',
      description: 'Add a quick note, idea, or brainstorm entry with an optional tag.',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          tag:     { type: 'string', description: 'e.g. idea, risk, question, reference' },
        },
        required: ['content'],
      },
    },
    {
      name: 'list_notes',
      description: 'List notes, optionally filtered by tag.',
      inputSchema: {
        type: 'object',
        properties: {
          tag:   { type: 'string' },
          limit: { type: 'number', description: 'Max items to return (default 20)' },
        },
      },
    },

    // ── Search ──
    {
      name: 'search',
      description: 'Full-text search across all sections, decisions, tasks, and notes.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },

    // ── Project Scanning Tools ──
    {
      name: 'scan_todos',
      description: 'Scan the project codebase for TODO and FIXME comments. Can optionally sync to tasks database.',
      inputSchema: {
        type: 'object',
        properties: {
          syncToTasks: { type: 'boolean', description: 'If true, updates the tasks database with the new TODOs.' },
        },
      },
    },
    {
      name: 'get_api_routes',
      description: 'Get all API routes defined in the project by scanning directories like app/api, pages/api or routes/ folders.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'check_env_vars',
      description: 'Scan files for environment variables (process.env) and verify if they are documented and set locally.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'get_db_schema',
      description: 'Locate and retrieve the database schema file (Prisma, SQL, Drizzle, etc.).',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'run_linter',
      description: 'Execute npm run lint or npx eslint to verify the project has clean code.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'check_vulnerabilities',
      description: 'Execute npm audit to scan dependencies for known vulnerabilities.',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

// ─── TOOL HANDLERS ─────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;

  switch (name) {

    // ── Overview ──────────────────────────────────────────────────────────

    case 'get_direction': {
      const sections  = db.prepare('SELECT * FROM sections ORDER BY name').all();
      const decisions = db.prepare('SELECT * FROM decisions ORDER BY created DESC').all();
      const tasks     = db.prepare(
        "SELECT * FROM tasks WHERE status != 'done' ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, created"
      ).all();
      const notes = db.prepare('SELECT * FROM notes ORDER BY created DESC LIMIT 10').all();
      return ok({ sections, decisions, active_tasks: tasks, recent_notes: notes });
    }

    // ── Sections ──────────────────────────────────────────────────────────

    case 'set_section': {
      const { name: n, content } = args as { name: string; content: string };
      db.prepare(`
        INSERT INTO sections (name, content, updated) VALUES (?, ?, datetime('now'))
        ON CONFLICT(name) DO UPDATE SET content = excluded.content, updated = datetime('now')
      `).run(n, content);
      return ok({ ok: true, section: n });
    }

    case 'get_section': {
      const { name: n } = args as { name: string };
      const row = db.prepare('SELECT * FROM sections WHERE name = ?').get(n);
      if (!row) throw new McpError(ErrorCode.InvalidRequest, `Section "${n}" not found`);
      return ok(row);
    }

    case 'list_sections': {
      const rows = db.prepare('SELECT name, updated FROM sections ORDER BY name').all();
      return ok(rows);
    }

    case 'delete_section': {
      const { name: n } = args as { name: string };
      db.prepare('DELETE FROM sections WHERE name = ?').run(n);
      return ok({ ok: true, deleted: n });
    }

    // ── Decisions ─────────────────────────────────────────────────────────

    case 'add_decision': {
      const { title, choice, reasoning, status = 'decided' } = args as {
        title: string; choice: string; reasoning: string; status?: string;
      };
      const r = db.prepare(
        'INSERT INTO decisions (title, choice, reasoning, status) VALUES (?, ?, ?, ?)'
      ).run(title, choice, reasoning, status);
      return ok({ ok: true, id: r.lastInsertRowid });
    }

    case 'list_decisions': {
      const { status } = args as { status?: string };
      const rows = status
        ? db.prepare('SELECT * FROM decisions WHERE status = ? ORDER BY created DESC').all(status)
        : db.prepare('SELECT * FROM decisions ORDER BY created DESC').all();
      return ok(rows);
    }

    case 'update_decision': {
      const { id, status } = args as { id: number; status: string };
      db.prepare('UPDATE decisions SET status = ? WHERE id = ?').run(status, id);
      return ok({ ok: true, id });
    }

    // ── Tasks ─────────────────────────────────────────────────────────────

    case 'add_task': {
      const { title, description = '', priority = 'medium' } = args as {
        title: string; description?: string; priority?: string;
      };
      const r = db.prepare(
        'INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)'
      ).run(title, description, priority);
      return ok({ ok: true, id: r.lastInsertRowid });
    }

    case 'update_task': {
      const { id, status, priority, title } = args as {
        id: number; status?: string; priority?: string; title?: string;
      };
      if (status)   db.prepare("UPDATE tasks SET status = ?, updated = datetime('now') WHERE id = ?").run(status, id);
      if (priority) db.prepare("UPDATE tasks SET priority = ?, updated = datetime('now') WHERE id = ?").run(priority, id);
      if (title)    db.prepare("UPDATE tasks SET title = ?, updated = datetime('now') WHERE id = ?").run(title, id);
      return ok({ ok: true, id });
    }

    case 'list_tasks': {
      const { status } = args as { status?: string };
      const rows = status
        ? db.prepare(
            "SELECT * FROM tasks WHERE status = ? ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, created"
          ).all(status)
        : db.prepare(
            "SELECT * FROM tasks ORDER BY CASE status WHEN 'in_progress' THEN 0 WHEN 'todo' THEN 1 ELSE 2 END, CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END"
          ).all();
      return ok(rows);
    }

    // ── Notes ─────────────────────────────────────────────────────────────

    case 'add_note': {
      const { content, tag = '' } = args as { content: string; tag?: string };
      const r = db.prepare('INSERT INTO notes (content, tag) VALUES (?, ?)').run(content, tag);
      return ok({ ok: true, id: r.lastInsertRowid });
    }

    case 'list_notes': {
      const { tag, limit = 20 } = args as { tag?: string; limit?: number };
      const rows = tag
        ? db.prepare('SELECT * FROM notes WHERE tag = ? ORDER BY created DESC LIMIT ?').all(tag, limit)
        : db.prepare('SELECT * FROM notes ORDER BY created DESC LIMIT ?').all(limit);
      return ok(rows);
    }

    // ── Search ────────────────────────────────────────────────────────────

    case 'search': {
      const { query } = args as { query: string };
      const q = `%${query}%`;
      const sections  = db.prepare('SELECT \'section\' as type, name, content FROM sections WHERE name LIKE ? OR content LIKE ?').all(q, q);
      const decisions = db.prepare('SELECT \'decision\' as type, id, title, choice, reasoning FROM decisions WHERE title LIKE ? OR choice LIKE ? OR reasoning LIKE ?').all(q, q, q);
      const tasks     = db.prepare('SELECT \'task\' as type, id, title, description, status FROM tasks WHERE title LIKE ? OR description LIKE ?').all(q, q);
      const notes     = db.prepare('SELECT \'note\' as type, id, content, tag FROM notes WHERE content LIKE ?').all(q);
      return ok({ query, results: [...sections, ...decisions, ...tasks, ...notes] });
    }

    // ── Project Scanning Tools ──────────────────────────────────────────

    case 'scan_todos': {
      const { syncToTasks = false } = args as { syncToTasks?: boolean };
      const dir = getProjectDir();
      const todos = scanTodos(dir, syncToTasks);
      return ok({ count: todos.length, todos });
    }

    case 'get_api_routes': {
      const dir = getProjectDir();
      const routes = getApiRoutes(dir);
      return ok({ count: routes.length, routes });
    }

    case 'check_env_vars': {
      const dir = getProjectDir();
      const report = checkEnvVars(dir);
      return ok({ variables: report });
    }

    case 'get_db_schema': {
      const dir = getProjectDir();
      const schema = getDbSchema(dir);
      if (!schema) {
        return ok({ message: 'No database schema file detected in project.' });
      }
      return ok(schema);
    }

    case 'run_linter': {
      const dir = getProjectDir();
      const result = await runLinter(dir);
      return ok(result);
    }

    case 'check_vulnerabilities': {
      const dir = getProjectDir();
      const result = await checkVulnerabilities(dir);
      return ok(result);
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});

// ─── RESOURCES ─────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'direction://overview',
      name: 'Project Direction Overview',
      description: 'Sections, decisions, and active tasks in one snapshot',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  if (req.params.uri !== 'direction://overview') {
    throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${req.params.uri}`);
  }
  const sections  = db.prepare('SELECT * FROM sections ORDER BY name').all();
  const decisions = db.prepare('SELECT * FROM decisions ORDER BY created DESC').all();
  const tasks     = db.prepare("SELECT * FROM tasks WHERE status != 'done'").all();
  return {
    contents: [{
      uri: 'direction://overview',
      mimeType: 'application/json',
      text: JSON.stringify({ sections, decisions, active_tasks: tasks }, null, 2),
    }],
  };
});

// ─── START ─────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[direction-mcp] running on stdio ✓');
