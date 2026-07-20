# Code Splitting Rules

> กฎนี้บังคับใช้กับทุกไฟล์ใน `src/` ของโปรเจกต์นี้

---

## 📏 กฎหลัก: ไม่เกิน 150 บรรทัดต่อไฟล์

ทุกไฟล์ `.ts` และ `.tsx` **ต้องมีไม่เกิน 150 บรรทัด** (นับทุกบรรทัด รวม blank lines และ comments)

**ข้อยกเว้น:**
- `src/components/ui/` — shadcn auto-generated code ไม่ต้องแตะ
- `app/api/*/route.ts` — Next.js ต้องการ 1 file ต่อ route แต่ logic ต้องแยกออกไป `lib/`

---

## 🗂️ วิธีแยกไฟล์ (Split Strategy)

### 1. แยกตาม Responsibility (SRP)

แยกโดยถามว่า *"ไฟล์นี้ทำอะไร?"* แล้วแบ่งตาม **หน้าที่ที่แตกต่าง**

```
❌ ไม่ดี: BookingForm.tsx (types + translations + Step1 + Step2 + Step3 ใน file เดียว)

✅ ดี:
BookingForm/
  ├── index.ts          ← barrel re-export
  ├── BookingForm.tsx   ← orchestrator (< 150 lines)
  ├── types.ts          ← interfaces, constants
  ├── translations.ts   ← i18n strings
  ├── Step1Dates.tsx    ← step 1 UI
  ├── Step2PersonalInfo.tsx
  └── Step3Summary.tsx
```

### 2. การตั้งชื่อโฟลเดอร์

| ประเภท | Format | ตัวอย่าง |
|--------|--------|---------|
| Component | PascalCase | `BookingForm/`, `UserProfile/` |
| Service / lib | kebab-case | `line/`, `api-client/` |
| Hook | camelCase | `useAuth/` |

### 3. วิธีแยกแต่ละประเภท

#### Components (.tsx)
```
ComponentName/
  ├── index.ts (or index.tsx)   ← barrel: export { ComponentName }
  ├── ComponentName.tsx          ← main (orchestrator)
  ├── types.ts                   ← Props, interfaces, constants
  ├── translations.ts            ← i18n (ถ้ามี multilang)
  └── sub-components/            ← ถ้ายังยาวเกิน
      └── SubPart.tsx
```

#### Services / Lib (.ts)
```
serviceName/
  ├── index.ts     ← barrel + backward-compat class facade (ถ้าจำเป็น)
  ├── core.ts      ← transport/base logic
  ├── templates.ts ← builders/formatters
  └── types.ts     ← interfaces
```

#### Types
```
lib/types/
  ├── index.ts     ← barrel re-export ทุก domain
  ├── user.ts      ← UserRole, UserProfile, KYCStatus
  ├── property.ts  ← Property, Amenity, PropertyType
  └── communication.ts ← ChatRoom, Message, Ticket
```

---

## 📦 Barrel File (index.ts) — บังคับ

**ทุกโฟลเดอร์ที่แตกออกมา ต้องมี `index.ts`** ที่ re-export ทุกอย่าง เพื่อให้ import path เดิมไม่แตก

```ts
// ✅ components/BookingForm/index.ts
export { BookingForm } from './BookingForm';
export type { BookingFormProps } from './types';
```

```ts
// ✅ ไฟล์เดิม components/BookingForm.tsx (ถ้าต้องเก็บไว้)
// Backward compat shim
export { BookingForm } from './BookingForm/index';
```

---

## 🚫 สิ่งที่ห้ามทำ

| ห้าม | เหตุผล |
|------|--------|
| Define type เดียวกันใน 2 ไฟล์ | ทำให้ type mismatch |
| import แบบ deep path ข้ามโฟลเดอร์ (`../../BookingForm/Step1Dates`) | ให้ import ผ่าน barrel แทน |
| สร้างไฟล์ `utils.ts` ยักษ์ใหญ่ | แยกเป็น `dateUtils.ts`, `formatUtils.ts` |
| ใส่ translation strings ใน component | แยกไว้ `translations.ts` |
| ใส่ business logic ใน route.ts | แยกออกไป `lib/` |

---

## ✅ Checklist ก่อน Push โค้ด

```bash
# ตรวจว่าไม่มีไฟล์เกิน 150 บรรทัด
Get-ChildItem -Recurse -Include "*.ts","*.tsx" src/ |
  Where-Object { $_.FullName -notmatch "ui[\\/]" } |
  ForEach-Object { $c=(Get-Content $_.FullName).Count; if($c -gt 150){Write-Host "$($_.Name): $c lines"} }

# Build ต้องผ่าน
npm run build
```

---

## 📝 สรุปโครงสร้างหลังแยก

```
src/
├── components/
│   ├── BookingForm/          ← แยกออกจาก BookingForm.tsx
│   │   ├── index.ts
│   │   ├── BookingForm.tsx
│   │   ├── types.ts
│   │   ├── translations.ts
│   │   ├── Step1Dates.tsx
│   │   ├── Step2PersonalInfo.tsx
│   │   └── Step3Summary.tsx
│   └── PrimeRentApp/         ← แยกออกจาก PrimeRentApp.tsx
│       ├── types.ts
│       ├── HeroSection.tsx
│       └── ListingsSection.tsx
├── lib/
│   ├── types/
│   │   ├── index.ts          ← barrel
│   │   ├── user.ts
│   │   ├── property.ts
│   │   └── communication.ts
│   └── services/
│       ├── line.ts           ← shim → line/
│       └── line/
│           ├── index.ts      ← barrel + LineService class
│           ├── messaging.ts  ← push/reply/broadcast/verify
│           └── templates.ts  ← flex message builders
```

---

*Last updated: 2026-06-20 | Enforced by team convention, not by linter (yet)*
