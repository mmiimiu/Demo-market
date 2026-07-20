"use client";

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useUser } from '@/firebase';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Read the active simulated role or stored user data
    const activeRole = typeof window !== 'undefined' ? localStorage.getItem('primerent_user_role') : null;
    
    // Fallback to mock profile check
    if (activeRole) {
      setUserRole(activeRole);
    } else if (user) {
      setUserRole((user as any).role || 'renter');
    }
    
    const timer = setTimeout(() => setChecking(false), 200);
    return () => clearTimeout(timer);
  }, [user]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 pt-[80px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Guard Clause: strictly enforce that only 'admin' role can access the layout children
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full bg-slate-50 pt-[80px] px-6 text-center font-thai">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-8 max-w-md shadow-xl shadow-red-100/10 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6 animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">เข้าสู่ระบบเฉพาะผู้ดูแลระบบ</h2>
          <p className="text-sm text-gray-500 font-bold leading-relaxed mb-6">
            หน้านี้สงวนไว้สำหรับบัญชีที่มีบทบาท <span className="text-red-600 font-black">ผู้ดูแลระบบ (Admin)</span> เท่านั้น กรุณาสลับสิทธิ์หรือลงชื่อเข้าใช้ด้วยบัญชีแอดมินจำลอง
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => {
                // Clear simulated roles and redirect
                localStorage.removeItem('primerent_user_role');
                localStorage.removeItem('prime_mock_user');
                window.location.href = '/';
              }}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md shadow-red-600/10 transition-all"
            >
              กลับหน้าหลัก & ลงชื่อออก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 font-thai pt-[80px]">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
