export const refundActions = (set: any, get: any) => ({
  handleRefundAdminApprove: (refundId: string) => {
    const updated = get().refunds.map((r: any) => r.id === refundId ? { ...r, status: 'admin_approved' as const, adminApprovedBy: 'Admin User', adminApprovedAt: new Date().toISOString() } : r);
    localStorage.setItem('primerent_admin_refunds', JSON.stringify(updated));
    set({ refunds: updated });
    get().logAuditAction('Refund Admin Approval', refundId);
  },

  handleRefundSuperAdminConfirm: (refundId: string) => {
    const updated = get().refunds.map((r: any) => r.id === refundId ? { ...r, status: 'completed' as const, superAdminApprovedBy: 'Super Admin', superAdminApprovedAt: new Date().toISOString() } : r);
    localStorage.setItem('primerent_admin_refunds', JSON.stringify(updated));
    set({ refunds: updated });
    get().logAuditAction('Refund SuperAdmin Final Approval', refundId);
  },

  handleRefundReject: (refundId: string, reason: string) => {
    const updated = get().refunds.map((r: any) => r.id === refundId ? { ...r, status: 'rejected' as const, rejectedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User', rejectedReason: reason } : r);
    localStorage.setItem('primerent_admin_refunds', JSON.stringify(updated));
    set({ refunds: updated });
    get().logAuditAction(`Refund Rejected: ${reason}`, refundId);
  }
});
