export const memberActions = (set: any, get: any) => ({
  updateUserRole: (userId: string, role: any) => {
    const updated = get().users.map((u: any) => u.id === userId ? { ...u, role } : u);
    localStorage.setItem('primerent_admin_users', JSON.stringify(updated));
    set({ users: updated });
    get().logAuditAction(`Change Role to ${role.toUpperCase()}`, userId);
  },

  updateUserStatus: (userId: string, status: any, reason?: string) => {
    const updated = get().users.map((u: any) => u.id === userId ? {
      ...u, status,
      ...(status === 'suspended' ? { suspendReason: reason } : {}),
      ...(status === 'banned' ? { banReason: reason } : {}),
    } : u);
    localStorage.setItem('primerent_admin_users', JSON.stringify(updated));
    set({ users: updated });
    get().logAuditAction(`Set Status to ${status.toUpperCase()}${reason ? ` (${reason})` : ''}`, userId);
  }
});
