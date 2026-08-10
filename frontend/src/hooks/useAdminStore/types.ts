import type {
  AdminUser, AgentKYCRequest, ScamReport, RefundRequest,
  LeaseDocument, AdminAuditLog, DataFieldClassification,
  InsiderTradingAlert, BackupSnapshot, SecurityEvent,
  AgentPerformance, InsiderPolicy, DeployLog, AlertConfig
} from '@/lib/types/admin-types';

export interface AdminStore {
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
  resetDatabase: () => void;

  // 12.1 Member actions
  updateUserRole: (userId: string, role: AdminUser['role']) => void;
  updateUserStatus: (userId: string, status: AdminUser['status'], reason?: string) => void;

  // 12.2 Agent KYC actions
  handleAgentKYC: (requestId: string, userId: string, action: 'approve' | 'reject', reason?: string) => void;
  receiveCriminalCheckWebhook: (requestId: string, status: 'clear' | 'flagged') => void;

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
