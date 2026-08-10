
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Wallet, QrCode, ShieldCheck, History, PlusCircle, FileText, CheckCircle2, Loader2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  timestamp: Date;
}

// ─── PromptPay QR Payload Generator ──────────────────────────────────────────
function generatePromptPayPayload(mobileOrTaxId: string, amount: number): string {
  const sanitize = (s: string) => s.replace(/[-\s]/g, '');
  const phone = sanitize(mobileOrTaxId);
  // Format: phone number → 0066XXXXXXXXX
  const formattedId = phone.startsWith('0') ? '0066' + phone.slice(1) : phone;

  const format = (tag: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${tag}${len}${value}`;
  };

  const merchantAccountInfo = format('00', 'A000000677010111') + format('01', formattedId);
  const amountStr = amount.toFixed(2);

  let payload =
    format('00', '01') + // Payload Format Indicator
    format('01', '12') + // Point of Initiation: dynamic
    format('29', merchantAccountInfo) + // Merchant Account Info
    '5303764' + // Transaction Currency: THB (764)
    format('54', amountStr) + // Transaction Amount
    '5802TH'; // Country Code

  // CRC
  payload += '6304';
  const crc = crc16(payload);
  payload += crc.toString(16).toUpperCase().padStart(4, '0');
  return payload;
}

function crc16(str: string): number {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    crc &= 0xFFFF;
  }
  return crc;
}

// ─── QR Code Canvas Renderer ─────────────────────────────────────────────────
function QRCodeCanvas({ value, size = 200 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvasRef.current!, value, {
        width: size,
        margin: 2,
        color: { dark: '#1a202c', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      }, (err: Error | null | undefined) => {
        if (!err) setLoaded(true);
      });
    });
  }, [value, size]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} style={{ display: loaded ? 'block' : 'none' }} />
      {!loaded && (
        <div style={{ width: size, height: size }} className="flex items-center justify-center bg-gray-100 rounded-lg">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}

// ─── Payment System Main Component ───────────────────────────────────────────
export function PaymentSystem({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [generating, setGenerating] = useState(false);

  const { user } = useUser();
  const db = useFirestore();
  const isThai = lang === 'th';

  // Mock PromptPay number
  const PROMPTPAY_ID = '0812345678';
  const qrPayload = generatePromptPayPayload(PROMPTPAY_ID, parseInt(amount));

  // Load recent transactions
  useEffect(() => {
    if (!user) return;
    if (user.isMock) {
      const stored = localStorage.getItem('primerent_transactions');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as any[];
          setTransactions(parsed.slice(-5).reverse().map((t: any, i: number) => ({
            id: `tx_${i}`,
            type: t.description || t.type || 'Top Up',
            amount: t.amount || 0,
            status: 'completed',
            timestamp: new Date(t.createdAt || Date.now()),
          })));
        } catch { }
      }
      return;
    }
    if (!db) return;
    const q = query(collection(db, `users/${user.uid}/transactions`), orderBy('timestamp', 'desc'), limit(5));
    getDocs(q).then(snap => {
      setTransactions(snap.docs.map(d => ({
        id: d.id,
        type: (d.data() as any).type || 'transaction',
        amount: (d.data() as any).amount || 0,
        status: (d.data() as any).status || 'completed',
        timestamp: (d.data() as any).timestamp?.toDate?.() || new Date(),
      })));
    }).catch(console.error);
  }, [user, db, paymentConfirmed]);

  // Poll for payment after QR shown
  useEffect(() => {
    if (!showQR || paymentConfirmed) return;
    const timer = setTimeout(async () => {
      setPollingCount(c => c + 1);
      if (pollingCount >= 2) {
        // Simulate payment success after ~15 seconds
        await handlePaymentSuccess();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [showQR, pollingCount, paymentConfirmed]);

  const handleShowQR = () => {
    setShowQR(true);
    setPaymentConfirmed(false);
    setPollingCount(0);
  };

  const handlePaymentSuccess = async () => {
    setPaymentConfirmed(true);
    setShowQR(false);

    const numAmount = parseInt(amount);

    if (user?.isMock) {
      const stored = localStorage.getItem('primerent_transactions');
      const txs = stored ? JSON.parse(stored) : [];
      txs.push({ description: `เติมเงิน QR PromptPay`, amount: numAmount, type: 'top_up', createdAt: new Date().toISOString() });
      localStorage.setItem('primerent_transactions', JSON.stringify(txs));
      const balance = parseInt(localStorage.getItem('primerent_credit_balance') || '0');
      localStorage.setItem('primerent_credit_balance', String(balance + numAmount));
      toast({ title: isThai ? '✅ ชำระเงินสำเร็จ!' : '✅ Payment Successful!', description: `+฿${numAmount.toLocaleString()}` });
      return;
    }

    if (!db || !user) return;

    const transactionData = {
      userId: user.uid,
      amount: numAmount,
      type: 'top_up',
      method: 'promptpay_qr',
      status: 'completed',
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, `users/${user.uid}/transactions`), transactionData);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await import('firebase/firestore').then(m => m.getDoc(userRef));
      const currentBalance = (userSnap.data() as any)?.creditBalance || 0;
      await updateDoc(userRef, { creditBalance: currentBalance + numAmount });
      toast({ title: isThai ? '✅ ชำระเงินสำเร็จ!' : '✅ Payment Successful!', description: `+฿${numAmount.toLocaleString()}` });
    } catch (err: any) {
      const permissionError = new FirestorePermissionError({ path: `/users/${user.uid}/transactions`, operation: 'create', requestResourceData: transactionData });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleDownloadReceipt = async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ format: 'a5', unit: 'mm' });

      const now = new Date();
      const refId = `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Header band
      doc.setFillColor(26, 86, 219);
      doc.rect(0, 0, 148, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('PrimeRent', 12, 14);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment Receipt / ใบเสร็จรับเงิน', 12, 21);
      doc.text(`Ref: ${refId}`, 12, 29);

      // Amount block
      doc.setFillColor(240, 244, 255);
      doc.roundedRect(10, 42, 128, 30, 4, 4, 'F');
      doc.setTextColor(26, 86, 219);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount Paid', 14, 54);
      doc.setFontSize(24);
      doc.text(`THB ${parseInt(amount).toLocaleString()}`, 14, 68);

      // Details
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      const details = [
        ['Payment Method', 'PromptPay QR'],
        ['Account', PROMPTPAY_ID],
        ['Date', now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })],
        ['Time', now.toLocaleTimeString('th-TH')],
        ['Customer', user?.displayName || 'Customer'],
        ['Status', '✓ Completed'],
      ];

      let yPos = 86;
      details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 120, 120);
        doc.text(label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        doc.text(value, 80, yPos);
        yPos += 10;
      });

      // Divider
      doc.setDrawColor(230, 230, 230);
      doc.line(10, yPos + 2, 138, yPos + 2);

      // Footer
      yPos += 10;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This receipt is auto-generated by PrimeRent System.', 14, yPos);
      doc.text('ใบเสร็จนี้ออกโดยระบบอัตโนมัติ ไม่ต้องลงนาม', 14, yPos + 6);

      // Green checkmark badge
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(10, yPos + 14, 40, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ PAID', 17, yPos + 23);

      doc.save(`PrimeRent_Receipt_${refId}.pdf`);
      toast({ title: isThai ? '📄 ดาวน์โหลดใบเสร็จแล้ว' : '📄 Receipt Downloaded' });
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">{isThai ? 'ระบบการเงิน' : 'Payments'}</h1>
          <p className="text-muted-foreground font-medium">{isThai ? 'เติมเครดิตผ่าน QR PromptPay และดาวน์โหลดใบเสร็จ' : 'Top up via QR PromptPay & download receipts.'}</p>
        </div>
        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">ยอดคงเหลือ</p>
            <p className="text-2xl font-black text-gray-900">฿{parseInt(localStorage.getItem('primerent_credit_balance') || '1250').toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left — QR Top Up */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="px-8 pt-8 pb-0">
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <QrCode className="w-6 h-6 text-primary" /> {isThai ? 'เติมเงิน QR PromptPay' : 'Top Up via PromptPay'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {!showQR && !paymentConfirmed && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {['500', '1000', '2500', '5000', '10000', 'custom'].map(val => val === 'custom' ? (
                    <input
                      key="custom"
                      type="number"
                      placeholder="฿ อื่นๆ"
                      onChange={e => setAmount(e.target.value)}
                      className="col-span-1 py-4 px-3 rounded-2xl font-black border-2 border-gray-100 text-gray-500 text-center text-sm focus:border-primary/40 focus:outline-none"
                    />
                  ) : (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={cn(
                        "py-4 rounded-2xl font-black border-2 transition-all text-sm",
                        amount === val ? "bg-primary border-primary text-white shadow-lg" : "bg-white border-gray-100 text-gray-500 hover:border-primary/20"
                      )}
                    >
                      ฿{parseInt(val).toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-blue-700">{isThai ? 'ปลอดภัยด้วย PromptPay มาตรฐาน BOT' : 'Secured by BOT-standard PromptPay'}</p>
                    <p className="text-[10px] text-blue-500 mt-0.5">{isThai ? 'ชำระเงินผ่าน QR Code ของธนาคาร' : 'Pay using your banking app QR scanner'}</p>
                  </div>
                </div>

                <Button
                  onClick={handleShowQR}
                  disabled={!amount || parseInt(amount) < 1}
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20 gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  {isThai ? `แสดง QR Code ฿${parseInt(amount || '0').toLocaleString()}` : `Show QR ฿${parseInt(amount || '0').toLocaleString()}`}
                </Button>
              </>
            )}

            {showQR && !paymentConfirmed && (
              <div className="flex flex-col items-center gap-5">
                <div className="text-center">
                  <Badge className="bg-amber-100 text-amber-700 rounded-full px-4 py-1 text-xs font-black border-none mb-3">
                    {isThai ? 'รอการชำระเงิน...' : 'Waiting for payment...'}
                  </Badge>
                  <p className="text-sm font-black text-gray-700">
                    {isThai ? 'สแกน QR ด้วยแอปธนาคารของคุณ' : 'Scan QR with your banking app'}
                  </p>
                  <p className="text-2xl font-black text-primary mt-1">฿{parseInt(amount).toLocaleString()}</p>
                </div>

                <div className="p-4 bg-white border-2 border-primary/10 rounded-3xl shadow-lg">
                  <QRCodeCanvas value={qrPayload} size={180} />
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold">PromptPay ID: {PROMPTPAY_ID}</p>
                  <div className="flex items-center gap-2 justify-center mt-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-[10px] text-gray-400 font-bold">
                      {isThai ? 'ตรวจสอบการชำระเงินอัตโนมัติ...' : 'Auto-verifying payment...'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <Button variant="outline" onClick={() => setShowQR(false)} className="flex-1 rounded-2xl border-gray-200 font-bold text-gray-500 gap-1">
                    <X className="w-4 h-4" /> {isThai ? 'ยกเลิก' : 'Cancel'}
                  </Button>
                  <Button onClick={handlePaymentSuccess} className="flex-1 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black gap-1">
                    <CheckCircle2 className="w-4 h-4" /> {isThai ? 'ยืนยัน (Demo)' : 'Confirm (Demo)'}
                  </Button>
                </div>
              </div>
            )}

            {paymentConfirmed && (
              <div className="flex flex-col items-center gap-6 py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-gray-900">{isThai ? 'ชำระเงินสำเร็จ!' : 'Payment Successful!'}</h3>
                  <p className="text-green-600 font-bold text-lg">+฿{parseInt(amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1 font-semibold">{isThai ? 'เพิ่มเข้ากระเป๋าเงินของคุณแล้ว' : 'Added to your wallet'}</p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={handleDownloadReceipt}
                    disabled={generating}
                    variant="outline"
                    className="flex-1 rounded-2xl border-primary/30 text-primary font-black gap-2"
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    {isThai ? 'ดาวน์โหลดใบเสร็จ' : 'Download Receipt'}
                  </Button>
                  <Button onClick={() => { setPaymentConfirmed(false); setPollingCount(0); }} className="flex-1 rounded-2xl bg-primary text-white font-black">
                    {isThai ? 'เติมเงินอีก' : 'Top Up More'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right — Transaction History */}
        <Card className="border-none shadow-xl rounded-3xl p-8 bg-white">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <History className="w-6 h-6 text-gray-400" /> {isThai ? 'ประวัติธุรกรรม' : 'History'}
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 mt-4">
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-gray-300">
                <CreditCard className="w-10 h-10 mx-auto mb-3" />
                <p className="text-sm font-bold">{isThai ? 'ยังไม่มีธุรกรรม' : 'No transactions yet'}</p>
              </div>
            ) : (
              transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black",
                      t.amount > 0 ? 'bg-green-500' : 'bg-gray-400'
                    )}>
                      {t.amount > 0 ? '+' : '-'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{t.type}</p>
                      <p className="text-[10px] text-gray-400 font-bold">
                        {t.timestamp instanceof Date ? t.timestamp.toLocaleDateString('th-TH') : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <p className={cn("font-black text-sm", t.amount > 0 ? "text-green-500" : "text-gray-900")}>
                    {t.amount > 0 ? '+' : ''}฿{Math.abs(t.amount).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Payment Methods */}
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isThai ? 'วิธีการชำระเงินที่รองรับ' : 'Accepted Methods'}</p>
            <div className="flex gap-2 flex-wrap">
              {['PromptPay', 'K PLUS', 'SCB EASY', 'KMA', 'True Wallet'].map(m => (
                <Badge key={m} variant="outline" className="rounded-full text-[10px] font-black border-gray-200 text-gray-500 px-3">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
