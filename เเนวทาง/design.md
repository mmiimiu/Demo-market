# Architecture & System Design Specification

---

## 1. Frontend & Visual Design System

### 1.1 Component Architecture
- **Pattern:** Atomic Design — Atoms → Molecules → Organisms → Templates → Pages
- **Stack:** React + TypeScript, Storybook สำหรับ Component Documentation & Visual Testing
- **State Management:**
  - Server state: React Query (TanStack Query)
  - Global UI state: Zustand
  - Form state: React Hook Form + Zod

### 1.2 Design Token Specification
```
token/
├── color.json       → --color-primary-500, --color-error-400
├── spacing.json     → --spacing-xs (4px), --spacing-md (16px)
├── typography.json  → --font-size-h1, --font-weight-bold
└── shadow.json      → --shadow-card, --shadow-modal
```
- **Tooling:** Style Dictionary — generate tokens จาก JSON เป็น CSS Variables / SCSS / JS
- **Theme:** Light/Dark mode ผ่าน `data-theme` attribute บน `<html>`

---

## 2. Backend & Database Architecture

### 2.1 Architecture Decision Record (ADR)
- **Location:** `/docs/adr/ADR-NNN-title.md` ใน repository
- **Format ที่ต้องมีครบ:** Status | Context | Decision | Consequences | Alternatives Considered
- **Trigger:** ทุกการตัดสินใจที่ hard to reverse หรือกระทบ > 1 team

### 2.2 API Design

**Protocol Selection:**
| Use Case | Protocol |
|---|---|
| Standard CRUD | REST (JSON:API spec) |
| Complex / nested queries | GraphQL |
| Real-time bidirectional | WebSocket |
| Event streaming | Server-Sent Events (SSE) |

**REST Conventions:**
- URL Versioning: `/api/v1/`, `/api/v2/` (ไม่ใช้ header versioning)
- Response Envelope:
  ```json
  { "data": {}, "meta": { "page": 1, "total": 100 }, "errors": [] }
  ```
- Error Format: `{ "code": "RESOURCE_NOT_FOUND", "message": "...", "field": "email" }`
- Rate Limiting: Redis token bucket per tenant, header `X-RateLimit-Remaining`

### 2.3 Multi-Tenant Architecture

| Pattern | Isolation | Cost | Best For |
|---|---|---|---|
| Database-per-Tenant | สูงสุด | สูง | Enterprise, regulated data |
| Schema-per-Tenant | กลาง | กลาง | Mid-market |
| Shared DB + Row-level Security | ต่ำ | ต่ำสุด | Free/Pro tier, SaaS startup |

- **Quota Enforcement:** Feature flags + usage counters ใน Redis, middleware ตรวจก่อน handler
- **Billing Automation:** Stripe Subscriptions API + Webhook (events: `customer.subscription.updated`, `invoice.payment_failed`)
- **Tenant Context:** inject `tenantId` ผ่าน middleware, ห้าม pass เป็น query param

### 2.4 Access Control (RBAC)

```
User → [Role] → [Permission] → Resource:Action
```

**Schema:**
```
users → user_roles → roles → role_permissions → permissions
```

- Permission format: `resource:action` เช่น `document:read`, `billing:manage`
- Middleware: ตรวจสอบ permission ก่อน handler ทุก endpoint, ห้าม check ใน business logic

### 2.5 Event-Driven Architecture

| Component | Tool (Simple) | Tool (High-throughput) |
|---|---|---|
| Message Broker | RabbitMQ | Apache Kafka |
| Background Jobs | Bull (Redis) | Celery (Python) |
| Scheduled Tasks | node-cron | Kubernetes CronJob |

- **Dead Letter Queue (DLQ):** บังคับทุก queue — failed messages หลัง 3 retries → DLQ → alert on-call
- **Idempotency:** consumer ต้องออกแบบให้รับ duplicate message ได้โดยไม่มีผลข้างเคียง

---

## 3. Infrastructure & CI/CD Pipeline

### 3.1 Git Branching Strategy

```
main ◄── (PR + approval) ── develop ◄── feature/*, fix/*
  ▲                                        │
  └── hotfix/* ────────────────────────────┘
```

- `main`: Production only, merge ผ่าน PR + ≥ 1 approval + passing CI
- `develop`: Integration branch, auto-deploy ไป Staging
- `feature/*`: ตั้งชื่อ `feature/TICKET-123-short-desc`

### 3.2 CI Pipeline (GitHub Actions / GitLab CI)

```
[push] → Lint & Type Check → Security Scan → Unit Test → Integration Test → Build
```

| Stage | Tool | Pass Criteria |
|---|---|---|
| Lint & Format | ESLint, Prettier | 0 errors |
| Type Check | TypeScript `tsc --noEmit` | 0 errors |
| SAST | Semgrep, CodeQL | No HIGH/CRITICAL |
| Dependency Audit | `npm audit`, Trivy | No CRITICAL CVE |
| Unit Test | Jest / Vitest | Coverage ≥ 80% |
| Integration Test | Supertest | All API endpoints pass |
| Container Build | Docker BuildKit | Build succeeds |

### 3.3 CD Pipeline

```
[merge to develop] → Build Image → Push to Registry → Deploy Staging → Smoke Test
[manual approval] → Deploy Production → Health Check → (fail → Auto Rollback)
```

- **Deployment Strategy:** Blue-Green สำหรับ Production, Rolling Update สำหรับ Staging
- **Rollback Trigger:** Health check ไม่ผ่านภายใน 5 นาที → auto rollback อัตโนมัติ
- **Image Tagging:** `registry/app:git-sha` + `registry/app:latest` สำหรับ production

### 3.4 Environment Matrix

| Environment | Branch | Auto-deploy | Manual Approval | Data |
|---|---|---|---|---|
| Development | feature/* | ✓ | ✗ | Seeded fake data |
| Staging | develop | ✓ | ✗ | Anonymized prod copy |
| Production | main | ✗ | ✓ | Real data |

---

## 4. Security & Observability

### 4.1 Data Encryption

- **At-rest:** AES-256, database-level encryption + column-level encryption สำหรับ PII
- **In-transit:** TLS 1.3 บังคับ, HSTS header (`max-age=31536000; includeSubDomains`)
- **Key Management:** AWS KMS หรือ HashiCorp Vault, rotation ทุก 90 วัน
- **Secrets:** ห้าม hardcode, ใช้ environment variables + Vault/Secrets Manager เท่านั้น

### 4.2 Observability (Three Pillars)

| Pillar | Tool | What to Capture |
|---|---|---|
| Metrics | Prometheus + Grafana | Request rate, error rate, latency (P50/P95/P99), saturation |
| Logs | Grafana Loki / ELK | Structured JSON logs: timestamp, level, traceId, tenantId |
| Traces | OpenTelemetry + Jaeger | End-to-end request trace across services |
| Errors | Sentry | Application exceptions + stack trace |
| Uptime | Uptime Kuma | External endpoint monitoring |

### 4.3 SLO / Alerting

| Metric | Target | Alert Threshold |
|---|---|---|
| Uptime | 99.9% (≤ 8.7h/year downtime) | < 99.5% ใน 1h window |
| P95 Latency | < 500ms | > 1000ms ใน 5min window |
| Error Rate | < 1% | > 5% ใน 5min window |

- On-call Response SLA: Critical alert → ตอบรับภายใน 15 นาที, Resolved ภายใน 1 ชั่วโมง
