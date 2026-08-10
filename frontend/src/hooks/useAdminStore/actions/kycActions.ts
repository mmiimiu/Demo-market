export const kycActions = (set: any, get: any) => ({
  handleAgentKYC: (requestId: string, userId: string, action: 'approve' | 'reject', reason?: string) => {
    const updatedRequests = get().agentRequests.map((r: any) => r.id === requestId ? {
      ...r,
      ndidStatus: action === 'approve' ? ('verified' as const) : ('failed' as const),
      reviewedBy: get().isSuperAdmin() ? 'Super Admin' : 'Admin User',
      reviewedAt: new Date().toISOString(),
      rejectReason: action === 'reject' ? reason : undefined,
    } : r);
    localStorage.setItem('primerent_admin_agent_requests', JSON.stringify(updatedRequests));
    set({ agentRequests: updatedRequests });

    if (action === 'approve') {
      const updatedUsers = get().users.map((u: any) => u.id === userId ? { ...u, role: 'agent' as const, kycStatus: 'verified' as const } : u);
      localStorage.setItem('primerent_admin_users', JSON.stringify(updatedUsers));
      set({ users: updatedUsers });
    }
    get().logAuditAction(`Agent KYC ${action.toUpperCase()}${reason ? `: ${reason}` : ''}`, userId);
  },

  receiveCriminalCheckWebhook: (requestId: string, status: 'clear' | 'flagged') => {
    const updatedRequests = get().agentRequests.map((r: any) => r.id === requestId ? {
      ...r,
      criminalCheckStatus: status,
      criminalCheckDate: new Date().toISOString().slice(0, 10)
    } : r);
    localStorage.setItem('primerent_admin_agent_requests', JSON.stringify(updatedRequests));
    set({ agentRequests: updatedRequests });
    get().logAuditAction(`Receive Police Criminal Check Webhook [${status.toUpperCase()}]`, requestId);
  }
});
