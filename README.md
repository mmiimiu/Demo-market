# PrimeRent Marketplace

โครงการถูกแยกส่วนการพัฒนาออกเป็น 2 โฟลเดอร์อิสระในระดับ Root เพื่อรองรับการทำงานแยก Frontend และ Backend:

## โครงสร้างโครงการ
* `/frontend` - Next.js (React / UI)
* `/backend` - Node.js Express (API หลังบ้าน)

## วิธีการรันโครงการในเครื่องพัฒนา (Local)

### 1. วิธีรันฝั่งหน้าบ้าน (Frontend - Next.js)
```bash
cd frontend
npm run dev
```
เปิดใช้งานที่: [http://localhost:3000](http://localhost:3000)

### 2. วิธีรันฝั่งหลังบ้าน (Backend - Node.js Express)
```bash
cd backend
npm install
npm start
```
เซิร์ฟเวอร์จะเปิดที่: [http://localhost:5000](http://localhost:5000)
