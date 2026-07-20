import React, { useState } from 'react';
import { Send, ShieldCheck, Handshake, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getChatRestrictionMessage, ChatRole } from '@/lib/chat/permissions';
import { cn } from '@/lib/utils';

interface ChatInputAreaProps {
  lang: 'th' | 'en' | 'cn';
  inputText: string;
  currentUserRole: string;
  otherUserRole: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onSendProposal?: (propertyName: string, commissionRate: number) => void;
}

export function ChatInputArea({
  lang, inputText, currentUserRole, otherUserRole, onInputChange, onSend, onSendProposal
}: ChatInputAreaProps) {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(10);

  const handleSubmitProposal = () => {
    if (!propertyName.trim() || !commissionRate || !onSendProposal) return;
    onSendProposal(propertyName.trim(), commissionRate);
    setPropertyName('');
    setCommissionRate(10);
    setShowProposalForm(false);
  };

  const restrictionMessage = getChatRestrictionMessage(currentUserRole as ChatRole, otherUserRole as ChatRole, lang);

  if (restrictionMessage) {
    return (
      <div className="px-5 py-4 border-t border-red-100 bg-red-50 flex-shrink-0 flex items-center justify-center gap-2 text-red-600 font-bold text-sm">
        <ShieldCheck className="w-5 h-5" />
        {restrictionMessage}
      </div>
    );
  }

  return (
    <>
      <div className="px-6 py-5 border-t border-gray-100 bg-white flex-shrink-0 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          {(currentUserRole === 'landlord' || currentUserRole === 'owner') && (
            <Button
              onClick={() => setShowProposalForm(true)}
              variant="outline"
              title={lang === 'th' ? 'เสนอสัญญาดูแลห้องพัก' : 'Propose Care Delegation'}
              className="w-12 h-12 rounded-full border-gray-200 flex-shrink-0 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 shadow-sm transition-transform hover:scale-105"
            >
              <Handshake className="w-5 h-5" />
            </Button>
          )}

          <div className="flex-1 flex items-center bg-gray-50/80 rounded-full px-6 py-3 border border-gray-100 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/10 focus-within:bg-white transition-all">
            <Input 
              value={inputText} 
              onChange={onInputChange} 
              onKeyDown={(e) => e.key === 'Enter' && onSend()} 
              placeholder={lang === 'th' ? 'พิมพ์ข้อความ...' : 'Type a message...'} 
              className="border-none shadow-none bg-transparent text-sm font-medium p-0 h-auto focus-visible:ring-0 placeholder:text-gray-400" 
            />
          </div>
          
          <Button 
            onClick={onSend} 
            disabled={!inputText.trim()} 
            className={cn(
              "w-12 h-12 rounded-full shadow-md transition-all flex-shrink-0 p-0",
              inputText.trim() 
                ? "bg-primary hover:bg-primary-dark shadow-primary/30 hover:scale-105 active:scale-95 text-white" 
                : "bg-gray-100 text-gray-400 shadow-none"
            )}
          >
            <Send className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>

      {showProposalForm && (
        <Dialog open={showProposalForm} onOpenChange={setShowProposalForm}>
          <DialogContent className="max-w-md p-8 bg-white rounded-3xl border-none shadow-2xl">
            <DialogTitle className="sr-only">Propose Care Delegation</DialogTitle>
            <div className="flex justify-between items-center pb-5 border-b border-gray-100 mb-6">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-wider flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-indigo-600" />
                </div>
                {lang === 'th' ? 'ยื่นข้อเสนอแต่งตั้งดูแลห้อง' : 'Propose Property Care'}
              </h3>
              <button onClick={() => setShowProposalForm(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">{lang === 'th' ? 'ชื่อโครงการ / ห้องพัก' : 'Property Name'}</label>
                <input
                  type="text"
                  placeholder={lang === 'th' ? 'เช่น คอนโด อโศก 2BR' : 'e.g. Condo Asoke 2BR'}
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full border-2 border-gray-100 px-4 py-3 text-sm font-bold rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">{lang === 'th' ? 'อัตราส่วนตอบแทนตัวแทน (%)' : 'Commission Rate (%)'}</label>
                <input
                  type="number"
                  placeholder="10"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full border-2 border-gray-100 px-4 py-3 text-sm font-bold rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
              <Button
                onClick={handleSubmitProposal}
                disabled={!propertyName.trim() || !commissionRate}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl mt-4 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                {lang === 'th' ? 'ส่งข้อตกลงและหนังสือแต่งตั้ง' : 'Send Agreement & Proposal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
