'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText, User, Calendar, MapPin, Home, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';

interface DelegationRequest {
  id: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  propertyId: number;
  propertyName: string;
  propertyLocation: string;
  propertyPrice: number;
  propertyType: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  contractSigned: boolean;
}

export default function OwnerApprovalsPage() {
  const lang: Language = 'th'; // Default to Thai for demo
  const { user } = useUser();
  const [selectedRequest, setSelectedRequest] = useState<DelegationRequest | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [requests, setRequests] = useState<DelegationRequest[]>([]);

  // Load delegation requests from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('primerent_delegation_requests');
    if (stored) {
      setRequests(JSON.parse(stored));
    }
  }, []);

  const handleApprove = (request: DelegationRequest) => {
    setSelectedRequest(request);
    setShowContractModal(true);
  };

  const handleReject = (requestId: string) => {
    toast({
      title: lang === 'th' ? 'ปฏิเสธคำขอเรียบร้อย' : 'Request Rejected',
      description: lang === 'th' ? 'คุณได้ปฏิเสธคำขอรับสิทธิ์นายหน้าแล้ว' : 'You have rejected the agent delegation request'
    });
  };

  const handleSignContract = () => {
    if (!selectedRequest) return;
    
    // Update request status to approved
    const updatedRequests = requests.map(req => 
      req.id === selectedRequest.id 
        ? { ...req, status: 'approved' as const, contractSigned: true }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('primerent_delegation_requests', JSON.stringify(updatedRequests));
    
    // Add notification to agent's localStorage (mock system)
    const agentNotification = {
      id: `notif_${Date.now()}`,
      type: 'success',
      title: lang === 'th' ? 'อนุมัติสิทธิ์นายหน้าเรียบร้อย' : lang === 'cn' ? '代理权已批准' : 'Agent Delegation Approved',
      message: lang === 'th' 
        ? 'เจ้าของอนุมัติให้คุณเป็นนายหน้าสำหรับ ' + selectedRequest.propertyName 
        : lang === 'cn' 
        ? '业主已批准您成为 ' + selectedRequest.propertyName + ' 的代理人' 
        : 'Owner approved you as agent for ' + selectedRequest.propertyName,
      read: false,
      timestamp: new Date(),
      propertyId: selectedRequest.propertyId,
      action: {
        label: lang === 'th' ? 'รีโพสประกาศ' : lang === 'cn' ? '重新发布' : 'Repost Listing',
        onClick: () => {
          window.location.href = `/agent/repost?propertyId=${selectedRequest.propertyId}`;
        }
      }
    };
    
    const existingNotifications = JSON.parse(localStorage.getItem('primerent_notifications') || '[]');
    existingNotifications.push(agentNotification);
    localStorage.setItem('primerent_notifications', JSON.stringify(existingNotifications));
    
    toast({
      title: lang === 'th' ? 'เซ็นสัญญาเรียบร้อย' : 'Contract Signed',
      description: lang === 'th' ? 'สัญญาการมอบหมายดูแลห้องเช่าถูกเซ็นและอนุมัติแล้ว' : 'Delegation contract has been signed and approved'
    });
    
    setShowContractModal(false);
    setSelectedRequest(null);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {lang === 'th' ? 'คำขอรับสิทธิ์นายหน้า' : lang === 'cn' ? '代理权申请' : 'Agent Delegation Requests'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {lang === 'th' 
                  ? 'ตรวจสอบและอนุมัติคำขอจากนายหน้าที่ต้องการดูแลทรัพย์ของคุณ' 
                  : lang === 'cn' 
                  ? '查看并批准代理商管理您的资产的请求' 
                  : 'Review and approve requests from agents to manage your properties'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              {lang === 'th' ? 'คำขอที่รอดำเนินการ' : lang === 'cn' ? '待处理请求' : 'Pending Requests'}
              <Badge className="bg-orange-100 text-orange-700 border-orange-300">{pendingRequests.length}</Badge>
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Agent Info */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{request.agentName}</p>
                            <p className="text-xs text-gray-500">{request.agentEmail}</p>
                          </div>
                        </div>

                        {/* Property Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Home className="w-5 h-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 mb-1">{request.propertyName}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {request.propertyLocation}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Shield className="w-4 h-4" />
                                  {request.propertyType}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-primary mt-2">
                                ฿{request.propertyPrice.toLocaleString()}/{lang === 'th' ? 'เดือน' : 'month'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Request Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {lang === 'th' ? 'ส่งคำขอเมื่อ' : lang === 'cn' ? '请求日期' : 'Request Date'}: {request.requestDate}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          onClick={() => handleApprove(request)}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {lang === 'th' ? 'อนุมัติ' : lang === 'cn' ? '批准' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {lang === 'th' ? 'ปฏิเสธ' : lang === 'cn' ? '拒绝' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Approved Requests */}
        {approvedRequests.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              {lang === 'th' ? 'คำขอที่อนุมัติแล้ว' : lang === 'cn' ? '已批准请求' : 'Approved Requests'}
              <Badge className="bg-green-100 text-green-700 border-green-300">{approvedRequests.length}</Badge>
            </h2>
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <Card key={request.id} className="border border-green-200 bg-green-50/50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{request.agentName}</p>
                          <p className="text-sm text-gray-600">{request.propertyName}</p>
                        </div>
                      </div>
                      {request.contractSigned && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <FileText className="w-3 h-3 mr-1" />
                          {lang === 'th' ? 'เซ็นสัญญาแล้ว' : lang === 'cn' ? '已签约' : 'Contract Signed'}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingRequests.length === 0 && approvedRequests.length === 0 && (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-900 mb-2">
                {lang === 'th' ? 'ยังไม่มีคำขอรับสิทธิ์นายหน้า' : lang === 'cn' ? '暂无代理权申请' : 'No Delegation Requests'}
              </p>
              <p className="text-sm text-gray-500">
                {lang === 'th' 
                  ? 'เมื่อนายหน้าส่งคำขอมา คำขอจะแสดงที่นี่' 
                  : lang === 'cn' 
                  ? '当代理商发送请求时，请求将显示在这里' 
                  : 'When agents send requests, they will appear here'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contract Modal */}
      {showContractModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContractModal(false)} />
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                {lang === 'th' ? 'สัญญาการมอบหมายดูแลห้องเช่า' : lang === 'cn' ? '租赁管理授权合同' : 'Property Management Delegation Contract'}
              </h2>

              <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">
                    {lang === 'th' ? 'เจ้าของทรัพย์สิน' : lang === 'cn' ? '业主' : 'Property Owner'}
                  </p>
                  <p className="font-bold text-gray-900">{user?.displayName || 'Owner Name'}</p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">
                    {lang === 'th' ? 'นายหน้าผู้รับมอบหมาย' : lang === 'cn' ? '受委托代理商' : 'Delegated Agent'}
                  </p>
                  <p className="font-bold text-gray-900">{selectedRequest.agentName}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.agentEmail}</p>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">
                    {lang === 'th' ? 'ทรัพย์สินที่มอบหมาย' : lang === 'cn' ? '委托物业' : 'Delegated Property'}
                  </p>
                  <p className="font-bold text-gray-900">{selectedRequest.propertyName}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.propertyLocation}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {lang === 'th' 
                      ? 'โดยการเซ็นสัญญานี้ เจ้าของทรัพย์สินยินยอมมอบสิทธิ์ให้นายหน้าดูแลการเช่าทรัพย์สินดังกล่าว โดยนายหน้าจะได้รับสิทธิ์ในการติดต่อกับลูกค้าโดยตรง 1:1 และจะไม่เปิดเผยข้อมูลส่วนตัวของเจ้าของทรัพย์สิน'
                      : lang === 'cn'
                      ? '通过签署本合同，业主同意授权代理商管理该物业的租赁。代理商将获得直接与客户1:1联系的权利，且不会披露业主的个人信息。'
                      : 'By signing this contract, the property owner agrees to delegate the property rental management to the agent. The agent will have the right to contact customers directly 1:1 and will not disclose the property owner\'s personal information.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSignContract}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {lang === 'th' ? 'เซ็นสัญญาและอนุมัติ' : lang === 'cn' ? '签约并批准' : 'Sign & Approve'}
                </Button>
                <Button
                  onClick={() => setShowContractModal(false)}
                  variant="outline"
                  className="flex-1 font-bold"
                >
                  {lang === 'th' ? 'ยกเลิก' : lang === 'cn' ? '取消' : 'Cancel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
