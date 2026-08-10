'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, FileText, AlertCircle, ShieldAlert } from 'lucide-react';
import { useNotification } from '@/hooks/use-notification';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { PropertyOwnershipVerification } from '@/lib/types/property';

// Mock data for pending approvals
const initialRequests = [
  {
    id: 'req_1',
    user: 'Somchai Jaidee',
    email: 'somchai@example.com',
    type: 'agent',
    status: 'pending',
    date: '2026-06-24',
    documents: ['บัตรประชาชน', 'ใบอนุญาตนายหน้า']
  },
  {
    id: 'req_2',
    user: 'Manee Srichinda',
    email: 'manee@example.com',
    type: 'owner',
    status: 'pending',
    date: '2026-06-23',
    documents: ['บัตรประชาชน', 'โฉนดที่ดิน']
  }
];

export default function AdminApprovalsPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [propertyRequests, setPropertyRequests] = useState<PropertyOwnershipVerification[]>([]);
  const [activeTab, setActiveTab] = useState<'roles' | 'properties'>('roles');
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [selectedPropReq, setSelectedPropReq] = useState<PropertyOwnershipVerification | null>(null);
  const notification = useNotification();

  const fetchPropertyRequests = async () => {
    try {
      const q = query(collection(db, 'properties_verification'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const propsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as PropertyOwnershipVerification[];
      setPropertyRequests(propsData);
    } catch (error) {
      console.error('Error fetching property requests:', error);
    }
  };

  React.useEffect(() => {
    fetchPropertyRequests();
  }, []);

  const handleApprove = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    notification.success('Approved Successfully', `User has been upgraded.`);
    setSelectedReq(null);
  };

  const handleReject = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    notification.error('Rejected', `User upgrade request denied.`);
    setSelectedReq(null);
  };

  const handleApproveProperty = async (id: string) => {
    try {
      await updateDoc(doc(db, 'properties_verification', id), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });
      setPropertyRequests(propertyRequests.filter(r => r.id !== id));
      notification.success('Approved Successfully', 'Property ownership verified.');
      setSelectedPropReq(null);
    } catch (e: any) {
      notification.error('Error', e.message);
    }
  };

  const handleRejectProperty = async (id: string) => {
    try {
      await updateDoc(doc(db, 'properties_verification', id), {
        status: 'rejected',
        rejectionReason: 'Documents invalid or insufficient'
      });
      setPropertyRequests(propertyRequests.filter(r => r.id !== id));
      notification.error('Rejected', 'Property ownership request denied.');
      setSelectedPropReq(null);
    } catch (e: any) {
      notification.error('Error', e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black text-gray-900">Admin Approvals</h1>
            <p className="text-gray-500 font-medium mt-1">Review and approve role upgrade requests and property verifications</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
          <button 
            className={`pb-3 px-2 font-bold transition-colors ${activeTab === 'roles' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('roles')}
          >
            Role Upgrades
          </button>
          <button 
            className={`pb-3 px-2 font-bold transition-colors ${activeTab === 'properties' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
            onClick={() => setActiveTab('properties')}
          >
            Property Verifications
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'roles' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-gray-700">User</th>
                  <th className="p-4 font-bold text-gray-700">Type</th>
                  <th className="p-4 font-bold text-gray-700">Date</th>
                  <th className="p-4 font-bold text-gray-700">Status</th>
                  <th className="p-4 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500 font-medium">
                      No pending requests.
                    </td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{req.user}</div>
                        <div className="text-xs text-gray-500">{req.email}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={req.type === 'agent' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>
                          {req.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-600">{req.date}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>
                      </td>
                      <td className="p-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="font-bold rounded-xl h-9"
                          onClick={() => setSelectedReq(req)}
                        >
                          Review Docs
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-gray-700">User ID</th>
                  <th className="p-4 font-bold text-gray-700">Deed Number</th>
                  <th className="p-4 font-bold text-gray-700">Land Office</th>
                  <th className="p-4 font-bold text-gray-700">Status</th>
                  <th className="p-4 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {propertyRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500 font-medium">
                      No pending property requests.
                    </td>
                  </tr>
                ) : (
                  propertyRequests.map(req => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-xs truncate max-w-[120px]">{req.uid}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{req.deedNumber}</td>
                      <td className="p-4 text-sm font-medium text-gray-600">{req.landOffice}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>
                      </td>
                      <td className="p-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="font-bold rounded-xl h-9"
                          onClick={() => setSelectedPropReq(req)}
                        >
                          Review Deed
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedReq} onOpenChange={(val) => { if (!val) setSelectedReq(null); }}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border-none shadow-2xl z-[200]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Review Request</DialogTitle>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-6 py-4">
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">User</p>
                <p className="font-bold text-gray-900">{selectedReq.user} ({selectedReq.email})</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">Requested Role</p>
                <Badge className={selectedReq.type === 'agent' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>
                  {selectedReq.type.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-3">Submitted Documents</p>
                <div className="space-y-2">
                  {selectedReq.documents.map((doc: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="font-bold text-sm text-gray-700">{doc} (Mock Image)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button 
              variant="outline" 
              className="rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleReject(selectedReq?.id)}
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
            <Button 
              className="rounded-xl font-black bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleApprove(selectedReq?.id)}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Approve & Upgrade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPropReq} onOpenChange={(val) => { if (!val) setSelectedPropReq(null); }}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border-none shadow-2xl z-[200]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Review Property Ownership</DialogTitle>
          </DialogHeader>
          {selectedPropReq && (
            <div className="space-y-6 py-4">
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">User ID</p>
                <p className="font-bold text-gray-900">{selectedPropReq.uid}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Deed Number</p>
                  <p className="font-bold text-gray-900">{selectedPropReq.deedNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-bold mb-1">Land Office</p>
                  <p className="font-bold text-gray-900">{selectedPropReq.landOffice}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-3">Deed Document</p>
                <a 
                  href={selectedPropReq.deedFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm text-gray-700">View Document</span>
                </a>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button 
              variant="outline" 
              className="rounded-xl font-bold border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => selectedPropReq?.id && handleRejectProperty(selectedPropReq.id)}
            >
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
            <Button 
              className="rounded-xl font-black bg-green-500 hover:bg-green-600 text-white"
              onClick={() => selectedPropReq?.id && handleApproveProperty(selectedPropReq.id)}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Approve Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
