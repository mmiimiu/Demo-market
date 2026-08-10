'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Calendar, User, ChevronRight, Inbox, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Language } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface SimulatedEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
  read: boolean;
}

interface SimulatedEmailInboxProps {
  lang: Language;
}

export function SimulatedEmailInbox({ lang }: SimulatedEmailInboxProps) {
  const isTh = lang === 'th';
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);

  const loadEmails = () => {
    try {
      const stored = localStorage.getItem('primerent_simulated_emails');
      if (stored) {
        const parsed = JSON.parse(stored);
        setEmails(parsed);
        // Sync selected email if it still exists
        if (selectedEmail) {
          const updatedSelected = parsed.find((e: SimulatedEmail) => e.id === selectedEmail.id);
          if (updatedSelected) {
            setSelectedEmail(updatedSelected);
          }
        }
      } else {
        setEmails([]);
      }
    } catch (e) {
      console.error('Error loading simulated emails:', e);
    }
  };

  useEffect(() => {
    loadEmails();

    // Listen for storage changes to update live
    const handleStorageChange = () => {
      loadEmails();
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event dispatch hook compatibility
    const interval = setInterval(loadEmails, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedEmail]);

  const handleReadEmail = (email: SimulatedEmail) => {
    const updated = emails.map(e => e.id === email.id ? { ...e, read: true } : e);
    setEmails(updated);
    setSelectedEmail({ ...email, read: true });
    localStorage.setItem('primerent_simulated_emails', JSON.stringify(updated));
  };

  const handleDeleteEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = emails.filter(email => email.id !== id);
    setEmails(updated);
    localStorage.setItem('primerent_simulated_emails', JSON.stringify(updated));
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
    toast({
      title: isTh ? 'ลบอีเมลแล้ว' : 'Email Deleted',
      description: isTh ? 'อีเมลถูกลบออกจากกล่องข้อความจำลองแล้ว' : 'The email was removed from your mock inbox.'
    });
  };

  const handleClearAll = () => {
    setEmails([]);
    setSelectedEmail(null);
    localStorage.removeItem('primerent_simulated_emails');
    toast({
      title: isTh ? 'ล้างกล่องข้อความแล้ว' : 'Inbox Cleared',
      description: isTh ? 'ลบอีเมลจำลองทั้งหมดเรียบร้อยแล้ว' : 'All simulated emails have been deleted.'
    });
  };

  return (
    <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white mt-8">
      <CardHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600 animate-pulse" />
            {isTh ? 'กล่องข้อความอีเมลจำลอง (Simulated Email Inbox)' : 'Simulated Email Inbox'}
          </CardTitle>
          <CardDescription className="text-xs text-gray-500 mt-1">
            {isTh 
              ? 'ระบบจำลองการรับอีเมลแจ้งหนี้ สัญญา ใบเสร็จรับเงิน และแจ้งเตือนเติมเครดิต' 
              : 'Mock sandbox receiving billing, contract, receipt, and credit top-up emails.'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadEmails}
            className="h-8 text-xs font-semibold text-gray-600 gap-1 border-gray-200 hover:bg-gray-50 animate-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {isTh ? 'รีเฟรช' : 'Refresh'}
          </Button>
          {emails.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearAll}
              className="h-8 text-xs font-semibold gap-1 bg-red-50 hover:bg-red-100 text-red-600 border-none shadow-none"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isTh ? 'ล้างทั้งหมด' : 'Clear All'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-5 min-h-[300px] divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          {/* Email List (Left Column) */}
          <div className="md:col-span-2 max-h-[450px] overflow-y-auto divide-y divide-gray-50">
            {emails.length === 0 ? (
              <div className="py-16 text-center px-4">
                <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400">
                  {isTh ? 'ไม่มีอีเมลใหม่ในกล่องข้อความ' : 'Inbox is empty'}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {isTh ? 'ทดลองเติมเครดิตเพื่อส่งใบเสร็จมาที่นี่' : 'Top up your credits to test email reception here.'}
                </p>
              </div>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleReadEmail(email)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-slate-50/80 transition-colors flex items-start gap-3 relative text-left",
                    selectedEmail?.id === email.id ? "bg-blue-50/50" : "",
                    !email.read ? "bg-blue-50/[0.15]" : ""
                  )}
                >
                  {!email.read && (
                    <div className="absolute left-2 top-[22px] w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                  <div className="flex-1 min-w-0 pl-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={cn("text-xs truncate", !email.read ? "font-bold text-gray-900" : "text-gray-500 font-medium")}>
                        {email.from}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                        {new Date(email.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate", !email.read ? "font-bold text-gray-950" : "text-gray-800 font-medium")}>
                      {email.subject}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                      {email.body.replace(/\n+/g, ' ')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteEmail(email.id, e)}
                    className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-md transition-colors shrink-0 mt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Email View (Right Column) */}
          <div className="md:col-span-3 p-6 flex flex-col bg-slate-50/30 text-left">
            {selectedEmail ? (
              <div className="space-y-4 flex-1 flex flex-col animate-in fade-in duration-200">
                <div className="border-b border-gray-100 pb-4 space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    {selectedEmail.subject}
                  </h3>
                  
                  <div className="flex flex-col gap-1 text-[11px] text-gray-500 font-semibold">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 w-12">{isTh ? 'จาก:' : 'From:'}</span>
                      <span className="text-gray-800">{selectedEmail.from}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 w-12">{isTh ? 'ถึง:' : 'To:'}</span>
                      <span className="text-gray-800">{selectedEmail.to}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 w-12">{isTh ? 'วันที่:' : 'Date:'}</span>
                      <span className="text-gray-600">
                        {new Date(selectedEmail.timestamp).toLocaleString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white border border-gray-100 rounded-xl p-5 shadow-sm overflow-y-auto max-h-[300px]">
                  <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap font-sans font-medium">
                    {selectedEmail.body}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-200 rounded-xl">
                <Mail className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs font-bold text-gray-400">
                  {isTh ? 'เลือกอีเมลเพื่อเปิดอ่านรายละเอียด' : 'Select an email to view details'}
                </p>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
