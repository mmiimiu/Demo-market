'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CreditTransaction } from '@/lib/credit';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import {
  DEFAULT_BALANCE,
  loadBalance,
  loadTransactions,
  saveBalance,
  saveTransactions,
  generateTxId,
} from './storage';
import { toast } from '@/hooks/use-toast';

interface UseCreditReturn {
  creditBalance: number;
  transactions: CreditTransaction[];
  isLoading: boolean;
  topup: (credits: number, packageName: string, priceTHB: number) => Promise<void>;
  spend: (credits: number, description: string, referenceId?: string) => Promise<boolean>;
  refund: (credits: number, description: string, referenceId?: string) => Promise<void>;
  failedTopup: (packageName: string, priceTHB: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCredit(): UseCreditReturn {
  const { user } = useUser();
  const db = useFirestore();
  const [creditBalance, setCreditBalance] = useState<number>(DEFAULT_BALANCE);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch authorization headers if a real user is logged in
  const getHeaders = useCallback(async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (user && !user.isMock) {
      try {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.error('Failed to get auth token:', err);
      }
    }
    return headers;
  }, [user]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const userId = user?.uid || 'mock_user';
    const isRealUser = user && !user.isMock;

    if (isRealUser && db) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        const balance = userDoc.exists() ? (userDoc.data()?.creditBalance || 0) : 0;

        const txsRef = collection(db, 'users', userId, 'transactions');
        const txsQuery = query(txsRef, orderBy('createdAt', 'desc'), limit(50));
        const txsSnap = await getDocs(txsQuery);
        const txsList: CreditTransaction[] = [];
        
        txsSnap.forEach(docSnap => {
          const data = docSnap.data();
          txsList.push({
            id: docSnap.id,
            userId: data.userId || userId,
            type: data.type || 'usage',
            amount: data.amount || 0,
            balanceAfter: data.balanceAfter || 0,
            description: data.description || '',
            referenceId: data.referenceId || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          });
        });

        setCreditBalance(balance);
        setTransactions(txsList);
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Failed to load credit from Firestore, using local fallback:', err);
      }
    }

    // Fallback to local storage if user is mock or Firestore failed
    setCreditBalance(loadBalance());
    setTransactions(loadTransactions());
    setIsLoading(false);
  }, [user, db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** เติมเครดิต (topup) — ใช้หลังชำระเงินสำเร็จ */
  const topup = useCallback(
    async (credits: number, packageName: string, priceTHB: number) => {
      const userId = user?.uid || 'mock_user';
      const isRealUser = user && !user.isMock;
      let finalBalance = 0;
      let finalTxId = '';

      const sendMultiChannelNotifications = (addedCredits: number, currentBalance: number, transactionId: string) => {
        // 1. In-app Notification
        try {
          const storedNotifs = localStorage.getItem('primerent_notifications');
          const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
          const newNotif = {
            id: `n_credit_${Date.now()}`,
            type: 'payment',
            title: 'เติมเครดิตสำเร็จ (Credit Top-up)',
            description: `ได้รับ +${addedCredits} เครดิต (ยอดคงเหลือ: ${currentBalance} เครดิต) เลขที่รายการ: #${transactionId}`,
            timestamp: new Date().toISOString(),
            read: false,
            href: '/profile?tab=credits',
          };
          localStorage.setItem('primerent_notifications', JSON.stringify([newNotif, ...notifs]));
        } catch (err) {
          console.error('Error saving top-up notification:', err);
        }

        // 2. LINE OA Message Simulation
        try {
          const storedLine = localStorage.getItem('primerent_line_oa_messages');
          const lineMsgs = storedLine ? JSON.parse(storedLine) : [];
          const userRole = localStorage.getItem('primerent_user_role') || 'owner';
          const newLineMsg = {
            id: `line_c_${Date.now()}`,
            role: userRole,
            type: 'credit',
            title: 'เติมเครดิตสำเร็จ (Credit Top-up)',
            amount: addedCredits,
            balance: currentBalance,
            transactionId: transactionId,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem('primerent_line_oa_messages', JSON.stringify([newLineMsg, ...lineMsgs]));
        } catch (err) {
          console.error('Error saving LINE OA top-up message:', err);
        }

        // 3. Admin Support Chat Message Simulation
        try {
          const storedChat = localStorage.getItem('primerent_admin_support_messages');
          const chatMsgs = storedChat ? JSON.parse(storedChat) : [];
          const newChatMsg = {
            id: `msg_credit_${Date.now()}`,
            senderId: 'mock-admin-support',
            text: `🪙 แจ้งเตือนยอดธุรกรรม:\n\nการเติมเครดิตของคุณได้รับการดำเนินการเรียบร้อยแล้ว\n• ได้รับ: +${addedCredits} เครดิต\n• ยอดคงเหลือ: ${currentBalance} เครดิต\n• เลขที่รายการ: #${transactionId}\n\nขอบคุณที่ใช้บริการ PrimeRent ค่ะ`,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('primerent_admin_support_messages', JSON.stringify([...chatMsgs, newChatMsg]));
        } catch (err) {
          console.error('Error saving support chat message:', err);
        }

        // 4. Simulated Email inbox
        try {
          const storedEmails = localStorage.getItem('primerent_simulated_emails');
          const emailList = storedEmails ? JSON.parse(storedEmails) : [];
          const newEmail = {
            id: `em_${Date.now()}`,
            subject: `📧 ใบเสร็จรับเงินและการเติมเครดิตสำเร็จ - รายการ #${transactionId}`,
            from: 'noreply@primerent.com',
            to: user?.email || 'user@primerent.com',
            body: `สวัสดีค่ะ คุณ ${user?.displayName || 'ผู้ใช้งาน PrimeRent'}\n\nเราได้รับยอดชำระเงินสำหรับการเติมเครดิตของท่านเรียบร้อยแล้ว รายละเอียดมีดังนี้:\n\n- **แพ็กเกจ:** ${packageName}\n- **จำนวนเครดิตที่ได้รับ:** +${addedCredits.toLocaleString()} เครดิต\n- **ยอดคงเหลือในระบบ:** ${currentBalance.toLocaleString()} เครดิต\n- **รหัสอ้างอิงรายการ:** #${transactionId}\n- **วันที่ทำรายการ:** ${new Date().toLocaleString('th-TH')}\n\nหากท่านมีข้อสงสัยประการใด สามารถติดต่อเจ้าหน้าที่ฝ่ายบริการลูกค้าได้ที่เมนูแชทช่วยเหลือในแอปพลิเคชัน\n\nขอแสดงความนับถือ\nทีมงาน PrimeRent`,
            timestamp: new Date().toISOString(),
            read: false,
          };
          localStorage.setItem('primerent_simulated_emails', JSON.stringify([newEmail, ...emailList]));
        } catch (err) {
          console.error('Error saving simulated email:', err);
        }

        // 5. Success Toast notification
        toast({
          title: '🎉 เติมเครดิตสำเร็จ!',
          description: `ส่งแจ้งเตือนยอด +${addedCredits} เครดิต (คงเหลือ: ${currentBalance} เครดิต) ไปที่ LINE OA, Chat และ Email (อ้างอิง: #${transactionId}) เรียบร้อยแล้ว`,
        });
      };

      if (isRealUser && db) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          const currentBalance = userDoc.exists() ? (userDoc.data()?.creditBalance || 0) : 0;
          const newBalance = currentBalance + credits;
          finalBalance = newBalance;

          const txsRef = collection(db, 'users', userId, 'transactions');
          const addedDoc = await addDoc(txsRef, {
            userId,
            type: 'topup',
            amount: credits,
            balanceAfter: newBalance,
            description: `เติมเครดิต — แพ็กเกจ ${packageName} (฿${priceTHB.toLocaleString()})`,
            referenceId: `pkg_${packageName.toLowerCase()}_${Date.now()}`,
            createdAt: new Date(),
            channel: 'QR PromptPay',
            status: 'success',
            packageName,
            paymentAmount: priceTHB
          });
          finalTxId = addedDoc.id;

          await updateDoc(userRef, { creditBalance: newBalance });
          
          sendMultiChannelNotifications(credits, finalBalance, finalTxId);
          await refresh();
          return;
        } catch (err) {
          console.error('Failed to topup on server, using local fallback:', err);
        }
      }

      // Fallback local storage
      const currentBalance = loadBalance();
      const newBalance = currentBalance + credits;
      finalBalance = newBalance;
      finalTxId = generateTxId();

      const tx: CreditTransaction = {
        id: finalTxId,
        userId,
        type: 'topup',
        amount: credits,
        balanceAfter: newBalance,
        description: `เติมเครดิต — แพ็กเกจ ${packageName} (฿${priceTHB.toLocaleString()})`,
        referenceId: `pkg_${packageName.toLowerCase()}_${Date.now()}`,
        createdAt: new Date(),
        channel: 'QR PromptPay',
        status: 'success',
        packageName,
        paymentAmount: priceTHB
      };
      const existingTxs = loadTransactions();
      saveBalance(newBalance);
      saveTransactions([tx, ...existingTxs]);

      sendMultiChannelNotifications(credits, finalBalance, finalTxId);
      await refresh();
    },
    [user, db, refresh]
  );

  /** ใช้เครดิต (spend) — return false ถ้าเครดิตไม่พอ */
  const spend = useCallback(
    async (credits: number, description: string, referenceId?: string): Promise<boolean> => {
      const userId = user?.uid || 'mock_user';
      const isRealUser = user && !user.isMock;

      if (isRealUser && db) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          const currentBalance = userDoc.exists() ? (userDoc.data()?.creditBalance || 0) : 0;
          
          if (currentBalance < credits) return false;

          const newBalance = currentBalance - credits;
          await updateDoc(userRef, { creditBalance: newBalance });

          const txsRef = collection(db, 'users', userId, 'transactions');
          await addDoc(txsRef, {
            userId,
            type: 'usage',
            amount: -credits,
            balanceAfter: newBalance,
            description,
            referenceId,
            createdAt: new Date(),
          });

          await refresh();
          return true;
        } catch (err) {
          console.error('Failed to spend in Firestore:', err);
          return false;
        }
      }

      // Fallback
      const currentBalance = loadBalance();
      if (currentBalance < credits) return false;
      const newBalance = currentBalance - credits;
      const tx: CreditTransaction = {
        id: generateTxId(),
        userId,
        type: 'usage',
        amount: -credits,
        balanceAfter: newBalance,
        description,
        referenceId,
        createdAt: new Date(),
      };
      const existingTxs = loadTransactions();
      saveBalance(newBalance);
      saveTransactions([tx, ...existingTxs]);
      await refresh();
      return true;
    },
    [user, db, refresh]
  );

  /** คืนเครดิต (refund) */
  const refund = useCallback(
    async (credits: number, description: string, referenceId?: string) => {
      const userId = user?.uid || 'mock_user';
      const isRealUser = user && !user.isMock;

      if (isRealUser && db) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          const currentBalance = userDoc.exists() ? (userDoc.data()?.creditBalance || 0) : 0;
          const newBalance = currentBalance + credits;

          await updateDoc(userRef, { creditBalance: newBalance });

          const txsRef = collection(db, 'users', userId, 'transactions');
          await addDoc(txsRef, {
            userId,
            type: 'refund',
            amount: credits,
            balanceAfter: newBalance,
            description,
            referenceId,
            createdAt: new Date(),
          });

          await refresh();
          return;
        } catch (err) {
          console.error('Failed to refund in Firestore:', err);
        }
      }

      // Fallback
      const currentBalance = loadBalance();
      const newBalance = currentBalance + credits;
      const tx: CreditTransaction = {
        id: generateTxId(),
        userId,
        type: 'refund',
        amount: credits,
        balanceAfter: newBalance,
        description,
        referenceId,
        createdAt: new Date(),
      };
      const existingTxs = loadTransactions();
      saveBalance(newBalance);
      saveTransactions([tx, ...existingTxs]);
      await refresh();
    },
    [user, db, refresh]
  );

  /** บันทึกธุรกรรมเติมเครดิตที่ล้มเหลว */
  const failedTopup = useCallback(
    async (packageName: string, priceTHB: number) => {
      const userId = user?.uid || 'mock_user';
      const isRealUser = user && !user.isMock;
      const txId = generateTxId();

      if (isRealUser && db) {
        try {
          const userRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userRef);
          const currentBalance = userDoc.exists() ? (userDoc.data()?.creditBalance || 0) : 0;

          const txsRef = collection(db, 'users', userId, 'transactions');
          await addDoc(txsRef, {
            userId,
            type: 'topup',
            amount: 0,
            balanceAfter: currentBalance,
            description: `เติมเครดิตไม่สำเร็จ — แพ็กเกจ ${packageName} (฿${priceTHB.toLocaleString()})`,
            referenceId: `fail_${packageName.toLowerCase()}_${Date.now()}`,
            createdAt: new Date(),
            channel: 'QR PromptPay',
            status: 'failed',
            packageName,
            paymentAmount: priceTHB
          });
          await refresh();
          return;
        } catch (err) {
          console.error('Failed to log failed topup on server:', err);
        }
      }

      // Fallback local storage
      const currentBalance = loadBalance();
      const tx: CreditTransaction = {
        id: txId,
        userId,
        type: 'topup',
        amount: 0,
        balanceAfter: currentBalance,
        description: `เติมเครดิตไม่สำเร็จ — แพ็กเกจ ${packageName} (฿${priceTHB.toLocaleString()})`,
        referenceId: `fail_${packageName.toLowerCase()}_${Date.now()}`,
        createdAt: new Date(),
        channel: 'QR PromptPay',
        status: 'failed',
        packageName,
        paymentAmount: priceTHB
      };
      const existingTxs = loadTransactions();
      saveTransactions([tx, ...existingTxs]);
      await refresh();
    },
    [user, db, refresh]
  );

  return { creditBalance, transactions, isLoading, topup, spend, refund, failedTopup, refresh };
}

