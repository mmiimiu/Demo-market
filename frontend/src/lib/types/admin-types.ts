/**
 * Admin System Types — PrimeRent v2
 * Shared types for all admin features (12.1–12.12)
 */

// ─── 12.1 Member Management ─────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  role: 'user' | 'renter' | 'landlord' | 'owner' | 'agent' | 'admin' | 'superadmin' | 'sa';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  createdAt: string;
  lastActive: string;
  phone?: string;
  suspendReason?: string;
  banReason?: string;
}

// ─── 12.2 Agent KYC ─────────────────────────────────────────────────────────

export interface AgentKYCRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  licenseNumber: string;
  brokerName: string;
  ndidStatus: 'verified' | 'pending' | 'failed';
  livenessScore: number;
  submittedAt: string;
  documents: KYCDocument[];
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  criminalCheckStatus?: 'none' | 'pending' | 'clear' | 'flagged';
  criminalCheckPaid?: boolean;
  criminalCheckDocument?: string;
  criminalCheckDate?: string;
}

export interface KYCDocument {
  type: string;
  filename: string;
  size: string;
  url?: string;
}

// ─── 12.3 Report / Scam Management ──────────────────────────────────────────

export interface ScamReport {
  id: string;
  reporterName: string;
  reporterId?: string;
  targetType: 'listing' | 'user' | 'review';
  targetId: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  evidence: string;
  evidenceFiles?: { filename: string; type: string; url?: string }[];
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  actionTaken?: 'takedown' | 'ban_user' | 'warning' | 'dismiss';
}

// ─── 12.4 Dual Approval Refund ──────────────────────────────────────────────

export interface RefundRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  ownerName: string;
  amount: number;
  reason: string;
  type: 'deposit' | 'commission' | 'advance_rent';
  status: 'pending' | 'admin_approved' | 'completed' | 'rejected';
  adminApprovedBy?: string;
  adminApprovedAt?: string;
  superAdminApprovedBy?: string;
  superAdminApprovedAt?: string;
  rejectedBy?: string;
  rejectedReason?: string;
  createdAt: string;
}

// ─── 12.5 Document Management ───────────────────────────────────────────────

export interface LeaseDocument {
  id: string;
  propertyName: string;
  tenantName: string;
  ownerName: string;
  status: string;
  signaturesCount: number;
  updatedAt: string;
  documentType: 'contract' | 'kyc' | 'checklist';
  retentionExpiry?: string;
  pdpaCompliant?: boolean;
}

// ─── 12.7 Dashboard Analytics ───────────────────────────────────────────────

export interface DashboardKPI {
  label: string;
  value: number;
  change?: number; // percentage change
  sub: string;
  color: string;
  icon: string;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  users: number;
}

export interface AgentPerformance {
  id: string;
  name: string;
  deals: number;
  revenue: number;
  rating: number;
  responseTime: string;
}

// ─── 12.8 Security Dashboard ────────────────────────────────────────────────

export interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_ip' | 'idor_attempt' | 'rate_limit' | 'brute_force' | 'unauthorized_access';
  ipAddress: string;
  userId?: string;
  userAgent?: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
}

// ─── 12.9 Data Classification ───────────────────────────────────────────────

export type DataTier = 'Public' | 'Internal' | 'Sensitive';

export interface DataFieldClassification {
  id: string;
  field: string;
  description?: string;
  classification: DataTier;
  owner: string;
  encrypted: boolean;
  accessRoles: string[];
  lastModified?: string;
}

// ─── 12.10 System Maintenance ───────────────────────────────────────────────

export interface SystemStatus {
  uptime: string;
  version: string;
  lastDeploy: string;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface DeployLog {
  id: string;
  version: string;
  status: 'success' | 'failed' | 'rollback';
  deployedBy: string;
  timestamp: string;
  duration: string;
  changelog?: string;
}

export interface AlertConfig {
  id: string;
  name: string;
  type: 'uptime' | 'error_rate' | 'response_time' | 'disk_space';
  threshold: number;
  enabled: boolean;
  notifyChannel: 'email' | 'line' | 'slack';
}

// ─── 12.11 Backup & Recovery ────────────────────────────────────────────────

export interface BackupSnapshot {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  type: 'auto' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
  retentionDays: number;
  lastRestoreTest?: string;
  restoreTestResult?: 'pass' | 'fail';
}

// ─── 12.12 Insider Trading Policy ───────────────────────────────────────────

export interface InsiderTradingAlert {
  id: string;
  type: 'PriceManipulation' | 'AgentSelfDealing' | 'DataMisuse' | 'ConflictOfInterest';
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'active' | 'investigating' | 'resolved' | 'escalated';
  involvedUserId?: string;
  involvedUserName?: string;
  createdAt: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface InsiderPolicy {
  id: string;
  title: string;
  description: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
  acknowledgedBy: string[];
}

// ─── Shared: Admin Audit Log ────────────────────────────────────────────────

export interface AdminAuditLog {
  id: string;
  ipAddress: string;
  adminName: string;
  adminRole: 'admin' | 'superadmin';
  action: string;
  target: string;
  details?: string;
  timestamp: string;
}
