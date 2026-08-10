import type {
  AdminUser, AgentKYCRequest, ScamReport, RefundRequest,
  LeaseDocument, SecurityEvent, DataFieldClassification,
  InsiderTradingAlert, InsiderPolicy, DeployLog, AlertConfig,
  AgentPerformance
} from '@/lib/types/admin-types';

export const DEFAULT_USERS: AdminUser[] = [
  { id: 'u_001', displayName: 'สมชาย มีทรัพย์', email: 'somchai@email.com', role: 'landlord', status: 'active', kycStatus: 'verified', createdAt: '2025-01-12', lastActive: '2026-07-06' },
  { id: 'u_002', displayName: 'อนันต์ ทำดี', email: 'anant@email.com', role: 'renter', status: 'active', kycStatus: 'verified', createdAt: '2025-02-18', lastActive: '2026-07-06' },
  { id: 'u_003', displayName: 'John Smith', email: 'john@primerent.com', role: 'agent', status: 'active', kycStatus: 'verified', createdAt: '2025-03-05', lastActive: '2026-07-05' },
  { id: 'u_004', displayName: 'วรรณา สุขใจ', email: 'wanna@email.com', role: 'agent', status: 'suspended', kycStatus: 'pending', createdAt: '2025-11-20', lastActive: '2026-06-15' },
  { id: 'u_005', displayName: 'Fake User', email: 'fake@scam.com', role: 'user', status: 'banned', kycStatus: 'rejected', createdAt: '2026-06-01', lastActive: '2026-06-05' },
  { id: 'u_006', displayName: 'มานพ ขายดี', email: 'manop@sales.com', role: 'user', status: 'pending', kycStatus: 'pending', createdAt: '2026-07-01', lastActive: '2026-07-06' },
  { id: 'u_007', displayName: 'พิมพ์พร รัตนากร', email: 'pimporn@email.com', role: 'renter', status: 'active', kycStatus: 'verified', createdAt: '2025-06-10', lastActive: '2026-07-05' },
  { id: 'u_008', displayName: 'สุดาพร พุ่มใจ', email: 'sudaporn@email.com', role: 'renter', status: 'active', kycStatus: 'unverified', createdAt: '2026-04-20', lastActive: '2026-07-04' },
];

export const DEFAULT_AGENTS: AgentKYCRequest[] = [
  {
    id: 'req_001', userId: 'u_004', name: 'วรรณา สุขใจ', email: 'wanna@email.com',
    licenseNumber: 'AGN-4458-12', brokerName: 'บริษัท ทรัพย์แลนด์สเคป จำกัด',
    ndidStatus: 'verified', livenessScore: 98.4, submittedAt: '2026-07-05',
    documents: [
      { type: 'ID Card', filename: 'id_card_wanna.png', size: '1.2 MB' },
      { type: 'Agent License', filename: 'license_wanna.pdf', size: '2.4 MB' }
    ],
    criminalCheckStatus: 'clear',
    criminalCheckPaid: true,
    criminalCheckDocument: 'criminal_check_report_wanna.pdf',
    criminalCheckDate: '2026-07-05'
  },
  {
    id: 'req_002', userId: 'u_006', name: 'มานพ ขายดี', email: 'manop@sales.com',
    licenseNumber: 'AGN-1102-99', brokerName: 'อิสระ (Freelance)',
    ndidStatus: 'pending', livenessScore: 84.1, submittedAt: '2026-07-06',
    documents: [
      { type: 'ID Card', filename: 'id_card_manop.png', size: '1.4 MB' }
    ],
    criminalCheckStatus: 'pending',
    criminalCheckPaid: false,
    criminalCheckDocument: 'waiting_webhook_payload.json',
    criminalCheckDate: '2026-07-06'
  }
];

export const DEFAULT_REPORTS: ScamReport[] = [
  { id: 'rep_001', reporterName: 'สมชาย มีทรัพย์', targetType: 'listing', targetId: 'prop_001', reason: 'ราคาลงประกาศไม่สอดคล้องกับความจริง / สัญญาปลอม', status: 'open', createdAt: '2026-07-04', evidence: 'screenshot_proof.jpg' },
  { id: 'rep_002', reporterName: 'มาลี บุญมา', targetType: 'user', targetId: 'u_005', reason: 'พฤติกรรมพยายามสแปมแชทส่งลิงก์หลอกลวงดูดเงิน', status: 'open', createdAt: '2026-07-05', evidence: 'chat_history.pdf' },
  { id: 'rep_003', reporterName: 'พิมพ์พร รัตนากร', targetType: 'review', targetId: 'rev_012', reason: 'รีวิวปลอม สร้างบัญชีปลอมเพื่อกดดาว', status: 'open', createdAt: '2026-07-06', evidence: 'fake_reviews_log.xlsx' },
];

export const DEFAULT_REFUNDS: RefundRequest[] = [
  { id: 'ref_001', tenantId: 'u_002', tenantName: 'อนันต์ ทำดี', ownerId: 'u_001', ownerName: 'สมชาย มีทรัพย์', amount: 15000, reason: 'ห้องชำรุดก่อนเข้าอยู่จริง สัญญาเช่าถูกยกเลิก', type: 'deposit', status: 'pending', createdAt: '2026-07-04' },
  { id: 'ref_002', tenantId: 'u_008', tenantName: 'สุดาพร พุ่มใจ', ownerId: 'u_001', ownerName: 'สมชาย มีทรัพย์', amount: 8000, reason: 'ยินยอมยกเลิกสัญญาและชำระค่าธรรมเนียมบางส่วน', type: 'commission', status: 'admin_approved', adminApprovedBy: 'Admin User', adminApprovedAt: '2026-07-05T10:00:00Z', createdAt: '2026-07-03' },
  { id: 'ref_003', tenantId: 'u_007', tenantName: 'พิมพ์พร รัตนากร', ownerId: 'u_001', ownerName: 'สมชาย มีทรัพย์', amount: 25000, reason: 'ประกันถูกหักเกินกว่าความเสียหายจริง', type: 'deposit', status: 'pending', createdAt: '2026-07-06' },
];

export const DEFAULT_DOCS: LeaseDocument[] = [
  { id: 'doc_001', propertyName: 'Ideo Mix Sukhumvit (ห้อง 102)', tenantName: 'อนันต์ ทำดี', ownerName: 'สมชาย มีทรัพย์', status: 'Active Lease', signaturesCount: 3, updatedAt: '2026-06-20', documentType: 'contract', pdpaCompliant: true, retentionExpiry: '2031-06-20' },
  { id: 'doc_002', propertyName: 'Condo Asoke Place (ห้อง 1209)', tenantName: 'นิรันดร์ ผลดี', ownerName: 'เกรียงไกร เลิศล้ำ', status: 'Pending Signatures', signaturesCount: 1, updatedAt: '2026-07-05', documentType: 'contract', pdpaCompliant: true, retentionExpiry: '2031-07-05' },
  { id: 'doc_003', propertyName: 'วรรณา สุขใจ - KYC Documents', tenantName: '-', ownerName: '-', status: 'Archived', signaturesCount: 0, updatedAt: '2026-07-05', documentType: 'kyc', pdpaCompliant: true, retentionExpiry: '2029-07-05' },
  { id: 'doc_004', propertyName: 'Ideo Mix Sukhumvit (ห้อง 102) - Checklist', tenantName: 'อนันต์ ทำดี', ownerName: 'สมชาย มีทรัพย์', status: 'Completed', signaturesCount: 2, updatedAt: '2026-06-22', documentType: 'checklist', pdpaCompliant: true, retentionExpiry: '2031-06-22' },
];

export const DEFAULT_SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'sec_001', type: 'failed_login', ipAddress: '203.154.89.12', userId: 'u_005', description: 'Failed login attempt 5 ครั้งติดต่อกัน บัญชี fake@scam.com', severity: 'high', timestamp: new Date(Date.now() - 1800000).toISOString(), resolved: false },
  { id: 'sec_002', type: 'suspicious_ip', ipAddress: '185.220.101.42', description: 'IP จาก TOR exit node พยายาม access /api/admin', severity: 'critical', timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: false },
  { id: 'sec_003', type: 'idor_attempt', ipAddress: '192.168.1.100', userId: 'u_006', description: 'พยายามเข้าถึง user profile ของผู้อื่นผ่าน /api/users/u_001', severity: 'high', timestamp: new Date(Date.now() - 5400000).toISOString(), resolved: false },
  { id: 'sec_004', type: 'rate_limit', ipAddress: '103.45.67.89', description: 'Rate limit exceeded: 500 requests/min จาก IP เดียว ที่ /api/listings', severity: 'medium', timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: true, resolvedBy: 'Admin User' },
  { id: 'sec_005', type: 'brute_force', ipAddress: '45.33.12.88', description: 'Brute force attack detected: 200+ login attempts ใน 10 นาที', severity: 'critical', timestamp: new Date(Date.now() - 900000).toISOString(), resolved: false },
];

export const DEFAULT_CLASSIFICATIONS: DataFieldClassification[] = [
  { id: 'f_001', field: 'users.nationalId', description: 'เลขบัตรประชาชน', classification: 'Sensitive', owner: 'Super Admin', encrypted: true, accessRoles: ['superadmin'] },
  { id: 'f_002', field: 'users.phoneNumber', description: 'เบอร์โทรศัพท์', classification: 'Internal', owner: 'Admin', encrypted: true, accessRoles: ['admin', 'superadmin'] },
  { id: 'f_003', field: 'contracts.signatures', description: 'ลายเซ็นดิจิทัล', classification: 'Sensitive', owner: 'Super Admin', encrypted: true, accessRoles: ['superadmin'] },
  { id: 'f_004', field: 'properties.location', description: 'ที่ตั้งทรัพย์สิน', classification: 'Public', owner: 'System', encrypted: false, accessRoles: ['user', 'renter', 'landlord', 'agent', 'admin', 'superadmin'] },
  { id: 'f_005', field: 'users.email', description: 'อีเมลผู้ใช้', classification: 'Internal', owner: 'Admin', encrypted: false, accessRoles: ['admin', 'superadmin'] },
  { id: 'f_006', field: 'payments.bankAccount', description: 'เลขบัญชีธนาคาร', classification: 'Sensitive', owner: 'Super Admin', encrypted: true, accessRoles: ['superadmin'] },
];

export const DEFAULT_INSIDER_ALERTS: InsiderTradingAlert[] = [
  { id: 'ins_001', type: 'PriceManipulation', description: 'ราคาลดลง 60% ก่อนทำสัญญาทันที (BTS Onnut ห้อง 77)', severity: 'High', status: 'active', createdAt: '2026-07-06' },
  { id: 'ins_002', type: 'AgentSelfDealing', description: 'นายหน้า John Smith ทำเรื่องเช่าห้องของตนเองเพื่อรับค่าคอมมิชชัน', severity: 'Medium', status: 'active', createdAt: '2026-07-05' },
  { id: 'ins_003', type: 'DataMisuse', description: 'พนักงานภายในดึงข้อมูลราคาเฉลี่ยทุกเขตก่อนเปิดเผยรายงาน', severity: 'High', status: 'active', createdAt: '2026-07-04' },
];

export const DEFAULT_POLICIES: InsiderPolicy[] = [
  {
    id: 'pol_001', title: 'นโยบายห้ามใช้ข้อมูลภายในเพื่อประโยชน์ส่วนตน',
    description: 'พนักงานและผู้ดูแลระบบทุกคนห้ามใช้ข้อมูลที่ได้จากแพลตฟอร์ม (ราคาตลาด, ข้อมูลผู้เช่า, แนวโน้มราคา) เพื่อการลงทุนอสังหาริมทรัพย์ส่วนตัวหรือให้บุคคลที่สาม',
    version: '2.1', effectiveDate: '2026-01-01', lastUpdated: '2026-06-15', status: 'active',
    acknowledgedBy: ['Admin User', 'Super Admin']
  },
  {
    id: 'pol_002', title: 'นโยบายป้องกันผลประโยชน์ทับซ้อนนายหน้า',
    description: 'นายหน้าห้ามทำสัญญาเช่าห้องของตนเองหรือญาติสายตรงผ่านระบบเพื่อรับค่าคอมมิชชัน ทุกธุรกรรมที่เข้าข่ายจะถูก flag อัตโนมัติ',
    version: '1.0', effectiveDate: '2026-03-01', lastUpdated: '2026-03-01', status: 'active',
    acknowledgedBy: ['Admin User']
  },
];

export const DEFAULT_DEPLOY_LOGS: DeployLog[] = [
  { id: 'dep_001', version: 'v2.4.1', status: 'success', deployedBy: 'Super Admin', timestamp: '2026-07-05T14:30:00Z', duration: '3m 42s', changelog: 'Fix payment slip upload + KYC validation' },
  { id: 'dep_002', version: 'v2.4.0', status: 'success', deployedBy: 'Super Admin', timestamp: '2026-07-01T10:00:00Z', duration: '5m 18s', changelog: 'Admin broadcast + notification system' },
  { id: 'dep_003', version: 'v2.3.9', status: 'rollback', deployedBy: 'Admin User', timestamp: '2026-06-28T16:45:00Z', duration: '1m 12s', changelog: 'Rollback: contract PDF generation bug' },
];

export const DEFAULT_ALERTS_CONFIG: AlertConfig[] = [
  { id: 'alrt_001', name: 'Uptime Monitor', type: 'uptime', threshold: 99.9, enabled: true, notifyChannel: 'line' },
  { id: 'alrt_002', name: 'Error Rate Alert', type: 'error_rate', threshold: 5, enabled: true, notifyChannel: 'email' },
  { id: 'alrt_003', name: 'Response Time Alert', type: 'response_time', threshold: 2000, enabled: true, notifyChannel: 'slack' },
  { id: 'alrt_004', name: 'Disk Space Warning', type: 'disk_space', threshold: 85, enabled: false, notifyChannel: 'email' },
];

export const DEFAULT_AGENT_PERFORMANCE: AgentPerformance[] = [
  { id: 'u_003', name: 'John Smith', deals: 24, revenue: 184500, rating: 4.8, responseTime: '12 นาที' },
  { id: 'u_004', name: 'วรรณา สุขใจ', deals: 18, revenue: 142000, rating: 4.6, responseTime: '18 นาที' },
  { id: 'ag_003', name: 'ปวีณา จริงใจ', deals: 31, revenue: 226000, rating: 4.9, responseTime: '8 นาที' },
  { id: 'ag_004', name: 'ธีรพล มั่นคง', deals: 12, revenue: 89000, rating: 4.3, responseTime: '25 นาที' },
];
