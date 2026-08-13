'use client';

import React from 'react';
import { ArrowLeft, ShieldCheck, User, Sparkles, AlertTriangle, Send, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X } from 'lucide-react';

import { useLineOA } from '@/components/line-oa/useLineOA';
import RichMenu from '@/components/line-oa/RichMenu';
import ChatMessageList from '@/components/line-oa/ChatMessageList';
import WebviewBilling from '@/components/line-oa/WebviewBilling';
import WebviewSearch from '@/components/line-oa/WebviewSearch';
import WebviewContracts from '@/components/line-oa/WebviewContracts';
import WebviewAppointment from '@/components/line-oa/WebviewAppointment';
import WebviewContact from '@/components/line-oa/WebviewContact';
import WebviewBroadcast from '@/components/line-oa/WebviewBroadcast';

const WEBVIEW_LABELS: Record<string, string> = {
  billing: 'สถานะชำระเงิน', search: 'ค้นหาห้องพัก',
  contracts: 'สัญญาดิจิทัล', appointment: 'นัดดูห้อง', agent: 'ช่องทางการติดต่อ',
  broadcast: 'Broadcast & Segment',
};

export default function LineOAPage() {
  const ctx = useLineOA();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-4 font-sans antialiased">

      {/* Role Selector */}
      <div className="w-full max-w-[380px] bg-slate-900 border-x border-t border-slate-700 p-2 rounded-t-[52px] flex justify-between gap-1 items-center z-40 shadow-xl shrink-0">
        {([['tenant','มุมผู้เช่า'] , ['owner','มุมเจ้าของ'], ['agent','มุมเอเจนต์']] as const).map(([role, label]) => (
          <button key={role} onClick={() => { ctx.setActiveRole(role as any); ctx.setWebviewTab('none'); }}
            className={`flex-1 py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${ctx.activeRole === role ? 'bg-[#06c755] text-white shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
            {role === 'tenant' && <User className="w-3.5 h-3.5" />}
            {role === 'owner' && <ShieldCheck className="w-3.5 h-3.5" />}
            {role === 'agent' && <Sparkles className="w-3.5 h-3.5" />}
            {label}
          </button>
        ))}
      </div>

      {/* Simulator Frame */}
      <div className="relative w-full max-w-[380px] h-[calc(100vh-100px)] max-h-[720px] bg-[#8cabd9] shadow-2xl overflow-hidden rounded-b-3xl flex flex-col">

        {/* LINE OA Header */}
        <div className="bg-[#06c755] text-white py-3 px-4 flex items-center justify-between z-30 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <button className="p-1 hover:bg-green-600 rounded-full transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              <Avatar className="w-9 h-9 border border-white/20 rounded-full">
                <AvatarFallback className="bg-white text-[#06c755] font-black text-xs">RF</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-sm">RentFlow OA</span>
                  <ShieldCheck className="w-3.5 h-3.5 fill-white text-[#06c755]" />
                </div>
                <span className="text-[9px] text-green-100 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-200 rounded-full animate-ping" />จำลองระบบ LINE Official
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={ctx.triggerAppointmentReminder} title="จำลองแจ้งเตือนนัดหมาย" className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Calendar className="w-4 h-4 text-blue-300" />
            </button>
            <button onClick={ctx.triggerSigningReminder} title="จำลองแจ้งทำสัญญา (e-Sign)" className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </button>
            <button onClick={ctx.triggerExpiryWarning} title="จำลองแจ้งสัญญาหมดอายุ" className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <AlertTriangle className="w-4 h-4 text-yellow-300" />
            </button>
            <button onClick={ctx.simulateWebhookReconcile} title="จำลอง Webhook จ่ายเงินสำเร็จ" className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <CheckCircle className="w-4 h-4 text-green-300" />
            </button>
            {(ctx.activeRole === 'agent' || ctx.activeRole === 'owner') && (
              <button onClick={() => ctx.setWebviewTab('broadcast')} title="Broadcast Panel" className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Send className="w-4 h-4 text-pink-300" />
              </button>
            )}
            <Badge className="bg-white/20 hover:bg-white/30 text-white text-[9px] rounded-none px-2 py-0.5 font-black uppercase tracking-wider border-none">
              {ctx.activeRole}
            </Badge>
          </div>
        </div>

        {/* Chat area */}
        <ChatMessageList
          messages={ctx.messages} isTyping={ctx.isTyping} activeRole={ctx.activeRole}
          paymentStatus={ctx.paymentStatus} selectedTotal={ctx.selectedTotal} scrollRef={ctx.scrollRef}
          onOpenBilling={() => ctx.setWebviewTab('billing')} onOpenContracts={() => ctx.setWebviewTab('contracts')}
          onApproveSlip={ctx.handleApproveSlip}
        />

        {/* Chat input row */}
        <div className="bg-white px-2.5 py-2 border-t border-gray-200 flex gap-2 items-center z-20 shrink-0">
          <Input value={ctx.inputText} onChange={e => ctx.setInputText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && ctx.handleSendChat()}
            placeholder="พิมพ์ข้อความส่งเข้า LINE OA..."
            className="flex-grow rounded-full bg-gray-50 border-gray-200 text-gray-800 text-xs h-9 px-4 font-bold" />
          <Button onClick={ctx.handleSendChat} disabled={!ctx.inputText.trim()}
            className="w-9 h-9 rounded-full bg-[#06c755] hover:bg-[#05b34c] text-white p-0 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Rich Menu */}
        <RichMenu open={ctx.richMenuOpen} onToggle={() => ctx.setRichMenuOpen(v => !v)}
          activeTab={ctx.webviewTab} onTabSelect={ctx.setWebviewTab} />

        {/* LIFF Webview Overlay */}
        {ctx.webviewTab !== 'none' && (
          <div className="absolute inset-0 z-40 bg-black/60 flex flex-col justify-end animate-in fade-in duration-200">
            <div className="bg-white w-full h-[85%] rounded-t-[30px] overflow-hidden flex flex-col shadow-2xl border-t border-gray-100 animate-in slide-in-from-bottom-6 duration-300">
              <div className="bg-slate-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#06c755] animate-pulse" />
                  <span className="text-[10px] font-black text-gray-700 tracking-wider uppercase">
                    LIFF WebView — {WEBVIEW_LABELS[ctx.webviewTab]}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => ctx.setWebviewTab('none')} className="rounded-full h-8 w-8 hover:bg-gray-200">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className={`flex-1 text-gray-800 scrollbar-thin ${ctx.webviewTab === 'search' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4'}`}>
                {ctx.webviewTab === 'billing' && (
                  <WebviewBilling
                    activeRole={ctx.activeRole}
                    slipImage={ctx.slipImage}
                    slipUploaded={ctx.slipUploaded}
                    onUploadSlip={ctx.handleUploadSlip}
                    paymentStatus={ctx.paymentStatus}
                    paidAmount={ctx.paidAmount}
                    onSendQR={ctx.handleSendQR}
                  />
                )}
                {ctx.webviewTab === 'search' && <WebviewSearch />}
                {ctx.webviewTab === 'contracts' && <WebviewContracts onSendExpiryWarning={ctx.triggerExpiryWarning} activeRole={ctx.activeRole} />}
                {ctx.webviewTab === 'appointment' && (
                  <WebviewAppointment
                    activeRole={ctx.activeRole}
                    onApproveAppointment={ctx.handleApproveAppointment}
                  />
                )}
                {ctx.webviewTab === 'agent' && <WebviewContact activeRole={ctx.activeRole} />}
                {ctx.webviewTab === 'broadcast' && (
                  <WebviewBroadcast onSendBroadcast={ctx.handleBroadcast} />
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}