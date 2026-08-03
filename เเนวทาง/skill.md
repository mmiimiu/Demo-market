# Tech Stack & Competency Matrix

---

## 1. Product & UI/UX Engineering

### Product Management
- **Core Deliverables:** PRD, User Story Map, Acceptance Criteria (Given/When/Then), MoSCoW Prioritization
- **Tooling:** Linear / Jira (backlog), Notion / Confluence (docs), Figma (design handoff)
- **MVP Scoping:**
  - Functional Requirements (FR): สิ่งที่ระบบต้องทำ
  - Non-functional Requirements (NFR): Performance, Security, Scalability, Availability
  - Out of Scope: ระบุชัดเจนเพื่อป้องกัน scope creep

### UI/UX Design
- **Process:** User Research → Wireframe (Lo-fi) → Prototype (Hi-fi) → Usability Test → Handoff
- **Tooling:** Figma (design + prototype), Storybook (live component reference)
- **Design System Layers:** Tokens → Components → Patterns → Page Templates
- **Accessibility:** WCAG 2.1 AA minimum — contrast ratio ≥ 4.5:1, keyboard navigation, ARIA labels

---

## 2. Software Engineering

### System Architecture
- **ADR:** ทุกการตัดสินใจ architectural ที่ hard-to-reverse ต้องมี ADR เก็บใน `/docs/adr/`
- **Database Design:** Normalization (3NF default), Index strategy (covering index, composite index), Schema migration ผ่าน Flyway หรือ Prisma Migrate
- **Multi-tenant Patterns:** Database-per-tenant / Schema-per-tenant / Row-level Security (เลือกตาม tier)

### Full-Stack Tech Stack

| Layer | Primary | Alternative |
|---|---|---|
| Frontend Framework | React + TypeScript | Next.js (SSR/SSG) |
| Styling | Tailwind CSS | CSS Modules |
| State: Server | TanStack Query | SWR |
| State: Global | Zustand | Redux Toolkit |
| Backend Runtime | Node.js (Fastify) | Go, Python (FastAPI) |
| ORM | Prisma | TypeORM, Drizzle |
| Primary Database | PostgreSQL | MySQL |
| Cache | Redis | Memcached |
| Search | Elasticsearch | Typesense (lighter) |
| Message Queue | RabbitMQ | Kafka, BullMQ |
| File Storage | AWS S3 / R2 | MinIO (self-hosted) |
| Auth | JWT + Refresh Token | NextAuth.js, Auth0 |

### System Optimization (Non-functional)

**Caching Strategy — เลือกตาม use case:**

| Pattern | Use Case |
|---|---|
| Cache-aside (Lazy Loading) | Read-heavy, infrequent updates |
| Write-through | Data ต้องสอดคล้องกันสูง |
| Cache Invalidation | เมื่อ update → delete cache key ทันที |

- **Database Performance:** EXPLAIN ANALYZE ก่อน deploy query ใหม่, Connection pooling ผ่าน PgBouncer
- **API Performance:** Cursor-based pagination (ไม่ใช้ OFFSET บน large dataset), Response compression (gzip/brotli), CDN สำหรับ static assets

### Security Engineering

| Area | Standard / Tool |
|---|---|
| OWASP Top 10 | Review checklist ทุก PR ที่แตะ API layer |
| Input Validation | Zod (TypeScript) / Pydantic (Python) — validate ทุก API input |
| SQL Injection | ORM parameterized queries, ห้าม string concatenation |
| XSS | CSP headers, sanitize HTML output (DOMPurify) |
| Auth Token | Access token (15 min) + Refresh token rotation (7 days) |
| Password | bcrypt / argon2 (ห้ามใช้ MD5/SHA1) |
| Secrets | Vault / AWS Secrets Manager, ห้าม commit ใน code |
| RBAC | Permission-based (`resource:action`) ไม่ใช่แค่ role-based |

---

## 3. DevOps & SRE

### Source Control
- **Branching:** Git Flow (main / develop / feature / hotfix)
- **Commit Convention:** Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `BREAKING CHANGE:`
- **PR Requirements:** Description, linked issue/ticket, test coverage proof, self-review checklist

### CI/CD Tooling

| Stage | Tool |
|---|---|
| CI Platform | GitHub Actions / GitLab CI |
| SAST | Semgrep, CodeQL |
| Dependency Scan | Trivy, npm audit |
| Container Build | Docker + BuildKit |
| Container Registry | AWS ECR / GitHub Container Registry |
| Deployment (K8s) | Helm + ArgoCD (GitOps) |
| Deployment (small-scale) | Docker Compose + Watchtower |
| Infrastructure as Code | Terraform / Pulumi |
| Secrets Management | HashiCorp Vault / AWS Secrets Manager |

### Observability Stack

| Function | Tool |
|---|---|
| Metrics | Prometheus + Grafana |
| Logging | Grafana Loki (lightweight) / ELK Stack (enterprise) |
| Tracing | OpenTelemetry SDK + Jaeger |
| Error Tracking | Sentry |
| Uptime Monitoring | Uptime Kuma (self-hosted) / Pingdom |
| On-call Alerting | PagerDuty / OpsGenie |

- **Log Format:** Structured JSON เท่านั้น — `{ timestamp, level, traceId, tenantId, message, ...context }`
- **SLO Tracking:** Error budget dashboard ใน Grafana, alert เมื่อเหลือ budget < 20%

---

## 4. Quality Assurance & Compliance

### Testing Strategy (Testing Trophy)

```
        [E2E]           ← น้อย แต่ครอบ critical user flows
      [Integration]     ← ทุก API endpoint + database interaction
    [Unit Test]         ← Business logic, utility functions
  [Static Analysis]     ← TypeScript, ESLint, Prettier (มากที่สุด)
```

| Level | Coverage Target | Tool | Trigger |
|---|---|---|---|
| Static | 100% codebase | TypeScript + ESLint | Pre-commit |
| Unit | ≥ 80% critical business logic | Jest / Vitest | CI |
| Integration | ทุก API endpoint | Supertest / Pytest | CI |
| E2E | Critical user flows (≥ 5 flows) | Playwright | Pre-deploy Staging |
| Smoke | Health check + core flow | Custom script | Post-deploy |
| Load | P95 < 500ms ที่ 100 concurrent | k6 / Locust | Pre-release |

### Data Management & Governance

- **Backup:** Daily automated backup, retention 30 วัน minimum, geo-redundant storage
- **Restore Test:** ทดสอบ restore จาก backup ทุก quarter (บันทึก RTO จริง)
- **PDPA Compliance:**
  - Data classification: Public / Internal / Confidential / Restricted
  - Consent management: บันทึก timestamp + version ของ consent
  - Right-to-erasure: soft delete + scheduled hard delete pipeline
- **Data Anonymization:** Hash/tokenize PII ทุกชนิดก่อนใช้ใน non-production environment
- **DR Objective:** RTO ≤ 4 ชั่วโมง, RPO ≤ 1 ชั่วโมง
