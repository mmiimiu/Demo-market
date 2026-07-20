'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Building2, BarChart3, Search, Shield, CheckCircle2, XCircle,
  Eye, TrendingUp, Loader2, RefreshCcw, Download, Activity,
  CheckSquare, Square, ChevronDown, AlertTriangle, FileText, Lock,
  Globe, Database, Server, RefreshCw, Undo, Save, Key, AlertCircle, FileCheck, Megaphone, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useFirestore, useUser } from '@/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SlipConfirmModal, CommissionLedger } from '@/components/payment';
import { NavbarNotifications } from '@/components/layout/Navbar/NavbarNotifications';

interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  role: 'user' | 'renter' | 'landlord' | 'owner' | 'agent' | 'admin' | 'superadmin' | 'sa';
  status: 'active' | 'suspended' | 'banned' | 'pending';
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  createdAt: string;
  lastActive: string;
}

interface AgentKYCRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  licenseNumber: string;
  brokerName: string;
  ndidStatus: 'verified' | 'pending' | 'failed';
  livenessScore: number;
  submittedAt: string;
  documents: { type: string; filename: string; size: string }[];
}

interface ScamReport {
  id: string;
  reporterName: string;
  targetType: 'listing' | 'user' | 'review';
  targetId: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  evidence: string;
}

interface RefundRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  ownerName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'admin_approved' | 'completed' | 'rejected';
  adminApprovedBy?: string;
  superAdminApprovedBy?: string;
  createdAt: string;
}

interface LeaseDocument {
  id: string;
  propertyName: string;
  tenantName: string;
  ownerName: string;
  status: string;
  signaturesCount: number;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  ipAddress: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
}

interface DataFieldClassification {
  id: string;
  field: string;
  classification: 'Public' | 'Restricted' | 'Confidential' | 'Secret';
  owner: string;
}

interface InsiderTradingAlert {
  id: string;
  type: 'PriceManipulation' | 'AgentSelfDealing';
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'active' | 'resolved';
  createdAt: string;
}

interface BackupSnapshot {
  id: string;
  name: string;
  createdAt: string;
  size: number;
}

type AdminPanelTab = 'analytics' | 'members' | 'agents' | 'compliance' | 'financials' | 'security' | 'system' | 'broadcast';

export function AdminPanel({ lang = 'th' }: { lang?: 'th' | 'en' | 'cn' }) {
  const isTh = lang === 'th';
  const { user: firebaseUser } = useUser();
  const [activeTab, setActiveTab] = useState<AdminPanelTab>('analytics');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateTabFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') as AdminPanelTab;
        if (tab) {
          setActiveTab(tab);
        }
      };
      
      updateTabFromUrl();
      // Listen to popstate or navigation updates
      window.addEventListener('popstate', updateTabFromUrl);
      
      // Also intercept local updates if history is pushed manually
      const originalPushState = window.history.pushState;
      window.history.pushState = function(...args) {
        originalPushState.apply(this, args);
        updateTabFromUrl();
      };
      
      return () => {
        window.removeEventListener('popstate', updateTabFromUrl);
        window.history.pushState = originalPushState;
      };
    }
  }, []);

  const systemRole = (localStorage.getItem('primerent_user_role') || 'admin') as any;
  const isSuperAdmin = systemRole === 'superadmin' || systemRole === 'sa';

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [agentRequests, setAgentRequests] = useState<AgentKYCRequest[]>([]);
  const [scamReports, setScamReports] = useState<ScamReport[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [classifications, setClassifications] = useState<DataFieldClassification[]>([]);
  const [insiderAlerts, setInsiderAlerts] = useState<InsiderTradingAlert[]>([]);
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRoles, setBroadcastRoles] = useState<string[]>([]);
  const [broadcastLocations, setBroadcastLocations] = useState<string[]>([]);
  const [broadcastBudgetMin, setBroadcastBudgetMin] = useState('');
  const [broadcastBudgetMax, setBroadcastBudgetMax] = useState('');
  const [broadcastPropertyTypes, setBroadcastPropertyTypes] = useState<string[]>([]);
  const [sendToLineOA, setSendToLineOA] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isUpdatingSystem, setIsUpdatingSystem] = useState(false);
  const [updateConsole, setUpdateConsole] = useState<string[]>([]);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [is2faEnforced, setIs2faEnforced] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [complianceSearch, setComplianceSearch] = useState('');

  const [activeDocAudit, setActiveDocAudit] = useState<LeaseDocument | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const REVENUE_DATA = [
    { month: 'ม.ค.', revenue: 120000, users: 12 },
    { month: 'ก.พ.', revenue: 135000, users: 18 },
    { month: 'มี.ค.', revenue: 150000, users: 24 },
    { month: 'เม.ย.', revenue: 165000, users: 31 },
    { month: 'พ.ค.', revenue: 175000, users: 38 },
    { month: 'มิ.ย.', revenue: 284500, users: 45 },
  ];

  const loadDatabase = useCallback(() => {
    try {
      const storedUsers = localStorage.getItem('primerent_admin_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        const defaultUsers: AdminUser[] = [
          { id: 'u_001', displayName: 'สมชาย มีทรัพย์', email: 'somchai@email.com', role: 'landlord', status: 'active', kycStatus: 'verified', createdAt: '2025-01-12', lastActive: '2026-07-06' },
          { id: 'u_002', displayName: 'อนันต์ ทำดี', email: 'anant@email.com', role: 'renter', status: 'active', kycStatus: 'verified', createdAt: '2025-02-18', lastActive: '2026-07-06' },
          { id: 'u_003', displayName: 'John Smith', email: 'john@primerent.com', role: 'agent', status: 'active', kycStatus: 'verified', createdAt: '2025-03-05', lastActive: '2026-07-05' },
          { id: 'u_004', displayName: 'วรรณา สุขใจ', email: 'wanna@email.com', role: 'agent', status: 'suspended', kycStatus: 'pending', createdAt: '2025-11-20', lastActive: '2026-06-15' },
          { id: 'u_005', displayName: 'Fake User', email: 'fake@scam.com', role: 'user', status: 'banned', kycStatus: 'rejected', createdAt: '2026-06-01', lastActive: '2026-06-05' }
        ];
        localStorage.setItem('primerent_admin_users', JSON.stringify(defaultUsers));
        setUsers(defaultUsers);
      }

      const storedAgents = localStorage.getItem('primerent_admin_agent_requests');
      if (storedAgents) {
        setAgentRequests(JSON.parse(storedAgents));
      } else {
        const defaultAgents: AgentKYCRequest[] = [
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
        localStorage.setItem('primerent_admin_agent_requests', JSON.stringify(defaultAgents));
        setAgentRequests(defaultAgents);
      }

      const storedReports = localStorage.getItem('primerent_admin_scam_reports');
      if (storedReports) {
        setScamReports(JSON.parse(storedReports));
      } else {
        const defaultReports: ScamReport[] = [
          { id: 'rep_001', reporterName: 'สมชาย มีทรัพย์', targetType: 'listing', targetId: 'prop_001', reason: 'ราคาลงประกาศไม่สอดคล้องกับความจริง / สัญญาปลอม', status: 'open', createdAt: '2026-07-04', evidence: 'screenshot_proof.jpg' },
          { id: 'rep_002', reporterName: 'มาลี บุญมา', targetType: 'user', targetId: 'u_005', reason: 'พฤติกรรมพยายามสแปมแชทส่งลิงก์หลอกลวงดูดเงิน', status: 'open', createdAt: '2026-07-05', evidence: 'chat_history.pdf' }
        ];
        localStorage.setItem('primerent_admin_scam_reports', JSON.stringify(defaultReports));
        setScamReports(defaultReports);
      }

      const storedRefunds = localStorage.getItem('primerent_admin_refunds');
      if (storedRefunds) {
        setRefunds(JSON.parse(storedRefunds));
      } else {
        const defaultRefunds: RefundRequest[] = [
          { id: 'ref_001', tenantId: 'u_002', tenantName: 'อนันต์ ทำดี', ownerId: 'u_001', ownerName: 'สมชาย มีทรัพย์', amount: 15000, reason: 'ห้องชำรุดก่อนเข้าอยู่จริง สัญญาเช่าถูกยกเลิก', status: 'pending', createdAt: '2026-07-04' },
          { id: 'ref_002', tenantId: 'u_009', tenantName: 'สุดาพร พุ่มใจ', ownerId: 'u_010', ownerName: 'เกรียงไกร เลิศล้ำ', amount: 8000, reason: 'ยินยอมยกเลิกสัญญาและชำระค่าธรรมเนียมบางส่วน', status: 'admin_approved', adminApprovedBy: 'Admin User', createdAt: '2026-07-03' }
        ];
        localStorage.setItem('primerent_admin_refunds', JSON.stringify(defaultRefunds));
        setRefunds(defaultRefunds);
      }

      const storedDocs = localStorage.getItem('primerent_admin_docs');
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      } else {
        const defaultDocs: LeaseDocument[] = [
          { id: 'doc_001', propertyName: 'Ideo Mix Sukhumvit (ห้อง 102)', tenantName: 'อนันต์ ทำดี', ownerName: 'สมชาย มีทรัพย์', status: 'Active Lease', signaturesCount: 3, updatedAt: '2026-06-20' },
          { id: 'doc_002', propertyName: 'Condo Asoke Place (ห้อง 1209)', tenantName: 'นิรันดร์ ผลดี', ownerName: 'เกรียงไกร เลิศล้ำ', status: 'Pending Signatures', signaturesCount: 1, updatedAt: '2026-07-05' }
        ];
        localStorage.setItem('primerent_admin_docs', JSON.stringify(defaultDocs));
        setDocuments(defaultDocs);
      }

      const storedLogs = localStorage.getItem('primerent_admin_audit_logs');
      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      } else {
        const defaultLogs: AuditLog[] = [
          { id: 'log_001', ipAddress: '192.168.1.42', adminName: 'Admin User', action: 'KYC Document Approval', target: 'u_001', timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: 'log_002', ipAddress: '192.168.1.109', adminName: 'Super Admin', action: 'Platform Config Payout Update', target: 'System Platform', timestamp: new Date(Date.now() - 7200000).toISOString() }
        ];
        localStorage.setItem('primerent_admin_audit_logs', JSON.stringify(defaultLogs));
        setAuditLogs(defaultLogs);
      }

      const storedClassifications = localStorage.getItem('primerent_admin_classifications');
      if (storedClassifications) {
        setClassifications(JSON.parse(storedClassifications));
      } else {
        const defaultClassifications: DataFieldClassification[] = [
          { id: 'f_001', field: 'users.nationalId', classification: 'Secret', owner: 'Super Admin' },
          { id: 'f_002', field: 'users.phoneNumber', classification: 'Confidential', owner: 'Admin' },
          { id: 'f_003', field: 'contracts.signatures', classification: 'Secret', owner: 'Super Admin' },
          { id: 'f_004', field: 'properties.location', classification: 'Public', owner: 'System' }
        ];
        localStorage.setItem('primerent_admin_classifications', JSON.stringify(defaultClassifications));
        setClassifications(defaultClassifications);
      }

      const storedInsiderAlerts = localStorage.getItem('primerent_admin_insider_alerts');
      if (storedInsiderAlerts) {
        setInsiderAlerts(JSON.parse(storedInsiderAlerts));
      } else {
        const defaultInsiderAlerts: InsiderTradingAlert[] = [
          { id: 'ins_001', type: 'PriceManipulation', description: 'ราคาลดลง 60% ก่อนทำสัญญาทันที (BTS Onnut ห้อง 77)', severity: 'High', status: 'active', createdAt: '2026-07-06' },
          { id: 'ins_002', type: 'AgentSelfDealing', description: 'นายหน้า John Smith ทำเรื่องเช่าห้องของตนเองเพื่อรับค่าคอมมิชชัน', severity: 'Medium', status: 'active', createdAt: '2026-07-05' }
        ];
        localStorage.setItem('primerent_admin_insider_alerts', JSON.stringify(defaultInsiderAlerts));
        setInsiderAlerts(defaultInsiderAlerts);
      }

      const storedPayments = localStorage.getItem('primerent_payments');
      setPayments(storedPayments ? JSON.parse(storedPayments) : []);

      const storedBackups = localStorage.getItem('primerent_admin_backups');
      setBackups(storedBackups ? JSON.parse(storedBackups) : []);

      setMaintenanceMode(localStorage.getItem('primerent_maintenance_mode') === 'true');
      setIs2faEnforced(localStorage.getItem('primerent_cfg_2fa_enforced') === 'true');

    } catch (e) {
      console.error('Error initializing system admin databases', e);
    }
  }, []);

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  const logAuditAction = useCallback((action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      ipAddress: '192.168.1.109',
      adminName: isSuperAdmin ? 'Super Admin (sa)' : 'Admin User',
      action,
      target,
      timestamp: new Date().toISOString()
    };
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_admin_audit_logs') || '[]');
      stored.unshift(newLog);
      localStorage.setItem('primerent_admin_audit_logs', JSON.stringify(stored));
      setAuditLogs(stored);
    } catch {}
  }, [isSuperAdmin]);

  const handleUpdateUserRole = (userId: string, role: AdminUser['role']) => {
    const updated = users.map(u => u.id === userId ? { ...u, role } : u);
    localStorage.setItem('primerent_admin_users', JSON.stringify(updated));
    setUsers(updated);
    logAuditAction(`Change Role to ${role.toUpperCase()}`, userId);
    toast({ title: isTh ? 'อัปเดตบทบาทสำเร็จ' : 'User Role Updated' });
  };

  const handleUpdateUserStatus = (userId: string, status: AdminUser['status']) => {
    const updated = users.map(u => u.id === userId ? { ...u, status } : u);
    localStorage.setItem('primerent_admin_users', JSON.stringify(updated));
    setUsers(updated);
    logAuditAction(`Set Status to ${status.toUpperCase()}`, userId);
    toast({ title: isTh ? 'อัปเดตสถานะผู้ใช้สำเร็จ' : 'User Status Updated' });
  };

  const handleAgentKYC = (requestId: string, userId: string, action: 'approve' | 'reject') => {
    const updatedRequests = agentRequests.map(r => r.id === requestId ? { ...r, ndidStatus: action === 'approve' ? 'verified' as const : 'failed' as const } : r);
    localStorage.setItem('primerent_admin_agent_requests', JSON.stringify(updatedRequests));
    setAgentRequests(updatedRequests);

    if (action === 'approve') {
      const updatedUsers = users.map(u => u.id === userId ? { ...u, role: 'agent' as const, kycStatus: 'verified' as const } : u);
      localStorage.setItem('primerent_admin_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }

    logAuditAction(`Agent KYC ${action.toUpperCase()}`, userId);
    toast({
      title: action === 'approve' ? (isTh ? '✓ อนุมัติเอกสารเอเจ้นต์แล้ว' : '✓ Agent KYC Approved') : (isTh ? '❌ ปฏิเสธเอกสารเอเจ้นต์' : '❌ Agent KYC Rejected')
    });
  };

  const handleScamReport = (reportId: string, action: 'takedown' | 'dismiss') => {
    const updated = scamReports.map(r => r.id === reportId ? { ...r, status: action === 'takedown' ? 'resolved' as const : 'dismissed' as const } : r);
    localStorage.setItem('primerent_admin_scam_reports', JSON.stringify(updated));
    setScamReports(updated);
    logAuditAction(`Report ticket ${action}`, reportId);
    toast({ title: isTh ? 'ดำเนินการจัดการโพสต์รายงานสำเร็จ' : 'Report Ticket Processed' });
  };

  const handleRefundAdminApprove = (refundId: string) => {
    const updated = refunds.map(r => r.id === refundId ? { ...r, status: 'admin_approved' as const, adminApprovedBy: 'Admin User' } : r);
    localStorage.setItem('primerent_admin_refunds', JSON.stringify(updated));
    setRefunds(updated);
    logAuditAction('Refund Admin Approval', refundId);
    toast({ title: isTh ? 'อนุมัติการคืนเงินขั้นแรกแล้ว' : 'Admin Approved Refund' });
  };

  const handleRefundSuperAdminConfirm = (refundId: string) => {
    const updated = refunds.map(r => r.id === refundId ? { ...r, status: 'completed' as const, superAdminApprovedBy: 'Super Admin' } : r);
    localStorage.setItem('primerent_admin_refunds', JSON.stringify(updated));
    setRefunds(updated);
    logAuditAction('Refund SuperAdmin Final Approval', refundId);
    toast({ title: isTh ? 'อนุมัติคืนเงินขั้นสุดท้ายแล้ว (เงินถูกโอนแล้ว)' : 'SuperAdmin Confirmed Refund' });
  };

  const handle2faToggle = () => {
    const nextVal = !is2faEnforced;
    setIs2faEnforced(nextVal);
    localStorage.setItem('primerent_cfg_2fa_enforced', String(nextVal));
    logAuditAction(`Toggle Require 2FA = ${nextVal.toString().toUpperCase()}`, 'Global Security Configuration');
    toast({ title: isTh ? 'เปลี่ยนการบังคับความปลอดภัยเรียบร้อย' : 'Security settings updated' });
  };

  const handleClassificationChange = (id: string, classification: DataFieldClassification['classification']) => {
    const updated = classifications.map(c => c.id === id ? { ...c, classification } : c);
    localStorage.setItem('primerent_admin_classifications', JSON.stringify(updated));
    setClassifications(updated);
    logAuditAction(`Update Data Classification to ${classification}`, id);
    toast({ title: isTh ? 'เปลี่ยนระดับความเป็นส่วนตัวข้อมูลแล้ว' : 'Data classification updated' });
  };

  const handleMaintenanceToggle = () => {
    const nextVal = !maintenanceMode;
    setMaintenanceMode(nextVal);
    localStorage.setItem('primerent_maintenance_mode', String(nextVal));
    logAuditAction(`Toggle Maintenance Mode = ${nextVal.toString().toUpperCase()}`, 'System Infrastructure');
    toast({ title: isTh ? `ระบบเข้าสู่โหมดบำรุงรักษา = ${nextVal}` : `Maintenance mode set to ${nextVal}` });
  };

  const handleSystemUpdate = () => {
    if (isUpdatingSystem) return;
    setIsUpdatingSystem(true);
    setUpdateProgress(0);
    setUpdateConsole([
      '[INFRA] Fetching codebase from remote feature/update-desktop-links...',
      '[INFRA] Merging master branches...',
      '[BUILD] Starting webpack development bundle compiler...',
      '[BUILD] Verifying type definitions and lints...'
    ]);

    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUpdatingSystem(false);
            setUpdateConsole(logs => [...logs, '[SYSTEM] Deploy completed! Dev servers reloaded safely.', '[SYSTEM] Status: ONLINE']);
            logAuditAction('System Patch Update & Build deployment', 'Infrastructure Server');
            toast({ title: isTh ? 'อัปเกรดระบบจำลองสำเร็จ!' : 'System update simulation complete' });
          }, 500);
          return 100;
        }
        const next = prev + 20;
        if (next === 40) {
          setUpdateConsole(logs => [...logs, '[DB] Migration step: Updating primerent_payments with PayoutStatus...', '[DB] Applied successfully']);
        }
        if (next === 80) {
          setUpdateConsole(logs => [...logs, '[BUILD] Bundle generated (2.42MB assets compiled)', '[SYSTEM] Initializing server update hot reload...']);
        }
        return next;
      });
    }, 1000);
  };

  const handleCreateBackup = () => {
    const name = `Backup_${new Date().toISOString().slice(0,19).replace('T', '_')}`;
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
      id: `bk_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      size: Object.keys(snapshotData).length
    };
    try {
      const stored = JSON.parse(localStorage.getItem('primerent_admin_backups') || '[]');
      stored.push(backupItem);
      localStorage.setItem('primerent_admin_backups', JSON.stringify(stored));
      localStorage.setItem(`primerent_snapshot_${backupItem.id}`, JSON.stringify(snapshotData));
      setBackups(stored);
      logAuditAction('Create DB Snapshot Backup', backupItem.name);
      toast({ title: isTh ? 'สร้างจุดกู้คืนระบบเรียบร้อย' : 'Database Snapshot Created' });
    } catch {}
  };

  const handleRestoreBackup = (backupId: string, name: string) => {
    if (window.confirm(isTh ? `ยืนยันการกู้คืนข้อมูลระบบด้วยข้อมูลสำรอง: ${name}?` : `Confirm restoring system database with backup: ${name}?`)) {
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
          
          logAuditAction('Restore Database snapshot', name);
          toast({ title: isTh ? 'กู้คืนฐานข้อมูลสำเร็จแล้ว' : 'Database successfully restored' });
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch {}
    }
  };

  const handleResolveAlert = (alertId: string) => {
    const updated = insiderAlerts.map(a => a.id === alertId ? { ...a, status: 'resolved' as const } : a);
    localStorage.setItem('primerent_admin_insider_alerts', JSON.stringify(updated));
    setInsiderAlerts(updated);
    logAuditAction('Insider Trading alert resolved', alertId);
    toast({ title: isTh ? 'เครดิตการค้าภายในได้รับการประเมิน/แก้ไขแล้ว' : 'Insider alert cleared' });
  };

  const handleBroadcast = async () => {
    console.log('handleBroadcast called');
    console.log('Title:', broadcastTitle);
    console.log('Message:', broadcastMessage);
    console.log('Roles:', broadcastRoles);
    console.log('Locations:', broadcastLocations);
    
    // Fallback alert to ensure function is called
    alert('กดปุ่มแล้ว - กำลังส่ง Broadcast');
    
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      console.log('Validation failed: title or message empty');
      alert('กรุณากรอกหัวข้อและข้อความ');
      toast({ title: isTh ? 'กรุณากรอกหัวข้อและข้อความ' : 'Please enter title and message', variant: 'destructive' });
      return;
    }

    setIsBroadcasting(true);
    console.log('Starting API call...');
    
    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage,
          segment: {
            roles: broadcastRoles.length > 0 ? broadcastRoles as any : undefined,
            locations: broadcastLocations.length > 0 ? broadcastLocations : undefined,
            budgetMin: broadcastBudgetMin ? Number(broadcastBudgetMin) : undefined,
            budgetMax: broadcastBudgetMax ? Number(broadcastBudgetMax) : undefined,
            propertyTypes: broadcastPropertyTypes.length > 0 ? broadcastPropertyTypes : undefined,
          },
          sendToLineOA,
          createdBy: firebaseUser?.uid || 'admin',
        }),
      });

      console.log('API response status:', response.status);
      const result = await response.json();
      console.log('API response result:', result);
      
      if (!response.ok) {
        console.error('API error:', result);
        alert('Error: ' + (result.error || 'Failed to send broadcast'));
        throw new Error(result.error || 'Failed to send broadcast');
      }

      console.log('Broadcast successful, showing toast');
      alert('ส่ง Broadcast สำเร็จ: ' + result.message);
      toast({ 
        title: isTh ? '📢 ส่ง Broadcast สำเร็จ' : 'Broadcast sent successfully',
        description: result.message 
      });

      // Reset form
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastRoles([]);
      setBroadcastLocations([]);
      setBroadcastBudgetMin('');
      setBroadcastBudgetMax('');
      setBroadcastPropertyTypes([]);
      setSendToLineOA(false);

      logAuditAction('Broadcast sent', `Target: ${result.targetUserCount} users, LINE OA: ${sendToLineOA ? 'Yes' : 'No'}`);
    } catch (error) {
      console.error('Broadcast error:', error);
      toast({ title: isTh ? 'ส่ง Broadcast ไม่สำเร็จ' : 'Failed to send broadcast', variant: 'destructive' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 space-y-6 font-thai">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4 border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin & System Center</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{isSuperAdmin ? 'Super Administrator Console' : 'System Administrator Console'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NavbarNotifications lang={isTh ? 'th' : 'en'} />
          <Button variant="outline" size="sm" onClick={loadDatabase} className="h-9 rounded-xl font-bold border-slate-200">
            <RefreshCw className="w-4 h-4 mr-2 text-slate-400" />
            {isTh ? 'อัปเดตข้อมูล' : 'Reload Database'}
          </Button>
        </div>
      </div>

      <div className="flex gap-1.5 bg-slate-200/50 p-1.5 rounded-2xl w-fit border border-slate-200/50 shadow-inner overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('analytics')} className={cn('px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap', activeTab === 'analytics' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800')}>
          📊 {isTh ? 'รายงานวิเคราะห์' : 'Analytics'}
        </button>
        <button onClick={() => setActiveTab('members')} className={cn('px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap', activeTab === 'members' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800')}>
          👥 {isTh ? 'จัดการสมาชิก' : 'Members'}
        </button>
        <button onClick={() => setActiveTab('agents')} className={cn('px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap', activeTab === 'agents' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800')}>
          🕵️ {isTh ? 'ตรวจสอบ KYC เอเจ้นต์' : 'Agent KYC'}
        </button>
        <button onClick={() => setActiveTab('compliance')} className={cn('px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap', activeTab === 'compliance' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800')}>
          ⚠️ {isTh ? 'ร้องเรียนและทุจริต' : 'Scams & Compliance'}
        </button>
        <button onClick={() => setActiveTab('financials')} className={cn('px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap', activeTab === 'financials' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800')}>
          💰 {isTh ? 'ธุรกรรมและการคืนเงิน' : 'Refunds & Payouts'}
        </button>
        <button onClick={() => setActiveTab('broadcast')} className={cn('px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap', activeTab === 'broadcast' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800')}>
          📢 {isTh ? 'Broadcast & Segment' : 'Broadcast'}
        </button>
        <button onClick={() => setActiveTab('security')} className={cn('px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap', activeTab === 'security' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800')}>
          🔒 {isTh ? 'ความปลอดภัยข้อมูล' : 'Security Audit'}
        </button>
        <button onClick={() => setActiveTab('system')} className={cn('px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap', activeTab === 'system' ? 'bg-white text-slate-950 shadow-sm border border-slate-200/10' : 'text-slate-500 hover:text-slate-800')}>
          ⚙️ {isTh ? 'ดูแลระบบหลังบ้าน' : 'System Admin'}
        </button>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Members', value: users.length, sub: 'Registered accounts', color: 'border-l-indigo-500', icon: '👥' },
              { label: 'Agent Proposals', value: agentRequests.filter(r => r.ndidStatus === 'pending').length, sub: 'KYC Waiting', color: 'border-l-amber-500', icon: '🕵️' },
              { label: 'Active Reports', value: scamReports.filter(r => r.status === 'open').length, sub: 'Scam warning flags', color: 'border-l-red-500', icon: '⚠️' },
              { label: 'Total Refunds Awaiting', value: refunds.filter(r => r.status !== 'completed').length, sub: 'Requires dual checks', color: 'border-l-violet-500', icon: '💸' }
            ].map((card, i) => (
              <Card key={i} className={cn('border border-slate-200 shadow-sm rounded-2xl bg-white p-5 border-l-4', card.color)}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                    <p className="text-2xl font-black text-slate-800 mt-1.5">{card.value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{card.sub}</p>
                  </div>
                  <span className="text-xl bg-slate-50 p-2 rounded-xl border">{card.icon}</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm">
              <CardTitle className="text-sm font-black text-slate-800 mb-4">{isTh ? 'สถิติรายได้ธุรกรรมรายเดือน' : 'Platform Transaction History'}</CardTitle>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `฿${v / 1000}k`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#revColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-4">
              <CardTitle className="text-sm font-black text-slate-800">{isTh ? 'สรุปการฝากเงินของส่วนกลาง (System Escrow Hold)' : 'System Escrow Hold Summary'}</CardTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-bold text-xs text-slate-800">Pool 1: {isTh ? 'ค่ามัดจำสัญญา (โอนตรง)' : 'Security Deposit (Direct)'}</p>
                    <p className="text-[10px] text-slate-400">Owner handles deposit approval directly</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-black">฿480,000</Badge>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-bold text-xs text-slate-800">Pool 2: {isTh ? 'ค่าเช่าล่วงหน้า (ระบบกลาง)' : 'Advance Rent Escrow (Central)'}</p>
                    <p className="text-[10px] text-slate-400">Holds Website fee, Agent, and Co-Agent payouts</p>
                  </div>
                  <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-black">฿120,000</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-slate-800">Pool 3: {isTh ? 'ค่าเช่าห้องพักรายเดือน' : 'Monthly Room Rents processed'}</p>
                    <p className="text-[10px] text-slate-400">Processed through system invoice checks monthly</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-700 border font-black">฿185,000</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-black text-sm text-slate-800">{isTh ? '👥 ระบบจัดการและแก้ไขสิทธิ์สมาชิก' : '👥 Platform Members Management'}</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder={isTh ? 'ค้นหาสมาชิก...' : 'Search members...'} className="pl-9 h-9 text-xs rounded-xl" />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b">
                <tr className="font-black text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="p-4">{isTh ? 'ชื่อโปรไฟล์' : 'User'}</th>
                  <th className="p-4 text-center">{isTh ? 'บทบาทปัจจุบัน' : 'Current Role'}</th>
                  <th className="p-4 text-center">{isTh ? 'เอกสาร KYC' : 'KYC Doc'}</th>
                  <th className="p-4 text-center">{isTh ? 'สถานะบัญชี' : 'Status'}</th>
                  <th className="p-4 text-center">{isTh ? 'จัดการสิทธิ์บทบาท' : 'Modify Role'}</th>
                  <th className="p-4 text-right">{isTh ? 'การดำเนินการ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {users.filter(u => u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-black text-slate-900">{u.displayName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border font-bold uppercase">{u.role}</span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge className={u.kycStatus === 'verified' ? 'bg-green-50 text-green-700 border-green-100 border' : 'bg-amber-50 text-amber-700 border-amber-100 border'}>
                        {u.kycStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg', u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700')}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <select value={u.role} onChange={e => handleUpdateUserRole(u.id, e.target.value as any)} className="border rounded-xl px-2 py-1 text-xs bg-white font-bold focus:outline-none">
                        <option value="user">User</option>
                        <option value="renter">Renter</option>
                        <option value="landlord">Landlord</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                        {isSuperAdmin && <option value="superadmin">SuperAdmin</option>}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {u.status === 'active' ? (
                          <>
                            <Button variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 text-[10px] font-black h-7 px-2" onClick={() => handleUpdateUserStatus(u.id, 'suspended')}>
                              {isTh ? 'ระงับบัญชี' : 'Suspend'}
                            </Button>
                            <Button variant="destructive" className="text-[10px] font-black h-7 px-2" onClick={() => handleUpdateUserStatus(u.id, 'banned')}>
                              {isTh ? 'แบนถาวร' : 'Ban User'}
                            </Button>
                          </>
                        ) : (
                          <Button className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black h-7 px-2" onClick={() => handleUpdateUserStatus(u.id, 'active')}>
                            {isTh ? 'ปลดระงับ' : 'Activate'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="space-y-6">
          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-black text-slate-800">{isTh ? '🕵️ รายการขออัปเกรดสมัครเอเจ้นต์รอตรวจสอบ' : '🕵️ Pending Agent Upgrade Requests'}</CardTitle>
              <CardDescription className="text-xs">{isTh ? 'ตรวจสอบเอกสารการยืนยันตัวตน, NDID, Liveness score และประวัติบริษัทประกอบการ' : 'Verify submitted identity documents, NDID status, and liveness checklist'}</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b">
                  <tr className="font-black text-slate-400 text-[10px] uppercase">
                    <th className="p-4">{isTh ? 'ผู้สมัคร' : 'Applicant'}</th>
                    <th className="p-4">{isTh ? 'เลขที่ใบอนุญาต' : 'License Number'}</th>
                    <th className="p-4 text-center">NDID Status</th>
                    <th className="p-4 text-center">Liveness Score</th>
                    <th className="p-4 text-center">{isTh ? 'เอกสารประกอบ' : 'Documents'}</th>
                    <th className="p-4 text-right">{isTh ? 'ดำเนินการ' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {agentRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-black text-slate-900">{req.name}</p>
                        <p className="text-[10px] text-slate-400">{req.email}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{isTh ? 'บริษัท:' : 'Broker:'} {req.brokerName}</p>
                      </td>
                      <td className="p-4 font-mono font-bold">{req.licenseNumber}</td>
                      <td className="p-4 text-center">
                        <Badge className={req.ndidStatus === 'verified' ? 'bg-green-50 text-green-700 border border-green-100 font-black' : 'bg-amber-50 text-amber-700 border border-amber-100 font-black'}>
                          {req.ndidStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-center font-bold">{req.livenessScore}%</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          {req.documents.map((d, i) => (
                            <span key={i} className="inline-flex items-center text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50 w-fit">
                              📄 {d.type} ({d.filename})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {req.ndidStatus === 'verified' ? (
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" className="border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-black text-[10px] h-8" onClick={() => handleAgentKYC(req.id, req.userId, 'reject')}>
                              ❌ ปฏิเสธ
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-black text-[10px] h-8" onClick={() => handleAgentKYC(req.id, req.userId, 'approve')}>
                              ✓ อนุมัติเอเจ้นต์
                            </Button>
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 font-bold text-center">{isTh ? 'รอ NDID ยืนยันสำเร็จ' : 'Awaiting NDID'}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-black text-slate-800">{isTh ? '📑 สรุปการจัดการและตรวจสอบเอกสารสัญญาเช่า (Document Audit trail)' : '📑 Platform Document Audits'}</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b">
                  <tr className="font-black text-slate-400 text-[10px] uppercase">
                    <th className="p-4">{isTh ? 'ชื่อทรัพย์สิน' : 'Property'}</th>
                    <th className="p-4">{isTh ? 'ผู้เช่า / เจ้าของ' : 'Parties'}</th>
                    <th className="p-4 text-center">{isTh ? 'การลงชื่อ' : 'Signatures'}</th>
                    <th className="p-4 text-center">{isTh ? 'สถานะสัญญา' : 'Status'}</th>
                    <th className="p-4 text-right">{isTh ? 'ความถูกต้องข้อมูล' : 'Verify'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-black text-slate-900">{doc.propertyName}</td>
                      <td className="p-4">
                        <p className="text-slate-800">{doc.tenantName} (Tenant)</p>
                        <p className="text-slate-500">{doc.ownerName} (Owner)</p>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className="bg-slate-100 border text-slate-700 font-black">{doc.signaturesCount}/3 Signed</Badge>
                      </td>
                      <td className="p-4 text-center font-bold text-indigo-700">{doc.status}</td>
                      <td className="p-4 text-right">
                        <Button variant="outline" className="rounded-xl h-8 text-[10px] font-black gap-1.5" onClick={() => setActiveDocAudit(doc)}>
                          <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                          {isTh ? 'ตรวจประวัติการเซ็น' : 'Audit Trails'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <Card className="border border-rose-200 bg-rose-50/5 rounded-2xl p-5 shadow-sm space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-black text-rose-950 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                {isTh ? 'การตรวจสอบความผิดปกติและทุจริตภายใน (Insider Trading & Compliance Alerts)' : 'Compliance & Insider Trading Analysis'}
              </CardTitle>
              <CardDescription className="text-xs text-rose-700">{isTh ? 'ตรวจสอบความผันผวนของราคาก่อนทำสัญญา และพฤติกรรมผลประโยชน์ทับซ้อนของนายหน้า' : 'Automated checks warning of pre-rent price manipulations and broker self-dealing conflicts'}</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto border border-rose-100 rounded-xl divide-y divide-rose-100 bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-rose-50/50 border-b border-rose-100">
                  <tr className="font-black text-rose-700 text-[10px] uppercase">
                    <th className="p-4">{isTh ? 'ประเภทปัญหา' : 'Type'}</th>
                    <th className="p-4">{isTh ? 'คำอธิบายความผิดปกติ' : 'Anomaly Description'}</th>
                    <th className="p-4 text-center">{isTh ? 'ความรุนแรง' : 'Severity'}</th>
                    <th className="p-4 text-center">{isTh ? 'วันที่พบ' : 'Detected'}</th>
                    <th className="p-4 text-right">{isTh ? 'จัดการสิทธิ์' : 'Resolve'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {insiderAlerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-rose-50/10">
                      <td className="p-4">
                        <Badge className="bg-rose-100 text-rose-800 border-none font-bold text-[9px] uppercase">{alert.type}</Badge>
                      </td>
                      <td className="p-4 text-slate-900">{alert.description}</td>
                      <td className="p-4 text-center">
                        <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border', alert.severity === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100')}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-500 font-bold">{alert.createdAt}</td>
                      <td className="p-4 text-right">
                        {alert.status === 'active' ? (
                          <Button className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] h-8" onClick={() => handleResolveAlert(alert.id)}>
                            {isTh ? 'ตรวจสอบและยกเลิกการเตือน' : 'Clear Flag'}
                          </Button>
                        ) : (
                          <span className="text-green-600 text-[10px] font-bold">✓ Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-800">{isTh ? '⚠️ จัดการรายการรายงานประกาศต้องสงสัย / สแปม' : '⚠️ Scam Tickets & Listing Reports'}</CardTitle>
                <CardDescription className="text-xs">{isTh ? 'ลบโพสต์ระงับประกาศไม่น่าไว้วางใจหรือแบนบัญชีตามข้อมูลที่ตรวจสอบ' : 'Takedown scams or dismiss false reports after reviewing screenshot evidence'}</CardDescription>
              </div>
            </CardHeader>
            <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b">
                  <tr className="font-black text-slate-400 text-[10px] uppercase">
                    <th className="p-4">{isTh ? 'หัวข้อและรายละเอียด' : 'Reason / Report'}</th>
                    <th className="p-4">{isTh ? 'เป้าหมายที่ถูกรายงาน' : 'Target Entity'}</th>
                    <th className="p-4 text-center">{isTh ? 'หลักฐานแนบ' : 'Evidence'}</th>
                    <th className="p-4 text-center">{isTh ? 'สถานะ' : 'Status'}</th>
                    <th className="p-4 text-right">{isTh ? 'จัดการ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {scamReports.map(rep => (
                    <tr key={rep.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-black text-slate-900">{rep.reason}</p>
                        <p className="text-[10px] text-slate-400">{isTh ? 'ผู้แจ้ง:' : 'By:'} {rep.reporterName} · {rep.createdAt}</p>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-slate-100 text-slate-700 border-none font-bold text-[9px] uppercase mr-1">{rep.targetType}</Badge>
                        <span className="font-mono text-slate-500">#{rep.targetId}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold text-blue-600 underline cursor-pointer">🖼 {rep.evidence}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-lg border', rep.status === 'open' ? 'bg-red-50 text-red-700 border-red-100' : rep.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200')}>
                          {rep.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {rep.status === 'open' && (
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" className="h-8 font-black text-[10px]" onClick={() => handleScamReport(rep.id, 'dismiss')}>
                              {isTh ? 'ปิดรายงาน' : 'Dismiss'}
                            </Button>
                            <Button variant="destructive" className="h-8 font-black text-[10px] bg-red-600 hover:bg-red-700 text-white" onClick={() => handleScamReport(rep.id, 'takedown')}>
                              🚫 Takedown
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'financials' && (
        <div className="space-y-6">
          {/* Admin Escrow Verification Panel */}
          <Card className="border border-indigo-200 bg-indigo-50/5 rounded-2xl p-5 shadow-sm space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-black flex items-center gap-2 text-indigo-950">
                <Shield className="w-5 h-5 text-indigo-600" />
                {isTh ? 'ระบบตรวจสอบสลิปของส่วนกลาง (Admin Central Escrow)' : 'Admin Escrow Slips Review'}
              </CardTitle>
              <CardDescription className="text-xs text-indigo-700">
                {isTh ? 'ตรวจสอบความถูกต้องของสลิปที่ต้องโอนผ่านระบบส่วนกลางเพื่อป้องกันการฉ้อโกงก่อนปลดล็อคยอดจ่ายให้คู่สัญญา' : 'Verify system escrow slips before processing commission payouts'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {payments.filter((p) => p.status === 'slip_uploaded' || p.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-indigo-600/55 text-xs font-bold border border-dashed rounded-xl bg-white">
                  {isTh ? 'ไม่มีสลิปรอตรวจสอบในระบบส่วนกลาง' : 'No pending escrow slips'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {payments.filter((p) => p.status === 'slip_uploaded' || p.status === 'pending').map((p) => (
                    <div key={p.id} className="flex items-center justify-between border border-indigo-100 bg-white rounded-xl p-4 shadow-sm">
                      <div>
                        <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold text-[9px] mb-1">
                          {p.type === 'deposit' ? (isTh ? 'ค่ามัดจำ (Pool 1)' : 'Deposit (Pool 1)') : p.type === 'advance' ? (isTh ? 'ค่าเช่าล่วงหน้า (Pool 2)' : 'Advance (Pool 2)') : (isTh ? 'รายเดือน (Pool 3)' : 'Monthly (Pool 3)')}
                        </Badge>
                        <p className="font-black text-xs text-gray-900">{isTh ? `จากผู้ใช้ ID: ${p.payerId.substring(0,8)}` : `From User ID: ${p.payerId.substring(0,8)}`}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">ID: #${p.id.slice(-8)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-indigo-900 text-sm">฿${p.amount.toLocaleString()}</p>
                        <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs gap-1.5 h-9" onClick={() => setSelectedPayment(p)}>
                          <Eye className="w-3.5 h-3.5" />
                          {isTh ? 'ตรวจสอบ' : 'Verify'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-violet-200 bg-violet-50/5 rounded-2xl p-5 shadow-sm space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-black text-violet-950 flex items-center gap-2">
                <Lock className="w-5 h-5 text-violet-600" />
                {isTh ? 'ระบบคืนเงินอนุมัติสองขั้นตอน (Dual Approval Refund Flow)' : 'Dual Approval Refund Panel'}
              </CardTitle>
              <CardDescription className="text-xs text-violet-700">
                {isTh ? '🔒 การคืนเงินจำเป็นต้องผ่าน Admin กดอนุมัติเบื้องต้น และ Super Admin ยืนยันยอดเงินจ่ายออกจึงจะเสร็จสมบูรณ์' : '🔒 Payouts require Admin review first, followed by Super Admin keys confirmation to verify cash out'}
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto border border-violet-100 bg-white rounded-xl divide-y divide-violet-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-violet-50/50 border-b border-violet-100">
                  <tr className="font-black text-violet-700 text-[10px] uppercase">
                    <th className="p-4">{isTh ? 'ผู้ร้องขอและเหตุผล' : 'Refund Request / Reason'}</th>
                    <th className="p-4 text-center">{isTh ? 'การลงชื่ออนุมัติ' : 'Approval Steps'}</th>
                    <th className="p-4 text-center">{isTh ? 'ยอดคืนเงิน' : 'Amount'}</th>
                    <th className="p-4 text-center">{isTh ? 'สถานะล่าสุด' : 'Current Status'}</th>
                    <th className="p-4 text-right">{isTh ? 'การดำเนินการ' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {refunds.map(ref => (
                    <tr key={ref.id} className="hover:bg-violet-50/10">
                      <td className="p-4">
                        <p className="font-black text-slate-900">{ref.reason}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{isTh ? `จากผู้เช่า: ${ref.tenantName} ถึง ${ref.ownerName}` : `Tenant: ${ref.tenantName} to ${ref.ownerName}`}</p>
                        <p className="text-[10px] text-slate-400">Request: #{ref.id} · {ref.createdAt}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-[10px]">
                          <span className={cn('font-bold inline-flex items-center gap-1.5', ref.adminApprovedBy ? 'text-green-600' : 'text-slate-400')}>
                            {ref.adminApprovedBy ? '✅' : '⏳'} Admin Approved {ref.adminApprovedBy && `(${ref.adminApprovedBy})`}
                          </span>
                          <span className={cn('font-bold inline-flex items-center gap-1.5', ref.superAdminApprovedBy ? 'text-green-600' : 'text-slate-400')}>
                            {ref.superAdminApprovedBy ? '✅' : '⏳'} SuperAdmin Confirmed
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-black text-slate-900 text-sm">฿{ref.amount.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase', ref.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : ref.status === 'admin_approved' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100')}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {ref.status === 'pending' && (
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] h-8" onClick={() => handleRefundAdminApprove(ref.id)}>
                              {isTh ? '✅ แอดมินตรวจสอบผ่าน' : 'Admin Approve'}
                            </Button>
                          )}
                          {ref.status === 'admin_approved' && (
                            <Button disabled={!isSuperAdmin} className="bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] h-8 disabled:opacity-40" onClick={() => handleRefundSuperAdminConfirm(ref.id)}>
                              🔑 {isTh ? 'ซุปเปอร์แอดมินอนุมัติ' : 'SuperAdmin Confirm'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
            <CardTitle className="text-base font-black text-slate-800">{isTh ? 'สรุปการคำนวณและจ่ายเงินนายหน้า (Central Commission Records)' : 'Global Commission Split Ledger'}</CardTitle>
            <CommissionLedger lang={lang} />
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-500" />
                  {isTh ? 'บังคับเปิด 2FA ทั่วระบบ' : 'Enforce Global 2FA'}
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-2 font-bold leading-relaxed">
                  {isTh ? 'เปิดสวิตช์นี้เพื่อบังคับให้เจ้าของ (Owner) และนายหน้า (Agent) ทุกคนต้องตั้งค่าการยืนยันตัวตนสองขั้นตอนก่อนทำสัญญาสำเร็จ' : 'Force all Owners and Agents to configure 2-factor authentication check before digital leases.'}
                </p>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <span className="text-xs font-black text-slate-700">{isTh ? 'สถานะบังคับใช้' : 'Enforcement'}</span>
                <button onClick={handle2faToggle} className={`w-12 h-6 rounded-full transition-colors ${is2faEnforced ? 'bg-amber-500' : 'bg-slate-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${is2faEnforced ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </Card>

            <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm md:col-span-2 space-y-4">
              <CardTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                {isTh ? 'ประวัติความปลอดภัยและการกระทำของแอดมิน (Security Audit Log)' : 'Security Audit Log'}
              </CardTitle>
              <div className="max-h-[160px] overflow-y-auto border rounded-xl divide-y text-xs font-bold text-slate-600 bg-slate-50/50">
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="p-3 flex justify-between gap-3 hover:bg-slate-50">
                    <div>
                      <p className="font-black text-slate-800">{log.action}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Target: {log.target} · Admin: {log.adminName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[9px] text-slate-500">{log.ipAddress}</p>
                      <p className="text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                {isTh ? 'ระบบจัดการระดับความเป็นส่วนตัวข้อมูลระบบ (Data Classification)' : 'Data Classification Schema Management'}
              </CardTitle>
              <CardDescription className="text-xs">
                {isTh ? 'จำแนกชั้นความลับและความปลอดภัยฟิลด์ฐานข้อมูลเพื่อความปลอดภัยของข้อมูลผู้เช่า' : 'Assign database fields classification level ensuring user identity encryption'}
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto border rounded-xl divide-y divide-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b">
                  <tr className="font-black text-slate-400 text-[10px] uppercase">
                    <th className="p-4">{isTh ? 'ตาราง/ฟิลด์ฐานข้อมูล' : 'Database Field'}</th>
                    <th className="p-4 text-center">{isTh ? 'ระดับความลับข้อมูล' : 'Classification Level'}</th>
                    <th className="p-4 text-center">{isTh ? 'ผู้ดูแลสิทธิ์รับผิดชอบ' : 'Authorized Role'}</th>
                    <th className="p-4 text-right">{isTh ? 'แก้ไขระดับ' : 'Edit Level'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {classifications.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-slate-900">{item.field}</td>
                      <td className="p-4 text-center">
                        <span className={cn('text-[9px] font-black px-2 py-0.5 rounded-lg border',
                          item.classification === 'Secret' ? 'bg-red-50 text-red-700 border-red-100' :
                          item.classification === 'Confidential' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          item.classification === 'Restricted' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'
                        )}>
                          {item.classification}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-500">{item.owner}</td>
                      <td className="p-4 text-right">
                        <select value={item.classification} onChange={e => handleClassificationChange(item.id, e.target.value as any)} className="border rounded-xl px-2 py-1 text-xs bg-white font-bold focus:outline-none">
                          <option value="Public">Public</option>
                          <option value="Restricted">Restricted</option>
                          <option value="Confidential">Confidential</option>
                          <option value="Secret">Secret</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          <Card className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-rose-600" />
                {isTh ? 'Broadcast & Segment Control' : 'Broadcast & Segment Control'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {isTh ? 'แจ้งข่าวสาร โปรโมชั่น หรือห้องว่างให้กับกลุ่มลูกค้าแบบเจาะจง (ไม่ spam ทุกคน)' : 'Send targeted announcements, promotions, or new listings to specific user segments'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-700 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> {isTh ? 'เลือกกลุ่มเป้าหมาย (Segment)' : 'Target Segment'}
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {(['user', 'renter', 'landlord', 'owner', 'agent'] as const).map(role => (
                      <Badge key={role} onClick={() => {
                        setBroadcastRoles(prev => 
                          prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                        );
                      }}
                      className={`cursor-pointer px-3 py-1.5 text-[10px] font-black border transition-all ${broadcastRoles.includes(role) ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                        {role === 'user' ? (isTh ? 'ผู้ใช้ใหม่' : 'New User') : 
                         role === 'renter' ? (isTh ? 'ผู้เช่า' : 'Renter') :
                         role === 'landlord' ? (isTh ? 'เจ้าของที่พัก' : 'Landlord') :
                         role === 'owner' ? (isTh ? 'เจ้าของห้อง' : 'Owner') :
                         (isTh ? 'นายหน้า' : 'Agent')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-700">{isTh ? 'ย่านที่ต้องการ (Locations)' : 'Target Locations'}</Label>
                  <Input 
                    placeholder={isTh ? 'เช่น อโศก, สุขุมวิท, ลาดพร้าว (คั่นด้วยจุลภาค)' : 'e.g., Asoke, Sukhumvit, Ladprao (comma separated)'}
                    value={broadcastLocations.join(', ')}
                    onChange={e => setBroadcastLocations(e.target.value.split(',').map(l => l.trim()).filter(Boolean))}
                    className="text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500">{isTh ? 'งบประมาณเริ่มต้น (บาท)' : 'Budget Min (THB)'}</Label>
                    <Input type="number" placeholder="5,000" value={broadcastBudgetMin} onChange={e => setBroadcastBudgetMin(e.target.value)} className="h-9 text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black text-slate-500">{isTh ? 'งบประมาณสูงสุด (บาท)' : 'Budget Max (THB)'}</Label>
                    <Input type="number" placeholder="20,000" value={broadcastBudgetMax} onChange={e => setBroadcastBudgetMax(e.target.value)} className="h-9 text-xs font-bold" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-700">{isTh ? 'ประเภททรัพย์สิน (Property Types)' : 'Property Types'}</Label>
                  <div className="flex gap-2 flex-wrap">
                    {(['condo', 'apartment', 'house', 'townhouse', 'studio'] as const).map(type => (
                      <Badge key={type} onClick={() => {
                        setBroadcastPropertyTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                      }}
                      className={`cursor-pointer px-2.5 py-1 text-[10px] font-black border transition-all ${broadcastPropertyTypes.includes(type) ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-700">{isTh ? 'หัวข้อ (Title)' : 'Broadcast Title'}</Label>
                  <Input 
                    placeholder={isTh ? 'เช่น โปรโมชั่นพิเศษเดือนนี้!' : 'e.g., Special Promotion This Month!'}
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className="text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-700">{isTh ? 'ข้อความ (Message)' : 'Broadcast Message'}</Label>
                  <textarea 
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    placeholder={isTh ? "ใส่รายละเอียดประกาศ เช่น '🔥 ยูนิตหลุดดาวน์พร้อมอยู่คอนโดอโศก ลดกระหน่ำเฉพาะวันนี้!'" : "Enter announcement details, e.g., '🔥 Hot deal at Asoke Condo, special discount today only!'"}
                    className="w-full border rounded-xl p-3 text-xs font-bold text-slate-800 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="lineOA"
                    checked={sendToLineOA}
                    onChange={e => setSendToLineOA(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                  />
                  <Label htmlFor="lineOA" className="text-xs font-bold text-slate-700 cursor-pointer">
                    {isTh ? 'ส่งไปยัง LINE OA ด้วย (Sync with LINE Official Account)' : 'Send to LINE OA (Sync with LINE Official Account)'}
                  </Label>
                </div>

                <Button 
                  onClick={handleBroadcast} 
                  disabled={isBroadcasting}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs h-10"
                >
                  {isBroadcasting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isTh ? 'กำลังส่ง...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4 mr-2" />
                      {isTh ? '📢 ส่งข้อความแบบ Broadcast' : 'Send Broadcast'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-5">
              <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                {isTh ? 'ปรับปรุงระบบและจำลองการอัพเดท (Updates & Maintenance)' : 'Updates & Maintenance'}
              </CardTitle>
              
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-bold text-xs text-slate-800">{isTh ? 'โหมดปิดปรับปรุงระบบชั่วคราว (Maintenance Mode)' : 'Maintenance Mode'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Locks regular access, displays placeholder screen</p>
                </div>
                <button onClick={handleMaintenanceToggle} className={`w-12 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-primary' : 'bg-slate-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="font-bold text-xs text-slate-800">{isTh ? 'ตัวจำลองการอัปเดตเซิร์ฟเวอร์ (Update Simulation)' : 'Update Simulation Patch'}</p>
                <div className="bg-slate-900 text-slate-300 font-mono text-[10px] p-4 rounded-xl space-y-1.5 h-36 overflow-y-auto shadow-inner">
                  {updateConsole.map((log, idx) => <p key={idx}>{log}</p>)}
                  {isUpdatingSystem && <p className="animate-pulse text-yellow-500">&gt;&gt;&gt; Building assets {updateProgress}% ...</p>}
                </div>
                <Button onClick={handleSystemUpdate} disabled={isUpdatingSystem} className="w-full bg-slate-900 text-white rounded-xl h-10 font-black text-xs gap-1.5">
                  <RefreshCw className={cn('w-4 h-4', isUpdatingSystem && 'animate-spin')} />
                  {isUpdatingSystem ? (isTh ? 'กำลังสร้างคอมไพล์...' : 'Building Patch...') : (isTh ? 'กดปุ่มจำลองการ Deploy Update' : 'Simulate Hot Deploy')}
                </Button>
              </div>
            </Card>

            <Card className="border border-slate-200 rounded-2xl bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  {isTh ? 'ระบบสำรองและกู้คืนข้อมูล (Backup & Snapshot Recovery)' : 'Backup & Recovery Snapshots'}
                </CardTitle>
                <Button onClick={handleCreateBackup} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl h-8 gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  {isTh ? 'สำรองข้อมูล' : 'New Backup'}
                </Button>
              </div>
              <p className="text-xs text-slate-400 font-bold">{isTh ? 'บันทึกภาพรวมข้อมูลชำระเงินและประวัติบัญชีเพื่อย้อนกลับกรณีข้อมูลสูญหาย' : 'Store point-in-time database snapshots in local storage to prevent corruption'}</p>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto font-bold text-xs">
                {backups.map(bk => (
                  <div key={bk.id} className="flex items-center justify-between border rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-black text-slate-900">{bk.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Files count: {bk.size} · Date: {new Date(bk.createdAt).toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl h-8 text-[10px] font-black gap-1 text-blue-600 border-blue-200 bg-blue-50/20 hover:bg-blue-50" onClick={() => handleRestoreBackup(bk.id, bk.name)}>
                      <Undo className="w-3.5 h-3.5" />
                      {isTh ? 'กู้คืนจุดนี้' : 'Restore'}
                    </Button>
                  </div>
                ))}
                {backups.length === 0 && (
                  <div className="text-center py-10 border border-dashed rounded-xl text-slate-400">
                    {isTh ? 'ยังไม่มีไฟล์สำรองระบบสำรองข้อมูลส่วนกลาง' : 'No snapshots backups found'}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeDocAudit && (
        <Dialog open={!!activeDocAudit} onOpenChange={() => setActiveDocAudit(null)}>
          <DialogContent className="max-w-md w-[95vw] max-h-[85vh] overflow-y-auto rounded-2xl font-thai">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                {isTh ? 'ประวัติการเซ็นและโครงสร้างเอกสาร (Audit Trail)' : 'Document Audit Trail'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div className="bg-slate-50 border rounded-xl p-3 space-y-1.5">
                <p>{isTh ? 'ชื่อโครงการ:' : 'Property:'} <span className="font-black text-slate-950">{activeDocAudit.propertyName}</span></p>
                <p>Status: <span className="text-indigo-600 font-black">{activeDocAudit.status}</span></p>
                <p>Signatures Count: <span className="font-black text-slate-950">{activeDocAudit.signaturesCount}/3</span></p>
              </div>
              
              <div className="space-y-2">
                <p className="text-slate-400 font-black text-[10px] uppercase">Signatures Integrity Verification</p>
                <div className="border rounded-xl divide-y">
                  <div className="p-2.5 flex items-center justify-between">
                    <span>1. Owner Digital Signature</span>
                    <Badge className="bg-green-50 text-green-700 border border-green-100 font-bold">✓ VERIFIED</Badge>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span>2. Tenant Digital Signature</span>
                    <Badge className={activeDocAudit.signaturesCount >= 2 ? 'bg-green-50 text-green-700 border border-green-100 font-bold' : 'bg-slate-100 text-slate-400 font-bold'}>
                      {activeDocAudit.signaturesCount >= 2 ? '✓ VERIFIED' : '⏳ PENDING'}
                    </Badge>
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span>3. Agent Witness Signature (Optional)</span>
                    <Badge className={activeDocAudit.signaturesCount >= 3 ? 'bg-green-50 text-green-700 border border-green-100 font-bold' : 'bg-slate-100 text-slate-400 font-bold'}>
                      {activeDocAudit.signaturesCount >= 3 ? '✓ VERIFIED' : '⏳ PENDING'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-[10.5px] leading-relaxed text-yellow-800">
                  {isTh
                    ? 'เอกสารสัญญาทั้งหมดมีลายน้ำประทับวันที่ลงลายมือชื่อดิจิทัลและ IP Address ป้องกันผู้ใดปลอมแปลงข้อมูลข้อตกลง'
                    : 'Digital watermark signature checks verify time-stamp alignment and signing IP addresses.'}
                </p>
              </div>

              <Button onClick={() => setActiveDocAudit(null)} className="w-full h-11 rounded-xl font-black">
                {isTh ? 'ตกลง' : 'Close'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {selectedPayment && (
        <SlipConfirmModal
          open={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          payment={selectedPayment}
          tenantName="สมชาย มีทรัพย์"
          lang={lang}
          confirmedByUid={firebaseUser?.uid || 'admin_uid'}
          onConfirmed={() => {
            setSelectedPayment(null);
            loadDatabase();
          }}
          onRejected={() => {
            setSelectedPayment(null);
            loadDatabase();
          }}
        />
      )}
    </div>
  );
}
