import { create } from 'zustand';
import { AdminStore } from './types';
import {
  DEFAULT_USERS, DEFAULT_AGENTS, DEFAULT_REPORTS, DEFAULT_REFUNDS,
  DEFAULT_DOCS, DEFAULT_SECURITY_EVENTS, DEFAULT_CLASSIFICATIONS,
  DEFAULT_INSIDER_ALERTS, DEFAULT_POLICIES, DEFAULT_ALERTS_CONFIG
} from './defaults';
import { memberActions } from './actions/memberActions';
import { kycActions } from './actions/kycActions';
import { refundActions } from './actions/refundActions';
import { systemActions } from './actions/systemActions';
import { otherActions } from './actions/otherActions';
import type { AdminAuditLog, BackupSnapshot } from '@/lib/types/admin-types';

function loadOrDefault<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function persist(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
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
    
    // DEV REQUIREMENT: load directly from DEFAULT_INSIDER_ALERTS instead of localStorage so it resets on refresh
    const insiderAlerts = DEFAULT_INSIDER_ALERTS;
    
    const insiderPolicies = loadOrDefault('primerent_admin_insider_policies', DEFAULT_POLICIES);
    const backups = loadOrDefault<BackupSnapshot[]>('primerent_admin_backups', []);
    const securityEvents = loadOrDefault('primerent_admin_security_events', DEFAULT_SECURITY_EVENTS);
    const agentPerformance = loadOrDefault('primerent_admin_agent_performance', []);
    const deployLogs = loadOrDefault('primerent_admin_deploy_logs', []);
    const alertConfigs = loadOrDefault('primerent_admin_alert_configs', DEFAULT_ALERTS_CONFIG);
    const payments = loadOrDefault<any[]>('primerent_payments', []);
    const maintenanceMode = localStorage.getItem('primerent_maintenance_mode') === 'true';
    const is2faEnforced = localStorage.getItem('primerent_cfg_2fa_enforced') === 'true';

    // Persist defaults if not stored (Skip persisting insiderAlerts)
    if (!localStorage.getItem('primerent_admin_users')) persist('primerent_admin_users', users);
    if (!localStorage.getItem('primerent_admin_agent_requests')) persist('primerent_admin_agent_requests', agentRequests);
    if (!localStorage.getItem('primerent_admin_scam_reports')) persist('primerent_admin_scam_reports', scamReports);
    if (!localStorage.getItem('primerent_admin_refunds')) persist('primerent_admin_refunds', refunds);
    if (!localStorage.getItem('primerent_admin_docs')) persist('primerent_admin_docs', documents);
    if (!localStorage.getItem('primerent_admin_classifications')) persist('primerent_admin_classifications', classifications);
    if (!localStorage.getItem('primerent_admin_security_events')) persist('primerent_admin_security_events', securityEvents);

    set({
      users, agentRequests, scamReports, refunds, documents, auditLogs,
      classifications, insiderAlerts, insiderPolicies, backups, securityEvents,
      agentPerformance, deployLogs, alertConfigs, payments, maintenanceMode, is2faEnforced,
    });
  },

  resetDatabase: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('primerent_admin_users');
    localStorage.removeItem('primerent_admin_agent_requests');
    localStorage.removeItem('primerent_admin_scam_reports');
    localStorage.removeItem('primerent_admin_refunds');
    localStorage.removeItem('primerent_admin_docs');
    localStorage.removeItem('primerent_admin_classifications');
    localStorage.removeItem('primerent_admin_insider_alerts');
    localStorage.removeItem('primerent_admin_security_events');
    localStorage.removeItem('primerent_admin_audit_logs');
    localStorage.removeItem('primerent_admin_backups');
    get().loadDatabase();
    get().logAuditAction('Reset Database to Defaults', 'System');
  },

  // Spread actions from actions modules
  ...memberActions(set, get),
  ...kycActions(set, get),
  ...refundActions(set, get),
  ...systemActions(set, get),
  ...otherActions(set, get),
}));
