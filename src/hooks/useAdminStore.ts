'use client';

import { create } from 'zustand';
import type {
  AdminUser, AgentKYCRequest, ScamReport, RefundRequest,
  LeaseDocument, AdminAuditLog, DataFieldClassification,
  InsiderTradingAlert, BackupSnapshot, SecurityEvent,
  AgentPerformance, InsiderPolicy, DeployLog, AlertConfig
} from '@/lib/types/admin-types';

// ─── Mock Data Defaults ────────────────────────────────────────────────────

const DEFAULT_USERS: AdminUser[] = [
  { id: 'u_001', displayName: 'สมชาย มีทรัพย์', email: 'somchai@email.com', role: 'landlord', status: 'active', kycStatus: 'verified', createdAt: '2025-01-12', lastActive: '2026-07-06' },
  { id: 'u_002', displayName: 'อนันต์ ทำดี', email: 'anant@email.com', role: 'renter', status: 'active', kycStatus: 'verified', createdAt: '2025-02-18', lastActive: '2026-07-06' },
  { id: 'u_003', displayName: 'John Smith', email: 'john@primerent.com', role: 'agent', status: 'active', kycStatus: 'verified', createdAt: '2025-03-05', lastActive: '2026-07-05' },
  { id: 'u_004', displayName: 'วรรณา สุขใจ', email: 'wanna@email.com', role: 'agent', status: 'suspended', kycStatus: 'pending', createdAt: '2025-11-20', lastActive: '2026-06-15' },
  { id: 'u_005', displayName: 'Fake User', email: 'fake@scam.com', role: 'user', status: 'banned', kycStatus: 'rejected', createdAt: '2026-06-01', lastActive: '2026-06-05' },
  { id: 'u_006', displayName: 'มานพ ขายดี', email: 'manop@sales.com', role: 'user', status: 'pending', kycStatus: 'pending', createdAt: '2026-07-01', lastActive: '2026-07-06' },
  { id: 'u_007', displayName: 'พิมพ์พร รัตนากร', email: 'pimporn@email.com', role: 'renter', status: 'active', kycStatus: 'verified', createdAt: '2025-06-10', lastActive: '2026-07-05' },
  { id: 'u_008', displayName: 'สุดาพร พุ่มใจ', email: 'sudaporn@email.com', role: 'renter', status: 'active', kycStatus: 'unverified', createdAt: '2026-04-20', lastActive: '2026-07-04' },
];

const DEFAULT_AGENTS: AgentKYCRequest[] = [
  {
    id: 'req_001', userId: 'u_004', name: 'วรรณา สุขใจ', email: 'wanna@email.com',
    licenseNumber: 'AGN-4458-12', brokerName: 'บริษัท ทรัพย์แลนด์สเคป จำกัด',
    ndidStatus: 'verified', livenessScore: 98.4, submittedAt: '2026-07-05',
    documents: [
      { type: 'ID Card', filename: 'id_card_wanna.png', size: '1.2 MB' },
      { type: 'Agent License', filename: 'license_wanna.pdf', size: '2.4 MB' }
    ]
  },
  {
    id: 'req_002', userId: 'u_006', name: 'มานพ ขายดี', email: 'manop@sales.com',
    licenseNumber: 'AGN-1102-99', brokerName: 'อิสระ (Freelance)',
    ndidStatus: 'pending', livenessScore: 84.1, submittedAt: '2026-07-06',
    documents: [
      { type: 'ID Card', filename: 'id_card_manop.png', size: '1.4 MB' }
    ]
  }
];

const DEFAULT_REPORTS: ScamReport[] = [
  { id: 'rep_001', reporterName: 'สมชาย มีทรัพย์', targetType: 'listing', targetId: 'prop_001', reason: 'ราคาลงประกาศไม่สอดคล้องกับความจริง / สัญญาปลอม', status: 'open', createdAt: '2026-07-04', evidence: 'screenshot_proof.jpg' },
  { id: 'rep_002', reporterName: 'มาลี บุญมา', targetType: 'user', targetId: 'u_005', reason: 'พฤติกรรมพยายามสแปมแชทส่งลิงก์หลอกลวงดูดเงิน', status: 'open', createdAt: '2026-07-05', evidence: 'chat_history.pdf' },
  { id: 'rep_003', reporterName: 'พิมพ์พร รัตนากร', targetType: 'review', targetId: 'rev_012', reason: 'รีวิวปลอม สร้างบัญชีปลอมเพื่อกดดาว', status: 'open', createdAt: '2026-07-06', evidence: 'fake_reviews_log.xlsx' },
];

const DEFAULT_REFUNDS: RefundRequest[] = [
  { id: 'ref_001', tenantId: 'u_002', tenantName: 'อนันต์ ทำดี', ownerId: 'u_001', ownerName: 'สมชาย มีทรัพย์', amount: 15000, reason: 'ห้องชำรุดก่อนเข้าอยู่จริง สัญญาเช่าถูกยกเลิก', type: 'deposit', status: 'pending', createdAt: '2026-07-04' },
  { id: 'ref_002', tenantId: 'u_008', tenantName: 'สุดาพร พุ่มใจ', ownerId: 'u_001', ownerName: 'สมชาย มีทรัพย์', amount: 8000, reason: 'ยินยอมยกเลิกสัญญาและชำระค่าธรรมเนียมบางส่วน', type: 'commission', status: 'admin_approved', adminApprovedBy: 'Admin User', adminApprovedAt: '2026-07-05T10:00:00Z', createdAt: '2026-07-03' },
  { id: 'ref_003', tenantId: 'u_007', tenantName: 'พิมพ์พร รัตนากร', ownerId: 'u_001', ownerName: 'สมชาย มีทรัพย์', amount: 25000, reason: 'ประกันถูกหักเกินกว่าความเสียหายจริง', type: 'deposit', status: 'pending', createdAt: '2026-07-06' },
];

const DEFAULT_DOCS: LeaseDocument[] = [
  { id: 'doc_001', propertyName: 'Ideo Mix Sukhumvit (ห้อง 102)', tenantName: 'อนันต์ ทำดี', ownerName: 'สมชาย มีทรัพย์', status: 'Active Lease', signaturesCount: 3, updatedAt: '2026-06-20', documentType: 'contract', pdpaCompliant: true, retentionExpiry: '2031-06-20' },
  { id: 'doc_002', propertyName: 'Condo Asoke Place (ห้อง 1209)', tenantName: 'นิรันดร์ ผลดี', ownerName: 'เกรียงไกร เลิศล้ำ', status: 'Pending Signatures', signaturesCount: 1, updatedAt: '2026-07-05', documentType: 'contract', pdpaCompliant: true, retentionExpiry: '2031-07-05' },
  { id: 'doc_003', propertyName: 'วรรณา สุขใจ - KYC Documents', tenantName: '-', ownerName: '-', status: 'Archived', signaturesCount: 0, updatedAt: '2026-07-05', documentType: 'kyc', pdpaCompliant: true, retentionExpiry: '2029-07-05' },
  { id: 'doc_004', propertyName: 'Ideo Mix Sukhumvit (ห้อง 102) - Checklist', tenantName: 'อนันต์ ทำดี', ownerName: 'สมชาย มีทรัพย์', status: 'Completed', signaturesCount: 2, updatedAt: '2026-06-22', documentType: 'checklist', pdpaCompliant: true, retentionExpiry: '2031-06-22' },
];

const DEFAULT_SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'sec_001', type: 'failed_login', ipAddress: '203.154.89.12', userId: 'u_005', description: 'Failed login attempt 5 ครั้งติดต่อกัน บัญชี fake@scam.com', severity: 'high', timestamp: new Date(Date.now() - 1800000).toISOString(), resolved: false },
  { id: 'sec_002', type: 'suspicious_ip', ipAddress: '185.220.101.42', description: 'IP จาก TOR exit node พยายาม access /api/admin', severity: 'critical', timestamp: new Date(Date.now() - 3600000).toISOString(), resolved: false },
  { id: 'sec_003', type: 'idor_attempt', ipAddress: '192.168.1.100', userId: 'u_006', description: 'พยายามเข้าถึง user profile ของผู้อื่นผ่าน /api/users/u_001', severity: 'high', timestamp: new Date(Date.now() - 5400000).toISOString(), resolved: false },
  { id: 'sec_004', type: 'rate_limit', ipAddress: '103.45.67.89', description: 'Rate limit exceeded: 500 requests/min จาก IP เดียว ที่ /api/listings', severity: 'medium', timestamp: new Date(Date.now() - 7200000).toISOString(), resolved: true, resolvedBy: 'Admin User' },
  { id: 'sec_005', type: 'brute_force', ipAddress: '45.33.12.88', description: 'Brute force attack detected: 200+ login attempts ใน 10 นาที', severity: 'critical', timestamp: new Date(Date.now() - 900000).toISOString(), resolved: false },
];

const DEFAULT_CLASSIFICATIONS: DataFieldClassification[] = [
  { id: 'f_001', field: 'users.nationalId', description: 'เลขบัตรประชาชน', classification: 'Sensitive', owner: 'Super Admin', encrypted: true, accessRoles: ['superadmin'] },
  { id: 'f_002', field: 'users.phoneNumber', description: 'เบอร์โทรศัพท์', classification: 'Internal', owner: 'Admin', encrypted: true, accessRoles: ['admin', 'superadmin'] },
  { id: 'f_003', field: 'contracts.signatures', description: 'ลายเซ็นดิจิทัล', classification: 'Sensitive', owner: 'Super Admin', encrypted: true, accessRoles: ['superadmin'] },
  { id: 'f_004', field: 'properties.location', description: 'ที่ตั้งทรัพย์สิน', classification: 'Public', owner: 'System', encrypted: false, accessRoles: ['user', 'renter', 'landlord', 'agent', 'admin', 'superadmin'] },
  { id: 'f_005', field: 'users.email', description: 'อีเมลผู้ใช้', classification: 'Internal', owner: 'Admin', encrypted: false, accessRoles: ['admin', 'superadmin'] },
  { id: 'f_006', field: 'payments.bankAccount', description: 'เลขบัญชีธนาคาร', classification: 'Sensitive', owner: 'Super Admin', encrypted: true, accessRoles: ['superadmin'] },
];

const DEFAULT_INSIDER_ALERTS: InsiderTradingAlert[] = [
  { id: 'ins_001', type: 'PriceManipulation', description: 'ราคาลดลง 60% ก่อนทำสัญญาทันที (BTS Onnut ห้อง 77)', severity: 'High', status: 'active', createdAt: '2026-07-06' },
  { id: 'ins_002', type: 'AgentSelfDealing', description: 'นายหน้า John Smith ทำเรื่องเช่าห้องของตนเองเพื่อรับค่าคอมมิชชัน', severity: 'Medium', status: 'active', createdAt: '2026-07-05' },
  { id: 'ins_003', type: 'DataMisuse', description: 'พนักงานภายในดึงข้อมูลราคาเฉลี่ยทุกเขตก่อนเปิดเผยรายงาน', severity: 'High', status: 'active', createdAt: '2026-07-04' },
];

const DEFAULT_POLICIES: InsiderPolicy[] = [
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

const DEFAULT_DEPLOY_LOGS: DeployLog[] = [
  { id: 'dep_001', version: 'v2.4.1', status: 'success', deployedBy: 'Super Admin', timestamp: '2026-07-05T14:30:00Z', duration: '3m 42s', changelog: 'Fix payment slip upload + KYC validation' },
  { id: 'dep_002', version: 'v2.4.0', status: 'success', deployedBy: 'Super Admin', timestamp: '2026-07-01T10:00:00Z', duration: '5m 18s', changelog: 'Admin broadcast + notification system' },
  { id: 'dep_003', version: 'v2.3.9', status: 'rollback', deployedBy: 'Admin User', timestamp: '2026-06-28T16:45:00Z', duration: '1m 12s', changelog: 'Rollback: contract PDF generation bug' },
];

const DEFAULT_ALERTS_CONFIG: AlertConfig[] = [
  { id: 'alrt_001', name: 'Uptime Monitor', type: 'uptime', threshold: 99.9, enabled: true, notifyChannel: 'line' },
  { id: 'alrt_002', name: 'Error Rate Alert', type: 'error_rate', threshold: 5, enabled: true, notifyChannel: 'email' },
  { id: 'alrt_003', name: 'Response Time Alert', type: 'response_time', threshold: 2000, enabled: true, notifyChannel: 'slack' },
  { id: 'alrt_004', name: 'Disk Space Warning', type: 'disk_space', threshold: 85, enabled: false, notifyChannel: 'email' },
];

const DEFAULT_AGENT_PERFORMANCE: AgentPerformance[] = [
  { id: 'u_003', name: 'John Smith', deals: 24, revenue: 184500, rating: 4.8, responseTime: '12 นาที' },
  { id: 'u_004', name: 'วรรณา สุขใจ', deals: 18, revenue: 142000, rating: 4.6, responseTime: '18 นาที' },
  { id: 'ag_003', name: 'ปวีณา จริงใจ', deals: 31, revenue: 226000, rating: 4.9, responseTime: '8 นาที' },
  { id: 'ag_004', name: 'ธีรพล มั่นคง', deals: 12, revenue: 89000, rating: 4.3, responseTime: '25 นาที' },
];

// ─── Store Interface ────────────────────────────────────────────────────────

interface AdminStore {
  // State
  users: AdminUser[];
  agentRequests: AgentKYCRequest[];
  scamReports: ScamReport[];
  refunds: RefundRequest[];
  documents: LeaseDocument[];
  auditLogs: AdminAuditLog[];
  classifications: DataFieldClassification[];
  insiderAlerts: InsiderTradingAlert[];
  insiderPolicies: InsiderPolicy[];
  backups: BackupSnapshot[];
  securityEvents: SecurityEvent[];
  agentPerformance: AgentPerformance[];
  deployLogs: DeployLog[];
  alertConfigs: AlertConfig[];
  payments: any[];

  // System config
  maintenanceMode: boolean;
  is2faEnforced: boolean;

  // Helpers
  isSuperAdmin: () => boolean;
  logAuditAction: (action: string, target: string, details?: string) => void;

  // Loaders
  loadDatabase: () => void;

  // 12.1 Member actions
  updateUserRole: (userId: string, role: AdminUser['role']) => void;
  updateUserStatus: (userId: string, status: AdminUser['status'], reason?: string) => void;

  // 12.2 Agent KYC actions
  handleAgentKYC: (requestId: string, userId: string, action: 'approve' | 'reject', reason?: string) => void;

  // 12.3 Scam report actions
  handleScamReport: (reportId: string, action: 'takedown' | 'dismiss' | 'investigate', resolution?: string) => void;

  // 12.4 Refund actions
  handleRefundAdminApprove: (refundId: string) => void;
  handleRefundSuperAdminConfirm: (refundId: string) => void;
  handleRefundReject: (refundId: string, reason: string) => void;

  // 12.8 Security actions
  resolveSecurityEvent: (eventId: string) => void;
  toggle2fa: () => void;

  // 12.9 Classification actions
  updateClassification: (id: string, classification: DataFieldClassification['classification']) => void;

  // 12.10 System actions
  toggleMaintenanceMode: () => void;

  // 12.11 Backup actions
  createBackup: () => void;
  restoreBackup: (backupId: string, name: string) => boolean;

  // 12.12 Insider Trading actions
  resolveInsiderAlert: (alertId: string, resolution?: string) => void;
}

// ─── Store Implementation ───────────────────────────────────────────────────

function loadOrDefault<T>(key: string, defaultVal: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
  } catch { return defaultVal; }
}

function persist(key: string, data: any) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  // Initial state
  users: [],
  agentRequests: [],
  scamReports: [],
  refunds: [],
  documents: [],
  auditLogs: [],
  classifications: [],
  insiderAlerts: [],
  insiderPolicies: [],
  backups: [],
  securityEvents: [],
  agentPerformance: [],
  deployLogs: [],
  alertConfigs: [],
  payments: [],
  maintenanceMode: false,
  is2faEnforced: false,

  isSuperAdmin: () => {
    if (typeof window === 'undefined') return false;
    const role = localStorage.getItem('primerent_user_role') || 'admin';
    return role === 'superadmin' || role === 'sa';
  },

  logAuditAction: (action, target, details) => {
    const isSA = get().isSuperAdmin();
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}`,
      ipAddress: '192.168.1.109',
      adminName: isSA ? 'Super Admin (sa)' : 'Admin User',
      adminRole: isSA ? 'superadmin' : 'admin',
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
    };
    const stored = loadOrDefault<AdminAuditLog[]>('primerent_admin_audit_logs', []);
    stored.unshift(newLog);
    persist('primerent_admin_audit_logs', stored);
    set({ auditLogs: stored });
  },

  loadDatabase: () => {
    const users = loadOrDefault('primerent_admin_users', DEFAULT_USERS);
    const agentRequests = loadOrDefault('primerent_admin_agent_requests', DEFAULT_AGENTS);
    const scamReports = loadOrDefault('primerent_admin_scam_reports', DEFAULT_REPORTS);
    const refunds = loadOrDefault('primerent_admin_refunds', DEFAULT_REFUNDS);
    const documents = loadOrDefault('primerent_admin_docs', DEFAULT_DOCS);
    const auditLogs = loadOrDefault<AdminAuditLog[]>('primerent_admin_audit_logs', [
      { id: 'log_001', ipAddress: '192.168.1.42', adminName: 'Admin User', adminRole: 'admin', action: 'KYC Document Approval', target: 'u_001', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 'log_002', ipAddress: '192.168.1.109', adminName: 'Super Admin', adminRole: 'superadmin', action: 'Platform Config Payout Update', target: 'System Platform', timestamp: new Date(Date.now() - 7200000).toISOString() },
    ]);
    const classifications = loadOrDefault('primerent_admin_classifications', DEFAULT_CLASSIFICATIONS);
    const insiderAlerts = loadOrDefault('primerent_admin_insider_alerts', DEFAULT_INSIDER_ALERTS);
    const insiderPolicies = loadOrDefault('primerent_admin_insider_policies', DEFAULT_POLICIES);
    const backups = loadOrDefault<BackupSnapshot[]>('primerent_admin_backups', []);
    const securityEvents = loadOrDefault('primerent_admin_security_events', DEFAULT_SECURITY_EVENTS);
    const agentPerformance = loadOrDefault('primerent_admin_agent_performance', DEFAULT_AGENT_PERFORMANCE);
    const deployLogs = loadOrDefault('primerent_admin_deploy_logs', DEFAULT_DEPLOY_LOGS);
    const alertConfigs = loadOrDefault('primerent_admin_alert_configs', DEFAULT_ALERTS_CONFIG);
    const payments = loadOrDefault<any[]>('primerent_payments', []);
    const maintenanceMode = localStorage.getItem('primerent_maintenance_mode') === 'true';
    const is2faEnforced = localStorage.getItem('primerent_cfg_2fa_enforced') === 'true';

    // Persist defaults if not stored
    if (!localStorage.getItem('primerent_admin_users')) persist('primerent_admin_users', users);
    if (!localStorage.getItem('primerent_admin_agent_requests')) persist('primerent_admin_agent_requests', agentRequests);
    if (!localStorage.getItem('primerent_admin_scam_reports')) persist('primerent_admin_scam_reports', scamReports);
    if (!localStorage.getItem('primerent_admin_refunds')) persist('primerent_admin_refunds', refunds);
    if (!localStorage.getItem('primerent_admin_docs')) persist('primerent_admin_docs', documents);
    if (!localStorage.getItem('primerent_admin_classifications')) persist('primerent_admin_classifications', classifications);
    if (!localStorage.getItem('primerent_admin_insider_alerts')) persist('primerent_admin_insider_alerts', insiderAlerts);
    if (!localStorage.getItem('primerent_admin_security_events')) persist('primerent_admin_security_events', securityEvents);

    set({
      users, agentRequests, scamReports, refunds, documents, auditLogs,
      classifications, insiderAlerts, insiderPolicies, backups, securityEvents,
      agentPerformance, deployLogs, alertConfigs, payments, maintenanceMode, is2faEnforced,
    });
  },

  // ─── 12.1 Member Management ─────────────────────────────────────────────
  updateUserRole: (userId, role) => {
    const updated = get().users.map(u => u.id === userId ? { ...u, role } : u);
    persist('primerent_admin_users', updated);
    set({ users: updated });
    get().logAuditAction(`Change Role to ${role.toUpperCase()}`, userId);
  },

  updateUserStatus: (userId, status, reason) => {
    const updated = get().users.map(u => u.id === userId ? {
      ...u, status,
      ...(status === 'suspended' ? { suspendReason: reason } : {}),
      ...(status === 'banned' ? { banReason: reason } : {}),
    } : u);
    persist('primerent_admin_users', updated);
    set({ users: updated });
    get().logAuditAction(`Set Status to ${status.toUpperCase()}${reason ? ` (${reason})` : ''}`, userId);
  },

  // ─── 12.2 Agent KYC ─────────────────────────────────────────────────────
  handleAgentKYC: (requestId, userId, action, reason) => {
    const updatedRequests = get().agentRequests.map(r => r.id === requestId ? {
      ...r,
      ndidStatus: action === 'approve' ? 'verified' as const : 'failed' as const,
      reviewedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User',
      reviewedAt: new Date().toISOString(),
      rejectReason: action === 'reject' ? reason : undefined,
    } : r);
    persist('primerent_admin_agent_requests', updatedRequests);
    set({ agentRequests: updatedRequests });

    if (action === 'approve') {
      const updatedUsers = get().users.map(u => u.id === userId ? { ...u, role: 'agent' as const, kycStatus: 'verified' as const } : u);
      persist('primerent_admin_users', updatedUsers);
      set({ users: updatedUsers });
    }
    get().logAuditAction(`Agent KYC ${action.toUpperCase()}${reason ? `: ${reason}` : ''}`, userId);
  },

  // ─── 12.3 Scam Report ───────────────────────────────────────────────────
  handleScamReport: (reportId, action, resolution) => {
    const statusMap = { takedown: 'resolved', dismiss: 'dismissed', investigate: 'investigating' } as const;
    const updated = get().scamReports.map(r => r.id === reportId ? {
      ...r,
      status: statusMap[action],
      actionTaken: action === 'investigate' ? undefined : action as any,
      resolvedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User',
      resolvedAt: new Date().toISOString(),
      resolution,
    } : r);
    persist('primerent_admin_scam_reports', updated);
    set({ scamReports: updated });
    get().logAuditAction(`Report ticket ${action}`, reportId, resolution);
  },

  // ─── 12.4 Refund ────────────────────────────────────────────────────────
  handleRefundAdminApprove: (refundId) => {
    const updated = get().refunds.map(r => r.id === refundId ? { ...r, status: 'admin_approved' as const, adminApprovedBy: 'Admin User', adminApprovedAt: new Date().toISOString() } : r);
    persist('primerent_admin_refunds', updated);
    set({ refunds: updated });
    get().logAuditAction('Refund Admin Approval', refundId);
  },

  handleRefundSuperAdminConfirm: (refundId) => {
    const updated = get().refunds.map(r => r.id === refundId ? { ...r, status: 'completed' as const, superAdminApprovedBy: 'Super Admin', superAdminApprovedAt: new Date().toISOString() } : r);
    persist('primerent_admin_refunds', updated);
    set({ refunds: updated });
    get().logAuditAction('Refund SuperAdmin Final Approval', refundId);
  },

  handleRefundReject: (refundId, reason) => {
    const updated = get().refunds.map(r => r.id === refundId ? { ...r, status: 'rejected' as const, rejectedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User', rejectedReason: reason } : r);
    persist('primerent_admin_refunds', updated);
    set({ refunds: updated });
    get().logAuditAction(`Refund Rejected: ${reason}`, refundId);
  },

  // ─── 12.8 Security ──────────────────────────────────────────────────────
  resolveSecurityEvent: (eventId) => {
    const updated = get().securityEvents.map(e => e.id === eventId ? { ...e, resolved: true, resolvedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User' } : e);
    persist('primerent_admin_security_events', updated);
    set({ securityEvents: updated });
    get().logAuditAction('Security Event Resolved', eventId);
  },

  toggle2fa: () => {
    const nextVal = !get().is2faEnforced;
    localStorage.setItem('primerent_cfg_2fa_enforced', String(nextVal));
    set({ is2faEnforced: nextVal });
    get().logAuditAction(`Toggle Require 2FA = ${String(nextVal).toUpperCase()}`, 'Global Security Configuration');
  },

  // ─── 12.9 Data Classification ───────────────────────────────────────────
  updateClassification: (id, classification) => {
    const updated = get().classifications.map(c => c.id === id ? { ...c, classification, lastModified: new Date().toISOString() } : c);
    persist('primerent_admin_classifications', updated);
    set({ classifications: updated });
    get().logAuditAction(`Update Data Classification to ${classification}`, id);
  },

  // ─── 12.10 System Maintenance ───────────────────────────────────────────
  toggleMaintenanceMode: () => {
    const nextVal = !get().maintenanceMode;
    localStorage.setItem('primerent_maintenance_mode', String(nextVal));
    set({ maintenanceMode: nextVal });
    get().logAuditAction(`Toggle Maintenance Mode = ${String(nextVal).toUpperCase()}`, 'System Infrastructure');
  },

  // ─── 12.11 Backup & Recovery ────────────────────────────────────────────
  createBackup: () => {
    const name = `Backup_${new Date().toISOString().slice(0, 19).replace('T', '_')}`;
    const snapshotData = {
      payments: localStorage.getItem('primerent_payments'),
      bills: localStorage.getItem('primerent_bills'),
      commissions: localStorage.getItem('primerent_commissions'),
      users: localStorage.getItem('primerent_admin_users'),
      agents: localStorage.getItem('primerent_admin_agent_requests'),
      reports: localStorage.getItem('primerent_admin_scam_reports'),
      refunds: localStorage.getItem('primerent_admin_refunds'),
    };
    const backupItem: BackupSnapshot = {
      id: `bk_${Date.now()}`, name, createdAt: new Date().toISOString(),
      size: Object.keys(snapshotData).length, type: 'manual', status: 'completed',
      retentionDays: 90,
    };
    const stored = loadOrDefault<BackupSnapshot[]>('primerent_admin_backups', []);
    stored.push(backupItem);
    persist('primerent_admin_backups', stored);
    localStorage.setItem(`primerent_snapshot_${backupItem.id}`, JSON.stringify(snapshotData));
    set({ backups: stored });
    get().logAuditAction('Create DB Snapshot Backup', backupItem.name);
  },

  restoreBackup: (backupId, name) => {
    try {
      const dataStr = localStorage.getItem(`primerent_snapshot_${backupId}`);
      if (dataStr) {
        const snapshot = JSON.parse(dataStr);
        if (snapshot.payments) localStorage.setItem('primerent_payments', snapshot.payments);
        if (snapshot.bills) localStorage.setItem('primerent_bills', snapshot.bills);
        if (snapshot.commissions) localStorage.setItem('primerent_commissions', snapshot.commissions);
        if (snapshot.users) localStorage.setItem('primerent_admin_users', snapshot.users);
        if (snapshot.agents) localStorage.setItem('primerent_admin_agent_requests', snapshot.agents);
        if (snapshot.reports) localStorage.setItem('primerent_admin_scam_reports', snapshot.reports);
        if (snapshot.refunds) localStorage.setItem('primerent_admin_refunds', snapshot.refunds);
        get().logAuditAction('Restore Database snapshot', name);
        return true;
      }
      return false;
    } catch { return false; }
  },

  // ─── 12.12 Insider Trading ──────────────────────────────────────────────
  resolveInsiderAlert: (alertId, resolution) => {
    const updated = get().insiderAlerts.map(a => a.id === alertId ? {
      ...a, status: 'resolved' as const,
      resolvedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User',
      resolvedAt: new Date().toISOString(),
      resolution,
    } : a);
    persist('primerent_admin_insider_alerts', updated);
    set({ insiderAlerts: updated });
    get().logAuditAction('Insider Trading alert resolved', alertId, resolution);
  },
}));
