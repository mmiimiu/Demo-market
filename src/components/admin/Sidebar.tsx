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
  Map,
  MessageCircle,
  Lock,
  Server,
  HeadsetIcon
} from 'lucide-react';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Determine if super admin (mocking based on email or a custom claim for now)
  const isSuperAdmin = user?.email === 'superadmin@primerent.com' || user?.role === 'superadmin';

  const menuItems = [
    { name: 'Dashboard', path: '/admin?tab=analytics', icon: LayoutDashboard, roles: ['admin', 'superadmin'] },
    { name: 'Users', path: '/admin?tab=members', icon: Users, roles: ['admin', 'superadmin'] },
    { name: 'Agent KYC', path: '/admin?tab=agents', icon: ShieldCheck, roles: ['admin', 'superadmin'] },
    { name: 'Reports', path: '/admin?tab=compliance', icon: AlertTriangle, roles: ['admin', 'superadmin'] },
    { name: 'Financials', path: '/admin?tab=financials', icon: Banknote, roles: ['admin', 'superadmin'] },
    { name: 'Help Desk', path: '/admin/support', icon: HeadsetIcon, roles: ['admin', 'superadmin'] },
    { name: 'Security Audit', path: '/admin?tab=security', icon: Lock, roles: ['admin', 'superadmin'] },
    { name: 'System Admin', path: '/admin?tab=system', icon: Server, roles: ['superadmin'] },
    { name: 'Transit Map', path: '/admin/map', icon: Map, roles: ['admin', 'superadmin'] },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full rounded-2xl overflow-hidden shrink-0 m-4 shadow-xl border border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">P</div>
        <div>
          <h2 className="text-white font-black tracking-tight text-xl leading-tight">PrimeAdmin</h2>
          <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-wider">{isSuperAdmin ? 'Super Admin' : 'System Admin'}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2 mt-2">Main Menu</p>
        
        {menuItems.filter(item => isSuperAdmin ? true : item.roles.includes('admin')).map((item) => {
          const isQueryMatch = item.path.includes('?')
            ? typeof window !== 'undefined' && window.location.search === item.path.slice(item.path.indexOf('?'))
            : pathname === item.path;
          const isActive = isQueryMatch || (pathname === '/admin' && item.path === '/admin?tab=analytics' && typeof window !== 'undefined' && !window.location.search);
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
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
          href="/admin?tab=analytics"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <HomeIcon className="w-4 h-4 text-slate-500" />
          Admin Home
        </Link>
        <button 
          onClick={() => {
            // Clear mock credentials
            localStorage.removeItem('primerent_user_role');
            localStorage.removeItem('prime_mock_user');
            // Go to home and flag to open login popup modal
            window.location.href = '/?openLogin=true';
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-slate-400 hover:bg-red-900/30 hover:text-red-400 w-full text-left"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
          Logout
        </button>
      </div>
    </div>
  );
}

function HomeIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
}
