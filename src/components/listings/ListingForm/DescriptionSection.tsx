import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { deSlopDescriptionAction } from '@/app/actions/ai-de-slop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ListingFormData } from './types';

interface DescriptionSectionProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  lang: 'th' | 'en' | 'cn';
  t: any;
}

export function DescriptionSection({ formData, setFormData, lang, t }: DescriptionSectionProps) {
  const [selectedTone, setSelectedTone] = useState<'professional' | 'minimalist' | 'casual'>('professional');
  const [deSlopOpen, setDeSlopOpen] = useState(false);
  const [isDeSloping, setIsDeSloping] = useState(false);
  const [deSlopResult, setDeSlopResult] = useState<{
    rewrittenDescription: string;
    removedClichés?: string[];
    summaryOfChanges?: string;
  } | null>(null);

  const handleDeSlop = async () => {
    if (!formData.description.trim()) {
      toast({
        variant: "destructive",
        title: lang === 'th' ? "กรุณากรอกคำอธิบายก่อนปรับแต่ง" : lang === 'cn' ? "请在优化前输入描述" : "Please enter a description first.",
      });
      return;
    }

    setIsDeSloping(true);
    try {
      const res = await deSlopDescriptionAction({
        description: formData.description,
        tone: selectedTone,
        lang,
      });
      setDeSlopResult(res);
      setDeSlopOpen(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: lang === 'th' ? "เกิดข้อผิดพลาดในการปรับแต่งคำอธิบาย" : "Error de-slopping description.",
      });
    } finally {
      setIsDeSloping(false);
    }
  };

  return (
    <>
      <div className="space-y-4 pt-10 border-t border-gray-50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Label className="font-bold text-gray-700">{t.listing_desc}</Label>
          
          <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2 border border-gray-100 rounded-none w-full md:w-auto md:justify-end">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
              {t.tone_label}
            </span>
            <div className="flex items-center bg-gray-200/50 p-0.5 rounded-none">
              {(['professional', 'minimalist', 'casual'] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold transition-all rounded-none",
                    selectedTone === tone 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {tone === 'professional' ? t.tone_professional : tone === 'minimalist' ? t.tone_minimalist : t.tone_casual}
                </button>
              ))}
            </div>

            <Button
              type="button"
              disabled={isDeSloping}
              onClick={handleDeSlop}
              className="h-9 px-4 rounded-none bg-primary hover:bg-primary-dark text-white font-bold text-xs gap-2 shrink-0 shadow-sm transition-all"
            >
              {isDeSloping ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.de_sloping}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-300 fill-sky-300" />
                  {t.de_slop_btn}
                </>
              )}
            </Button>
          </div>
        </div>

        <Textarea 
          required
          placeholder={lang === 'th' ? 'บรรยายจุดเด่นและรายละเอียดของที่พัก...' : lang === 'cn' ? '描述您的房产亮点和详情...' : 'Describe your property...'}
          className="min-h-[150px] rounded-none bg-gray-50 border-none font-bold p-6"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <Dialog open={deSlopOpen} onOpenChange={setDeSlopOpen}>
        <DialogContent className="max-w-2xl glass-card premium-shadow border-none p-8 rounded-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary fill-primary/20" />
              {t.review_title}
            </DialogTitle>
          </DialogHeader>

          {deSlopResult && (
            <div className="space-y-6 my-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    {t.original_text}
                  </span>
                  <div className="p-4 bg-gray-50 border border-gray-100 text-sm font-medium text-gray-500 min-h-[180px] max-h-[250px] overflow-y-auto whitespace-pre-line rounded-none">
                    {formData.description}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {t.improved_text} ({selectedTone})
                  </span>
                  <div className="p-4 bg-primary/5 border border-primary/10 text-sm font-bold text-gray-900 min-h-[180px] max-h-[250px] overflow-y-auto whitespace-pre-line rounded-none">
                    {deSlopResult.rewrittenDescription}
                  </div>
                </div>
              </div>

              {deSlopResult.removedClichés && deSlopResult.removedClichés.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-none space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {t.clichés_removed}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {deSlopResult.removedClichés.map((cliché, i) => (
                      <span key={i} className="px-2 py-1 bg-amber-100/60 text-amber-900 text-xs font-bold rounded-none">
                        "{cliché}"
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {deSlopResult.summaryOfChanges && (
                <div className="text-xs font-bold text-muted-foreground bg-gray-50 p-3 border border-gray-100">
                  {t.changes_made || "Changes summary"}: {deSlopResult.summaryOfChanges}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeSlopOpen(false)}
              className="rounded-none border-gray-200 font-bold text-gray-700 h-12 px-6"
            >
              {t.cancel_btn}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (deSlopResult) {
                  setFormData({ ...formData, description: deSlopResult.rewrittenDescription });
                }
                setDeSlopOpen(false);
              }}
              className="rounded-none bg-primary hover:bg-primary-dark font-black h-12 px-6 shadow-lg shadow-primary/10"
            >
              {t.apply_btn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
