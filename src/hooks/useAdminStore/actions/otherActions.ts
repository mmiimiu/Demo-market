export const otherActions = (set: any, get: any) => ({
  toggle2fa: () => {
    const nextVal = !get().is2faEnforced;
    localStorage.setItem('primerent_cfg_2fa_enforced', String(nextVal));
    set({ is2faEnforced: nextVal });
    get().logAuditAction(`Toggle Require 2FA = ${String(nextVal).toUpperCase()}`, 'Global Security Configuration');
  },

  updateClassification: (id: string, classification: any) => {
    const updated = get().classifications.map((c: any) => c.id === id ? { ...c, classification, lastModified: new Date().toISOString() } : c);
    localStorage.setItem('primerent_admin_classifications', JSON.stringify(updated));
    set({ classifications: updated });
    get().logAuditAction(`Update Data Classification to ${classification}`, id);
  },

  handleScamReport: (reportId: string, action: 'takedown' | 'dismiss' | 'investigate', resolution?: string) => {
    const statusMap = { takedown: 'resolved', dismiss: 'dismissed', investigate: 'investigating' } as const;
    const updated = get().scamReports.map((r: any) => r.id === reportId ? {
      ...r,
      status: statusMap[action],
      actionTaken: action === 'investigate' ? undefined : (action as any),
      resolvedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User',
      resolvedAt: new Date().toISOString(),
      resolution,
    } : r);
    localStorage.setItem('primerent_admin_scam_reports', JSON.stringify(updated));
    set({ scamReports: updated });
    get().logAuditAction(`Report ticket ${action}`, reportId, resolution);
  },

  resolveSecurityEvent: (eventId: string) => {
    const updated = get().securityEvents.map((e: any) => e.id === eventId ? { ...e, resolved: true, resolvedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User' } : e);
    localStorage.setItem('primerent_admin_security_events', JSON.stringify(updated));
    set({ securityEvents: updated });
    get().logAuditAction('Security Event Resolved', eventId);
  },

  resolveInsiderAlert: (alertId: string, resolution?: string) => {
    const updated = get().insiderAlerts.map((a: any) => a.id === alertId ? {
      ...a, status: 'resolved' as const,
      resolvedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User',
      resolvedAt: new Date().toISOString(),
      resolution,
    } : a);
    // REMOVED LocalStorage persist for insiderAlerts so that refreshing the page resets it to default
    set({ insiderAlerts: updated });
    get().logAuditAction('Insider Trading alert resolved', alertId, resolution);
  }
});
