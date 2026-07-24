export const systemActions = (set: any, get: any) => ({
  toggleMaintenanceMode: () => {
    const nextVal = !get().maintenanceMode;
    localStorage.setItem('primerent_maintenance_mode', String(nextVal));
    set({ maintenanceMode: nextVal });
    get().logAuditAction(`Toggle Maintenance Mode = ${String(nextVal).toUpperCase()}`, 'System Infrastructure');
  },

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
    const backupItem = {
      id: `bk_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      size: Object.keys(snapshotData).length,
      type: 'manual' as const,
      status: 'completed' as const,
      retentionDays: 90,
    };
    const stored = JSON.parse(localStorage.getItem('primerent_admin_backups') || '[]');
    stored.push(backupItem);
    localStorage.setItem('primerent_admin_backups', JSON.stringify(stored));
    localStorage.setItem(`primerent_snapshot_${backupItem.id}`, JSON.stringify(snapshotData));
    set({ backups: stored });
    get().logAuditAction('Create DB Snapshot Backup', backupItem.name);
  },

  restoreBackup: (backupId: string, name: string) => {
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
    } catch {
      return false;
    }
  }
});
