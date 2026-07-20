'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, Plus, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DelegationAgreement, DelegationsTabProps } from './types';
import { DelegationEdoc } from './DelegationEdoc';
import { CreateDelegationForm, MOCK_AGENTS } from './CreateDelegationForm';

export function DelegationsTab({ lang, currentRole, currentUser }: DelegationsTabProps) {
  const isTh = lang === 'th';
  const [agreements, setAgreements] = useState<DelegationAgreement[]>([]);
  const [selectedAgreement, setSelectedAgreement] = useState<DelegationAgreement | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('primerent_delegations');
    if (saved) {
      setAgreements(JSON.parse(saved));
    } else {
      const initial: DelegationAgreement[] = [
        {
          id: 'delegate-1',
          propertyId: 1,
          propertyName: isTh ? 'คอนโด อโศก 2BR' : 'Condo Asoke 2BR',
          ownerId: currentUser?.uid || 'mock-landlord-john',
          ownerName: currentUser?.displayName || 'John Doe (Landlord)',
          ownerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqWDpaAAAACXBIWXMAAAsTAAALEwEAmpwYAAABeklEQVR4nO2aTWrDMBSFP6t9G12ErKI30E10IXkDOyvIDbILySr2bXSReAO5gS7C90Ukh1aUOMWx6sA9B4QY2Y9PT0+WnFJKHMdxHMdxHMdxHMdxHNvFDHAATg34vQMeO8H6gCPwZcHzG/gAps04rpg58ArMmsM34A54teC6KqaAM2C2OHqLzS7A1YLrq5gC1qT3M1uMvcf2DHgC7gU2xTADPAEPwLgYc1fR4o5U5lM8i78g64c7UrWfYm7HqvgLst7cqaobNlV2q/gNf7W4V3U/t1Z2q/gN99b4V3U/t1Z2q/gN32pxu25/Fv9a3Gpx72F/q8VdxW941uKeiz/E3I6L/Cnm6R1HqvhzzO24yL9int5xpIp+w18t7lXdL22q7FbxG77V4nbd/iz+tbiq7u/Wyq6K/9p7Vffzqaq+Kj1Wpcf2Lw8qPUyFh6XwYCo87ApPrsKjrvAkFZ5ChZeHrvA0FZ62wtNW+P8pjuM4juM4juM4juM4tuf4AQ+Yd6n2XwYJAAAAAElFTkSuQmCC',
          agentId: 'mock-agent-1',
          agentName: 'สมชาย มืออาชีพ (Agent)',
          agentSignature: null,
          commissionRate: 10,
          status: 'pending_agent_signature',
          createdAt: new Date().toLocaleDateString(),
        }
      ];
      setAgreements(initial);
      localStorage.setItem('primerent_delegations', JSON.stringify(initial));
    }
  }, [currentUser, isTh]);

  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('showReport') === 'true') {
        setShowReport(true);
      }
    }
  }, []);

  const handleCreateSubmit = (propertyName: string, agentId: string, commission: number) => {
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    const newAgreement: DelegationAgreement = {
      id: 'delegate-' + Date.now(),
      propertyId: Math.floor(Math.random() * 100),
      propertyName,
      ownerId: currentUser?.uid || 'landlord-1',
      ownerName: currentUser?.displayName || 'Owner',
      ownerSignature: localStorage.getItem('primerent_saved_signature') || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqWDpaAAAACXBIWXMAAAsTAAALEwEAmpwYAAABeklEQVR4nO2aTWrDMBSFP6t9G12ErKI30E10IXkDOyvIDbILySr2bXSReAO5gS7C90Ukh1aUOMWx6sA9B4QY2Y9PT0+WnFJKHMdxHMdxHMdxHMdxHNvFDHAATg34vQMeO8H6gCPwZcHzG/gAps04rpg58ArMmsM34A54teC6KqaAM2C2OHqLzS7A1YLrq5gC1qT3M1uMvcf2DHgC7gU2xTADPAEPwLgYc1fR4o5U5lM8i78g64c7UrWfYm7HqvgLst7cqaobNlV2q/gNf7W4V3U/t1Z2q/gN99b4V3U/t1Z2q/gN32pxu25/Fv9a3Gpx72F/q8VdxW941uKeiz/E3I6L/Cnm6R1HqvhzzO24yL9int5xpIp+w18t7lXdL22q7FbxG77V4nbd/iz+tbiq7u/Wyq6K/9p7Vffzqaq+Kj1Wpcf2Lw8qPUyFh6XwYCo87ApPrsKjrvAkFZ5ChZeHrvA0FZ62wtNW+P8pjuM4juM4juM4juM4tuf4AQ+Yd6n2XwYJAAAAAElFTkSuQmCC',
      agentId,
      agentName: agent ? agent.name : 'Agent',
      agentSignature: null,
      commissionRate: commission,
      status: 'pending_agent_signature',
      createdAt: new Date().toLocaleDateString(),
    };
    const updated = [newAgreement, ...agreements];
    setAgreements(updated);
    localStorage.setItem('primerent_delegations', JSON.stringify(updated));
    setShowCreateForm(false);
    toast({ title: isTh ? 'ส่งข้อตกลงการดูแลให้ตัวแทนแล้ว' : 'Delegation Agreement Sent' });
  };

  const handleSign = (signature: string) => {
    if (!selectedAgreement) return;
    const isAgent = currentRole === 'agent';
    const updated = agreements.map(a => {
      if (a.id === selectedAgreement.id) {
        const next = { ...a };
        if (isAgent) {
          next.agentSignature = signature;
          next.status = 'active' as const;
        } else {
          next.ownerSignature = signature;
        }
        return next;
      }
      return a;
    });
    setAgreements(updated);
    localStorage.setItem('primerent_delegations', JSON.stringify(updated));
    const nextAg = updated.find(a => a.id === selectedAgreement.id) || null;
    setSelectedAgreement(nextAg);
    toast({ title: isTh ? 'ลงนามสัญญาแต่งตั้งสำเร็จ' : 'Agreement Signed Successfully' });
  };

  // Group delegations by month for Monthly Report
  const getMonthlyReport = () => {
    const report: Record<string, { monthName: string; count: number; items: DelegationAgreement[] }> = {};
    agreements.forEach(a => {
      if (a.status === 'active') {
        const date = a.repostedAt ? new Date() : new Date(a.createdAt);
        const mKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const mName = date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long' });
        if (!report[mKey]) {
          report[mKey] = { monthName: mName, count: 0, items: [] };
        }
        report[mKey].count += 1;
        report[mKey].items.push(a);
      }
    });
    return Object.entries(report).sort((a, b) => b[0].localeCompare(a[0]));
  };

  const reports = getMonthlyReport();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-6 pt-0">
      {selectedAgreement ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedAgreement(null)} className="font-bold">
            &larr; {isTh ? 'กลับไปหน้ารายการ' : 'Back to list'}
          </Button>
          <DelegationEdoc lang={lang} agreement={selectedAgreement} currentRole={currentRole} onSign={handleSign} />
        </div>
      ) : showCreateForm ? (
        <CreateDelegationForm lang={lang} onSubmit={handleCreateSubmit} onCancel={() => setShowCreateForm(false)} />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Landmark className="w-5 h-5 text-teal-600" />
              {showReport ? (isTh ? 'รายงานสรุปสัญญามอบหมายงานรายเดือน' : 'Monthly Delegation Reports') : (isTh ? 'รายการสัญญาดูแลห้องพัก' : 'Property Delegation Agreements')}
            </h3>
            <div className="flex gap-2">
              <Button
                variant={showReport ? "default" : "outline"}
                onClick={() => setShowReport(!showReport)}
                className={cn("font-bold text-xs rounded-none h-10", showReport && "bg-teal-700 hover:bg-teal-800 text-white")}
              >
                📊 {isTh ? 'ดูรายงานสรุปรายเดือน' : 'Monthly Report'}
              </Button>
              {(currentRole === 'landlord' || currentRole === 'owner') && (
                <Button onClick={() => setShowCreateForm(true)} className="bg-teal-600 text-white font-black hover:bg-teal-700 rounded-none h-10 text-xs">
                  <Plus className="w-4 h-4 mr-1.5" />{isTh ? 'แต่งตั้งตัวแทน' : 'Delegate Care'}
                </Button>
              )}
            </div>
          </div>

          {showReport ? (
            <div className="space-y-6">
              {reports.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 border rounded-none">
                  <p className="text-xs text-gray-400 font-bold">{isTh ? 'ไม่มีข้อมูลรายงานสรุปในขณะนี้' : 'No report data available.'}</p>
                </div>
              ) : (
                reports.map(([mKey, data]) => (
                  <div key={mKey} className="bg-white border border-gray-200 rounded-none p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-black text-gray-900 text-sm">{data.monthName}</h4>
                      <Badge className="bg-teal-600 text-white text-xs px-2.5 py-0.5 rounded-none font-bold">
                        {isTh ? `รีโพสทั้งหมด ${data.count} รายการ` : `${data.count} Active Reposts`}
                      </Badge>
                    </div>
                    <div className="divide-y divide-gray-100 text-xs">
                      {data.items.map(item => (
                        <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                          <div>
                            <p className="font-bold text-gray-800">{item.propertyName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Ref: {item.id.toUpperCase()} | {isTh ? 'ผู้มอบอำนาจ' : 'Owner'}: {item.ownerName}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-teal-700">{item.commissionRate}% Commission</span>
                            <p className="text-[9px] text-gray-400 font-bold">{item.repostedAt ? `${isTh ? 'รีโพสเมื่อ' : 'Reposted'} ${item.repostedAt}` : `${isTh ? 'สัญญาเมื่อ' : 'Signed'} ${item.createdAt}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {agreements.length === 0 ? (
                <p className="text-center py-10 text-xs text-gray-400 font-bold">{isTh ? 'ไม่มีเอกสารแต่งตั้งตัวแทน' : 'No delegation contracts found.'}</p>
              ) : (
                agreements.map(a => (
                  <div key={a.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-white border border-gray-100 rounded-none hover:shadow-md transition-shadow gap-4">
                    <div className="space-y-1">
                      <p className="font-black text-gray-900 text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" />{a.propertyName}</p>
                      <p className="text-xs text-gray-400 font-bold">{isTh ? 'เจ้าของ' : 'Owner'}: {a.ownerName} &middot; {isTh ? 'ตัวแทน' : 'Agent'}: {a.agentName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn('font-black text-xs px-2.5 py-1 rounded-full border-none', a.status === 'active' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white')}>
                        {a.status === 'active' ? (isTh ? 'มีผลบังคับใช้' : 'Active') : (isTh ? 'รอตัวแทนลงนาม' : 'Pending Signature')}
                      </Badge>
                      <Button onClick={() => setSelectedAgreement(a)} variant="outline" size="sm" className="rounded-none border-gray-200 font-bold">{isTh ? 'เปิดดูสัญญา' : 'Open Contract'}</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
