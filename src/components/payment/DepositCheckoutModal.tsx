'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Check, AlertCircle, Shield, ArrowRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, Property } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface DepositCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  property: Property;
  lang: Language;
  currency: string;
}

export const DepositCheckoutModal: React.FC<DepositCheckoutModalProps> = ({
  open,
  onClose,
  property,
  lang,
  currency,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const rates = { THB: 1, USD: 0.028, CNY: 0.20 };
  const symbols = { THB: '฿', USD: '$', CNY: '¥' };
  
  const depositAmount = property.deposit || (property.price * 2);
  const convertedDeposit = Math.round(depositAmount * rates[currency as keyof typeof rates]);
  const symbol = symbols[currency as keyof typeof symbols];

  const ownerShare = Math.round(convertedDeposit * (1/3));
  const systemHold = Math.round(convertedDeposit * (2/3));

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    
    toast({
      title: lang === 'th' ? 'ชำระเงินมัดจำสำเร็จ' : lang === 'cn' ? '定金支付成功' : 'Deposit Payment Successful',
      description: lang === 'th' 
        ? 'เงินมัดจำถูกโอนไปยังบัญชีปลอยอย่างปลอดภัย' 
        : lang === 'cn' 
        ? '定金已安全转入托管账户' 
        : 'Deposit has been securely transferred to escrow account',
    });
  };

  const displayName = lang === 'en' ? property.nameEn : lang === 'cn' ? property.nameCn : property.name;
  const displayLocation = lang === 'en' ? property.locationEn : lang === 'cn' ? property.locationCn : property.location;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {lang === 'th' ? 'ชำระเงินมัดจำ' : lang === 'cn' ? '支付定金' : 'Deposit Payment'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                <img src={property.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 mb-1">{displayName}</h3>
                <p className="text-sm text-gray-500 mb-2">{displayLocation}</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-white border-none text-[10px] px-2 py-0.5 rounded-lg">
                    {property.type}
                  </Badge>
                  <span className="text-sm font-bold text-gray-900">
                    {symbol}{property.price.toLocaleString()}/{lang === 'th' ? 'เดือน' : lang === 'cn' ? '月' : 'mo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit Amount */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {lang === 'th' ? 'ยอดเงินมัดจำ' : lang === 'cn' ? '定金金额' : 'Deposit Amount'}
                </p>
                <p className="text-3xl font-black text-gray-900">
                  {symbol}{convertedDeposit.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  {lang === 'th' ? 'เท่ากับ' : lang === 'cn' ? '相当于' : 'Equals'}
                </p>
                <p className="text-sm font-bold text-gray-600">
                  {Math.round(convertedDeposit / rates[currency as keyof typeof rates]).toLocaleString()} THB
                </p>
              </div>
            </div>
          </div>

          {/* Payment Split Breakdown */}
          <div className="space-y-4">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {lang === 'th' ? 'โครงสร้างการจ่ายเงิน' : lang === 'cn' ? '支付结构' : 'Payment Structure'}
            </h3>
            
            <div className="space-y-3">
              {/* Owner Share */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-900">
                      {lang === 'th' ? 'โอนตรงให้เจ้าของ' : lang === 'cn' ? '直接转给业主' : 'Direct to Owner'}
                    </span>
                  </div>
                  <Badge className="bg-green-500 text-white border-none text-[10px] px-2 py-0.5 rounded-lg">
                    1/3
                  </Badge>
                </div>
                <p className="text-2xl font-black text-green-900">
                  {symbol}{ownerShare.toLocaleString()}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {lang === 'th' 
                    ? 'เจ้าของรับเงินทันที' 
                    : lang === 'cn' 
                    ? '业主即时收款' 
                    : 'Owner receives immediately'}
                </p>
              </div>

              {/* System Hold */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">
                      {lang === 'th' ? 'ระบบเก็บรักษา' : lang === 'cn' ? '系统托管' : 'System Hold'}
                    </span>
                  </div>
                  <Badge className="bg-blue-500 text-white border-none text-[10px] px-2 py-0.5 rounded-lg">
                    2/3
                  </Badge>
                </div>
                <p className="text-2xl font-black text-blue-900">
                  {symbol}{systemHold.toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {lang === 'th' 
                    ? 'หักค่าคอมมิชชันให้ Agent ภายหลัง' 
                    : lang === 'cn' 
                    ? '后续扣除代理人佣金' 
                    : 'Deducted for Agent commission later'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-yellow-900 mb-1">
                {lang === 'th' ? 'การรับประกันความปลอดภัย' : lang === 'cn' ? '安全保证' : 'Security Guarantee'}
              </p>
              <p className="text-xs text-yellow-800">
                {lang === 'th' 
                  ? 'เงินมัดจำจะถูกเก็บในบัญชีปลอง (Escrow) จนกว่าสัญญาจะเสร็จสมบูรณ์' 
                  : lang === 'cn' 
                  ? '定金将保存在托管账户中，直到合同完成' 
                  : 'Deposit is held in escrow until contract completion'}
              </p>
            </div>
          </div>

          {/* Payment Button */}
          {!isComplete ? (
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-14 font-black text-lg shadow-lg shadow-primary/20"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {lang === 'th' ? 'กำลังประมวลผล...' : lang === 'cn' ? '处理中...' : 'Processing...'}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  {lang === 'th' ? 'ทดสอบมัดจำ (Mock Pay)' : lang === 'cn' ? '测试定金支付' : 'Test Deposit Payment'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <div className="bg-green-100 border border-green-300 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-black text-green-900 mb-2">
                {lang === 'th' ? 'ชำระเงินสำเร็จ!' : lang === 'cn' ? '支付成功!' : 'Payment Successful!'}
              </h3>
              <p className="text-sm text-green-800 mb-4">
                {lang === 'th' 
                  ? 'เงินมัดจำ {symbol}{convertedDeposit.toLocaleString()} ถูกโอนเรียบร้อย' 
                  : lang === 'cn' 
                  ? '定金 {symbol}{convertedDeposit.toLocaleString()} 已成功转账' 
                  : `Deposit ${symbol}${convertedDeposit.toLocaleString()} has been transferred successfully`}
              </p>
              <Button
                onClick={onClose}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 font-black"
              >
                {lang === 'th' ? 'ตกลง' : lang === 'cn' ? '确定' : 'Done'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
