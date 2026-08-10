ข้อมูลที่ AI เห็น — output จาก get_direction
sections context ทั้งหมดของ project

[
  { "name": "vision",      "content": "Building a CTF platform for Thai university students..." },
  { "name": "tech_stack",  "content": "Next.js 14, Go 1.22, PostgreSQL 16, Redis" },
  { "name": "architecture", "content": "Monorepo, REST API, Docker Compose, Nginx" },
  { "name": "goals",        "content": "MVP by end of semester: auth, 5 challenges, scoreboard" }
]

decisions ทำไมถึงตัดสินใจแบบนี้

[
  { "id": 1, "title": "Auth strategy",
    "choice": "JWT + refresh token", "reasoning": "Stateless, works across services", "status": "decided" },
  { "id": 2, "title": "Score storage",
    "choice": "PostgreSQL", "reasoning": "ACID compliance for integrity", "status": "decided" }
]

active_tasks

[
  { "title": "Auth middleware",
    "status": "in_progress",
    "priority": "high" },
  { "title": "Unit tests",
    "status": "todo",
    "priority": "medium" }
]

recent_notes

[
  { "content": "Rate limit per tier?",
    "tag": "question" },
  { "content": "Redis for sessions v2",
    "tag": "idea" }
]

Claude ใช้ข้อมูลนี้ยังไง — ไม่มี UI ให้ user เห็น Claude อ่าน JSON นี้ตอนเริ่ม session แล้วใช้เป็น context ตอบคำถาม เช่น ถามว่า "ใช้ DB อะไร" → Claude รู้จาก sections.tech_stack ทันที ไม่ต้องถาม

ใช้กับ project ที่ทำอยู่แล้ว — 4 ขั้นตอน
1
Run bootstrap script

อ่าน package.json / README.md / directory structure อัตโนมัติ — ถามแค่ 3 คำถาม

node --experimental-sqlite --loader tsx \
  scripts/init.ts --dir /path/to/your-project

2
ให้ Claude วิเคราะห์ codebase แล้ว populate

เปิด Claude Desktop → บอกให้ Claude scan project แล้วเขียน sections เอง

analyze the codebase at /path/to/project, then populate:
- set_section("tech_stack", ...)    ← จาก package.json / imports
- set_section("architecture", ...)  ← จาก folder structure
- add_decision() สำหรับ patterns ที่เห็นใน code
- add_task() สำหรับ TODO comments ทั้งหมด

3
เพิ่ม project-specific tools ตามความต้องการ

แก้ไข src/index.ts เพิ่ม tools ที่เหมาะกับ project ของตัวเอง
scan_todos
get_api_routes
check_env_vars
get_db_schema
run_linter
check_vulnerabilities
4
ปรับ sections ให้ตรง domain

sections ไม่มีโครงสร้างบังคับ — ตั้งชื่อได้เอง เพิ่มตามที่ project ต้องการ
threat_model
api_contracts
test_coverage
known_issues
pricing_model
