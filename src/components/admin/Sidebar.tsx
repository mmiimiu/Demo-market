"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Banknote, 
  LogOut,
  Lock,
  Server,
  Database,
  FileText,
  AlertOctagon,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/hooks/useAdminStore';

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useAdminStore();
  const superAdminActive = isSuperAdmin();

  const menuItems = [
    { name: 'Dashboard Analytics', path: '/admin', icon: LayoutDashboard, roles: ['admin', 'superadmin'] },
    { name: 'จัดการสมาชิก', path: '/admin/members', icon: Users, roles: ['admin', 'superadmin'] },
    { name: 'KYC เอเจ้นต์', path: '/admin/agent-kyc', icon: ShieldCheck, roles: ['admin', 'superadmin'] },
    { name: 'ร้องเรียนและทุจริต', path: '/admin/reports', icon: AlertTriangle, roles: ['admin', 'superadmin'] },
    { name: 'ธุรกรรมและการคืนเงิน', path: '/admin/refunds', icon: Banknote, roles: ['admin', 'superadmin'] },
    { name: 'การจัดการเอกสาร', path: '/admin/documents', icon: FileText, roles: ['admin', 'superadmin'] },
    { name: 'ดูแลความปลอดภัย', path: '/admin/security', icon: Lock, roles: ['admin', 'superadmin'] },
    { name: 'Data Classification', path: '/admin/data-classification', icon: Database, roles: ['admin', 'superadmin'] },
    { name: 'System Maintenance', path: '/admin/system', icon: Server, roles: ['superadmin'] },
    { name: 'Backup & Recovery', path: '/admin/backups', icon: Database, roles: ['superadmin'] },
    { name: 'Insider Trading Policy', path: '/admin/insider-policy', icon: AlertOctagon, roles: ['superadmin'] },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full rounded-2xl overflow-hidden shrink-0 m-4 shadow-xl border border-slate-800 font-thai">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
        <div>
          <h2 className="text-white font-black tracking-tight text-xl leading-tight">PrimeAdmin</h2>
          <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">
            {superAdminActive ? 'Super Admin' : 'System Admin'}
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2 mt-2">Main Menu</p>
        
        {menuItems
          .filter(item => superAdminActive ? true : item.roles.includes('admin'))
          .map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
      </nav>

      <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
        <Link 
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <Home className="w-4 h-4 text-slate-500" />
          Home Website
        </Link>
        <button 
          onClick={() => {
            localStorage.removeItem('primerent_user_role');
            localStorage.removeItem('prime_mock_user');
            window.location.href = '/?openLogin=true';
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-slate-400 hover:bg-red-900/30 hover:text-red-400 w-full text-left"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
          Logout
        </button>
      </div>
    </div>
  );
}

