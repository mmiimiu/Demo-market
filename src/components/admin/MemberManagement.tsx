'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, Eye, ShieldCheck, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/hooks/useAdminStore';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AdminUser } from '@/lib/types/admin-types';

export function MemberManagement() {
  const { users, loadDatabase, updateUserRole, updateUserStatus, isSuperAdmin } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionDialog, setActionDialog] = useState<{ user: AdminUser; action: 'suspend' | 'ban' } | null>(null);

  useEffect(() => { loadDatabase(); }, [loadDatabase]);

  const filtered = users.filter(u => {
    const matchSearch = (u.displayName || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAction = () => {
    if (!actionDialog) return;
    updateUserStatus(actionDialog.user.id, actionDialog.action === 'suspend' ? 'suspended' : 'banned', actionReason);
    toast({ title: actionDialog.action === 'suspend' ? 'ระงับบัญชีสำเร็จ' : 'แบนบัญชีสำเร็จ' });
    setActionDialog(null);
    setActionReason('');
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'suspended': return 'bg-amber-100 text-amber-700';
      case 'banned': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const kycColor = (s: string) => {
    switch (s) {
      case 'verified': return 'bg-green-50 text-green-700 border-green-100';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 font-thai">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">จัดการสมาชิก</h1>
          <p className="text-xs text-slate-500 font-bold">ดู, Suspend, Ban, Verify user — แก้ไขสิทธิ์และบทบาท</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'ทั้งหมด', value: users.length, color: 'text-slate-700' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, color: 'text-green-600' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, color: 'text-amber-600' },
          { label: 'Banned', value: users.filter(u => u.status === 'banned').length, color: 'text-red-600' },
          { label: 'Pending', value: users.filter(u => u.status === 'pending').length, color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาสมาชิก..." className="pl-9 h-9 text-xs rounded-xl" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border rounded-xl px-3 py-2 text-xs bg-white font-bold focus:outline-none">
          <option value="all">ทุก Role</option>
          <option value="user">User</option>
          <option value="renter">Renter</option>
          <option value="landlord">Landlord</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded-xl px-3 py-2 text-xs bg-white font-bold focus:outline-none">
          <option value="all">ทุกสถานะ</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Users Table */}
      <Card className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b">
              <tr className="font-black text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="p-4">ชื่อโปรไฟล์</th>
                <th className="p-4 text-center">บทบาท</th>
                <th className="p-4 text-center">KYC</th>
                <th className="p-4 text-center">สถานะ</th>
                <th className="p-4 text-center">แก้ไข Role</th>
                <th className="p-4 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-black text-slate-900">{u.displayName}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">สมัคร: {u.createdAt} · ใช้งานล่าสุด: {u.lastActive}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border font-bold uppercase">{u.role}</span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge className={`${kycColor(u.kycStatus)} border font-bold text-[9px]`}>{u.kycStatus.toUpperCase()}</Badge>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg', statusColor(u.status))}>{u.status.toUpperCase()}</span>
                  </td>
                  <td className="p-4 text-center">
                    <select value={u.role} onChange={e => { updateUserRole(u.id, e.target.value as any); toast({ title: 'อัปเดตบทบาทสำเร็จ' }); }} className="border rounded-xl px-2 py-1 text-xs bg-white font-bold focus:outline-none">
                      <option value="user">User</option>
                      <option value="renter">Renter</option>
                      <option value="landlord">Landlord</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                      {isSuperAdmin() && <option value="superadmin">SuperAdmin</option>}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" className="h-7 text-[10px] font-black rounded-lg" onClick={() => setSelectedUser(u)}>
                        <Eye className="w-3 h-3 mr-1" /> ดู
                      </Button>
                      {u.status === 'active' ? (
                        <>
                          <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 text-[10px] font-black h-7" onClick={() => setActionDialog({ user: u, action: 'suspend' })}>
                            ระงับ
                          </Button>
                          <Button variant="destructive" size="sm" className="text-[10px] font-black h-7" onClick={() => setActionDialog({ user: u, action: 'ban' })}>
                            แบน
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black h-7" onClick={() => { updateUserStatus(u.id, 'active'); toast({ title: 'ปลดระงับสำเร็จ' }); }}>
                          ปลดระงับ
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t bg-slate-50 text-xs text-slate-500 font-bold">
          แสดง {filtered.length} จาก {users.length} สมาชิก
        </div>
      </Card>

      {/* View User Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-md w-[95vw] rounded-2xl font-thai">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                รายละเอียดสมาชิก
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div className="bg-slate-50 border rounded-xl p-4 space-y-2">
                <p>ชื่อ: <span className="font-black text-slate-900">{selectedUser.displayName}</span></p>
                <p>อีเมล: <span className="font-black text-slate-900">{selectedUser.email}</span></p>
                <div className="flex items-center gap-1.5"><span>บทบาท:</span> <Badge className="bg-slate-100 border font-bold text-[9px]">{selectedUser.role.toUpperCase()}</Badge></div>
                <p>สถานะ: <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-bold', statusColor(selectedUser.status))}>{selectedUser.status.toUpperCase()}</span></p>
                <div className="flex items-center gap-1.5"><span>KYC:</span> <Badge className={`${kycColor(selectedUser.kycStatus)} border font-bold text-[9px]`}>{selectedUser.kycStatus.toUpperCase()}</Badge></div>
                <p>สมัครเมื่อ: <span className="text-slate-500">{selectedUser.createdAt}</span></p>
                <p>ใช้งานล่าสุด: <span className="text-slate-500">{selectedUser.lastActive}</span></p>
                {selectedUser.suspendReason && <p>เหตุผลระงับ: <span className="text-amber-600">{selectedUser.suspendReason}</span></p>}
                {selectedUser.banReason && <p>เหตุผลแบน: <span className="text-red-600">{selectedUser.banReason}</span></p>}
              </div>
              <Button onClick={() => setSelectedUser(null)} className="w-full h-10 rounded-xl font-black">ปิด</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Suspend/Ban Reason Dialog */}
      {actionDialog && (
        <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setActionReason(''); }}>
          <DialogContent className="max-w-sm w-[95vw] rounded-2xl font-thai">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                {actionDialog.action === 'suspend' ? <ShieldCheck className="w-5 h-5 text-amber-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                {actionDialog.action === 'suspend' ? 'ระงับบัญชี' : 'แบนบัญชีถาวร'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-600">ผู้ใช้: <span className="font-black text-slate-900">{actionDialog.user.displayName}</span></p>
              <div>
                <label className="text-xs font-black text-slate-700 mb-1 block">เหตุผล *</label>
                <textarea value={actionReason} onChange={e => setActionReason(e.target.value)} placeholder="ระบุเหตุผลในการดำเนินการ..." className="w-full border rounded-xl p-3 text-xs font-bold min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setActionDialog(null); setActionReason(''); }} className="flex-1 rounded-xl font-black text-xs">ยกเลิก</Button>
                <Button onClick={handleAction} disabled={!actionReason.trim()} className={cn('flex-1 rounded-xl font-black text-xs text-white', actionDialog.action === 'suspend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700')}>
                  {actionDialog.action === 'suspend' ? 'ยืนยันระงับ' : 'ยืนยันแบน'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
