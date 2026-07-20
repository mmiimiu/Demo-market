
"use client";

import React, { useState } from 'react';
import { 
  LifeBuoy, MessageSquare, AlertCircle, Clock, 
  CheckCircle2, ChevronRight, PlusCircle, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translations } from '@/lib/translations';
import { Language, Ticket } from '@/lib/types';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function SupportSystem({ lang }: { lang: Language }) {
  const t = translations[lang];
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const ticketsQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'tickets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: tickets, loading: ticketsLoading } = useCollection<Ticket>(ticketsQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setLoading(true);
    const ticketData = {
      userId: user.uid,
      ...formData,
      status: 'open',
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, 'tickets'), ticketData)
      .then(() => {
        toast({
          title: lang === 'th' ? 'ส่งข้อมูลสำเร็จ' : 'Ticket Submitted',
          description: lang === 'th' ? 'เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด' : 'Support will contact you soon.'
        });
        setShowForm(false);
        setFormData({ subject: '', description: '', priority: 'medium' });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: '/tickets',
          operation: 'create',
          requestResourceData: ticketData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-primary rounded-none flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{t.support}</h1>
            <p className="text-muted-foreground font-medium">{lang === 'th' ? 'แจ้งปัญหาหรือสอบถามข้อมูลการใช้งาน' : 'Report issues or ask questions.'}</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="h-14 px-8 rounded-none bg-primary hover:bg-primary-dark font-black text-lg shadow-xl shadow-primary/20 gap-3"
        >
          {showForm ? <ChevronRight className="w-5 h-5 rotate-90" /> : <PlusCircle className="w-5 h-5" />}
          {t.submit_ticket}
        </Button>
      </div>

      {showForm && (
        <Card className="border-none shadow-2xl rounded-none overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">{t.support_subject}</Label>
                  <Input 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder={lang === 'th' ? 'เช่น ปัญหาการลงประกาศ...' : 'e.g. Issue posting ad...'}
                    className="h-14 rounded-none bg-gray-50 border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">{t.priority}</Label>
                  <Select value={formData.priority} onValueChange={(val: any) => setFormData({...formData, priority: val})}>
                    <SelectTrigger className="h-14 rounded-none bg-gray-50 border-none font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-none shadow-2xl">
                      <SelectItem value="low">{lang === 'th' ? 'ต่ำ' : 'Low'}</SelectItem>
                      <SelectItem value="medium">{lang === 'th' ? 'ปานกลาง' : 'Medium'}</SelectItem>
                      <SelectItem value="high">{lang === 'th' ? 'เร่งด่วน' : 'High'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-gray-700">{t.support_desc}</Label>
                <Textarea 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-[150px] rounded-none bg-gray-50 border-none font-bold p-6"
                  placeholder={lang === 'th' ? 'บรรยายปัญหาที่คุณพบ...' : 'Describe your problem...'}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-16 rounded-none bg-primary font-black text-xl shadow-xl shadow-primary/20 gap-3">
                {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-5 h-5" /> {t.submit_ticket}</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary" /> {t.open_tickets}
        </h3>
        
        {ticketsLoading ? (
          <div className="py-20 text-center animate-pulse font-black text-gray-300 tracking-widest uppercase">Loading Tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center bg-gray-50/50 rounded-none border-2 border-dashed border-gray-200">
             <LifeBuoy className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="font-bold text-gray-400">{lang === 'th' ? 'ยังไม่มีรายการแจ้งปัญหา' : 'No support tickets yet'}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="border-none shadow-sm rounded-none overflow-hidden bg-white hover:shadow-md transition-all group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-none flex items-center justify-center shrink-0 shadow-sm",
                        ticket.status === 'open' ? "bg-blue-50 text-blue-500" :
                        ticket.status === 'resolved' ? "bg-green-50 text-green-500" : "bg-gray-50 text-gray-500"
                      )}>
                        {ticket.status === 'resolved' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 group-hover:text-primary transition-colors">{ticket.subject}</h4>
                        <p className="text-xs font-bold text-gray-400">ID: {ticket.id} • {ticket.createdAt ? format(typeof ticket.createdAt.toDate === 'function' ? ticket.createdAt.toDate() : ticket.createdAt, 'dd MMM yyyy HH:mm') : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "rounded-none px-3 py-1 font-black text-[10px] tracking-widest border-none",
                        ticket.priority === 'high' ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"
                      )}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="rounded-none px-3 py-1 font-black text-[10px] tracking-widest border-primary/20 text-primary">
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
