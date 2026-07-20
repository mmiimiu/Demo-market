# direction-mcp

MCP server for persistent project direction — context, decisions, tasks, and notes that AI can read and write across every session.

## Quick Start

```bash
npm install
npm run build
```

## Tools Available

| Tool | Description |
|------|-------------|
| `get_direction` | Full project snapshot (call this first) |
| `set_section` | Create/update a named context section |
| `get_section` | Read a specific section |
| `list_sections` | List all sections |
| `delete_section` | Remove a section |
| `add_decision` | Log a decision with reasoning |
| `list_decisions` | List decisions (filterable by status) |
| `update_decision` | Change decision status |
| `add_task` | Add a task |
| `update_task` | Update task status / priority |
| `list_tasks` | List tasks |
| `add_note` | Quick note or brainstorm |
| `list_notes` | List notes (filterable by tag) |
| `search` | Search across all content |

## Connect to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "direction": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/direction-mcp/dist/index.js"]
    }
  }
}
```

Then restart Claude Desktop.

## Connect to Claude Code

```bash
claude mcp add direction -- node /ABSOLUTE/PATH/TO/direction-mcp/dist/index.js
```

## Dev Mode (no build step)

```bash
# Install tsx globally or use npx
npm run dev
```

For Claude Desktop dev mode:
```json
{
  "mcpServers": {
    "direction": {
      "command": "npx",
      "args": ["tsx", "/ABSOLUTE/PATH/TO/direction-mcp/src/index.ts"]
    }
  }
}
```

## Data Storage

SQLite database at `data/project.db` — single file, portable, zero infra.

## Typical Sections to Create

- `vision` — What you're building and why
- `tech_stack` — Languages, frameworks, databases
- `architecture` — System design overview
- `goals` — MVP scope and milestones
- `constraints` — Budget, timeline, team size
- `api_design` — Endpoints and contracts
- `deployment` — Hosting, CI/CD plan
- `security` — Auth, threat model
