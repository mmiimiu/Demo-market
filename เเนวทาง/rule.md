# Development Rules & Compliance Policy

---

## 1. File & Code Structure

### File Rules
- **Line Limit:** ≤ 150 บรรทัดต่อไฟล์ — หากเกิน ให้ทำ Modularization สกัด logic ออกไปก่อน commit
- **Single Responsibility:** 1 ไฟล์ = 1 หน้าที่หลัก (controller, service, repository แยกกัน)
- **Naming Convention:**

| Type | Convention | Example |
|---|---|---|
| File / Folder | kebab-case | `user-controller.ts`, `auth-service.ts` |
| React Component | PascalCase | `UserProfile.tsx` |
| Variable / Function | camelCase | `getUserById`, `isAuthenticated` |
| Constant / Enum | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `UserRole.ADMIN` |
| Database Table | snake_case | `user_roles`, `tenant_configs` |

### Folder Structure (Backend)
```
src/
├── modules/          ← feature-based modules
│   └── users/
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── users.repository.ts
│       ├── users.dto.ts
│       └── users.test.ts
├── common/           ← shared utilities, middleware, guards
├── config/           ← environment config, constants
└── main.ts
```

---

## 2. Code & Security Governance

### Code Review Rules
- **Approval Required:** ≥ 1 peer approval ก่อน merge เข้า `develop` หรือ `main`
- **PR Size Limit:** ≤ 400 lines changed per PR — หากเกิน ให้แตก PR
- **Review Checklist (Reviewer ต้องตรวจ):**
  - [ ] Logic ถูกต้อง ไม่มี edge case ตกหล่น
  - [ ] Input validation ครบทุก endpoint
  - [ ] ไม่มี hardcoded secrets หรือ credentials
  - [ ] Error handling ครบ ไม่ expose internal details
  - [ ] Test coverage เพียงพอ

### Security Baseline
- **Hardcoded Secrets:** ห้ามเด็ดขาด — ทุก secret ต้องอยู่ใน `.env` + Vault/Secrets Manager
- **Input Validation:** ทุก API input ต้องผ่าน schema validation (Zod / Joi) ก่อนเข้า business logic
- **SQL/NoSQL Injection:** ใช้ ORM parameterized queries เสมอ, ห้าม string template ใน query
- **Error Response:** ห้าม expose stack trace, internal path, หรือ DB schema ใน error response สู่ client
  ```json
  // ✓ ถูก
  { "code": "VALIDATION_ERROR", "message": "Email is required" }

  // ✗ ผิด
  { "error": "TypeError: Cannot read property 'email' of undefined at /src/..." }
  ```
- **Dependency Audit:** `npm audit --audit-level=high` ต้องผ่านก่อน merge

### API Security Rules
- **Authentication:** ทุก endpoint (ยกเว้น public routes ที่ประกาศชัดเจน) ต้องผ่าน auth middleware
- **Authorization:** ตรวจ permission ที่ middleware layer ไม่ใช่ใน service/controller
- **CORS:** กำหนด whitelist domain ชัดเจน ห้ามใช้ `origin: '*'` ใน production
- **Rate Limiting:** บังคับทุก public endpoint, ค่าเริ่มต้น 100 req/min per IP
- **HTTPS Only:** redirect HTTP → HTTPS, HSTS header บังคับ production

---

## 3. Error Handling & Logging Standards

### Error Handling
- **ห้าม swallow errors** — ทุก catch block ต้องทำอย่างใดอย่างหนึ่ง: log, rethrow, หรือ handle อย่างมีนัย
  ```typescript
  // ✗ ผิด
  try { ... } catch (e) {}

  // ✓ ถูก
  try { ... } catch (e) {
    logger.error('Failed to process payment', { error: e, userId });
    throw new PaymentProcessingError('Payment failed', { cause: e });
  }
  ```
- **Custom Error Classes:** ใช้ typed errors (e.g. `NotFoundError`, `ForbiddenError`) แทน generic `Error`
- **HTTP Status Codes:**

| Situation | Status Code |
|---|---|
| Success (create) | 201 Created |
| Success (no content) | 204 No Content |
| Bad input | 400 Bad Request |
| Unauthenticated | 401 Unauthorized |
| Forbidden | 403 Forbidden |
| Not found | 404 Not Found |
| Rate limited | 429 Too Many Requests |
| Server error | 500 Internal Server Error |

### Logging Standards
- **Format:** Structured JSON เสมอ, ห้าม `console.log` ใน production code
  ```json
  {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "level": "error",
    "traceId": "abc-123",
    "tenantId": "tenant-456",
    "userId": "user-789",
    "message": "Payment processing failed",
    "error": { "code": "STRIPE_CARD_DECLINED" },
    "duration_ms": 234
  }
  ```
- **Log Levels:**

| Level | Use Case |
|---|---|
| `error` | Exception, system failure — ต้อง alert |
| `warn` | Unexpected แต่ไม่ crash — ต้องติดตาม |
| `info` | Business events สำคัญ (user login, payment success) |
| `debug` | Dev/Staging เท่านั้น ห้ามใน production |

- **ห้าม log:** PII (email, phone, national ID), passwords, tokens, credit card numbers

---

## 4. Testing & Deployment Thresholds

### Testing Requirements
- **Unit Test Coverage:** ≥ 80% ของ business logic ทุก module
- **Integration Test:** ทุก API endpoint ต้องมี test (happy path + error cases)
- **Pre-commit (Git Hook):** Linter + Prettier + Type check — ห้าม commit หาก fail
- **Pre-merge (CI):** Unit test + Integration test + Security scan ต้องผ่านทั้งหมด

### Deployment Rules
- **Staging First:** ห้าม deploy production โดยไม่ผ่าน staging
- **Smoke Test:** รัน automated smoke test ทันทีหลัง deploy ทุก environment
- **Auto Rollback:** หาก smoke test ไม่ผ่านภายใน 5 นาที → rollback อัตโนมัติ
- **UAT Sign-off:** ขึ้น production ต้องมีเอกสาร UAT approval จาก stakeholder
- **Deployment Window:** Production deployment ในช่วง low-traffic เท่านั้น (กำหนดตาม product)
- **Feature Flags:** ใช้ feature flags สำหรับ risky features — enable ทีละ % ของ users

### Git Hooks Policy
```
pre-commit  → ESLint, Prettier, TypeScript check
commit-msg  → Conventional Commits format validation
pre-push    → Unit tests (fast subset)
```

---

## 5. Container & Environment Rules

### Docker Rules
- **Base Image:** ใช้ official slim/alpine images เท่านั้น (`node:20-alpine`, `python:3.12-slim`)
- **Non-root User:** ทุก container ต้องรันด้วย non-root user
  ```dockerfile
  RUN addgroup -S appgroup && adduser -S appuser -G appgroup
  USER appuser
  ```
- **Multi-stage Build:** บังคับสำหรับ production image เพื่อลด image size
- **No Secrets in Image:** ห้าม COPY `.env` หรือ credentials เข้า image เด็ดขาด
- **Image Scanning:** Trivy scan ทุก image ใน CI — block หาก CRITICAL CVE

### Environment Variable Rules
- **Required vars:** ระบุใน `.env.example` และ validation schema (เช่น `envalid`) — app ต้อง fail fast หาก var หายไป
- **ห้าม default production values** ใน code เช่น `process.env.DB_URL ?? 'postgresql://localhost'`
- **Naming:** `APP_DB_URL`, `APP_REDIS_URL` — ใช้ prefix เพื่อ namespace

---

## 6. Operations & Maintenance Standards

### Patch & Dependency Management
- **Security Patches:** ตรวจสอบและอัปเดต dependencies อย่างน้อยทุกเดือน
- **Critical CVE:** แก้ทันทีภายใน 48 ชั่วโมง
- **Automated Scanning:** Dependabot / Renovate bot เปิดใช้งานใน repository

### Backup & Recovery
- **Backup Schedule:** Daily automated backup, เก็บ 30 วัน, geo-redundant storage
- **Restore Test:** ทดสอบ restore ทุก quarter บันทึก RTO จริงเปรียบเทียบกับ target
- **DR Drill:** ทดสอบ Disaster Recovery Runbook อย่างน้อยปีละ 2 ครั้ง
- **RTO Target:** ≤ 4 ชั่วโมง | **RPO Target:** ≤ 1 ชั่วโมง

### Alerting SLA

| Severity | Definition | Response Time | Resolve Time |
|---|---|---|---|
| Critical | Production down / data breach | 15 นาที | 1 ชั่วโมง |
| High | Degraded performance / partial outage | 30 นาที | 4 ชั่วโมง |
| Medium | Non-critical service impacted | 2 ชั่วโมง | 24 ชั่วโมง |
| Low | Informational / non-urgent | Next business day | — |
