'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Pen, FileText, User, Shield, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, Property } from '@/lib/types';
import { useNotifications } from '@/contexts/NotificationContext';
import { DelegationEdoc } from '@/components/profile/UserProfile/Delegations/DelegationEdoc';
import { DelegationAgreement } from '@/components/profile/UserProfile/Delegations/types';

interface AgentDelegationModalProps {
  open: boolean;
  onClose: () => void;
  property: Property;
  lang: Language;
  viewOnly?: boolean;
  onSignComplete?: () => void;
}

export const AgentDelegationModal: React.FC<AgentDelegationModalProps> = ({
  open,
  onClose,
  property,
  lang,
  viewOnly = false,
  onSignComplete,
}) => {
  const [signature, setSignature] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  const handleSign = () => {
    if (signature.trim()) {
      setIsSigned(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Save active delegation to localStorage (already approved by owner)
    const delegation = {
      id: 'delegate-' + Date.now(),
      propertyId: property.id,
      propertyName: property.name,
      ownerId: property.ownerId || 'mock_owner_id',
      ownerName: property.ownerId ? 'เจ้าของห้อง' : 'Demo Owner',
      ownerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqWDpaAAAACXBIWXMAAAsTAAALEwEAmpwYAAABeklEQVR4nO2aTWrDMBSFP6t9G12ErKI30E10IXkDOyvIDbILySr2bXSReAO5gS7C90Ukh1aUOMWx6sA9B4QY2Y9PT0+WnFJKHMdxHMdxHMdxHMdxHNvFDHAATg34vQMeO8H6gCPwZcHzG/gAps04rpg58ArMmsM34A54teC6KqaAM2C2OHqLzS7A1YLrq5gC1qT3M1uMvcf2DHgC7gU2xTADPAEPwLgYc1fR4o5U5lM8i78g64c7UrWfYm7HqvgLst7cqaobNlV2q/gNf7W4V3U/t1Z2q/gN99b4V3U/t1Z2q/gN32pxu25/Fv9a3Gpx72F/q8VdxW941uKeiz/E3I6L/Cnm6R1HqvhzzO24yL9int5xpIp+w18t7lXdL22q7FbxG77V4nbd/iz+tbiq7u/Wyq6K/9p7Vffzqaq+Kj1Wpcf2Lw8qPUyFh6XwYCo87ApPrsKjrvAkFZ5ChZeHrvA0FZ62wtNW+P8pjuM4juM4juM4juM4tuf4AQ+Yd6n2XwYJAAAAAElFTkSuQmCC',
      agentId: 'mock_agent',
      agentName: 'Mock Agent',
      agentSignature: signature,
      commissionRate: property.agentCommissionRate || 5,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const existingDelegations = JSON.parse(localStorage.getItem('primerent_delegations') || '[]');
    existingDelegations.push(delegation);
    localStorage.setItem('primerent_delegations', JSON.stringify(existingDelegations));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    // Add notification for agent
    addNotification({
      type: 'info',
      title: lang === 'th' ? 'ลงนามมอบหมายสิทธิ์สำเร็จ' : lang === 'cn' ? '签署成功' : 'Signed Successfully',
      message: lang === 'th' 
        ? 'คุณได้รับการแต่งตั้งให้เป็นตัวแทนนายหน้าดูแลห้องพักนี้แล้ว (สิทธิ์ 1:1)'
        : lang === 'cn'
        ? '您已被正式授权代理该房源（一对一代理权）'
        : 'You have been officially authorized to represent this property (1:1 representation right)',
    });
    
    if (onSignComplete) {
      onSignComplete();
    }
    
    onClose();
  };

  const displayName = lang === 'en' ? property.nameEn : lang === 'cn' ? property.nameCn : property.name;
  const displayLocation = lang === 'en' ? property.locationEn : lang === 'cn' ? property.locationCn : property.location;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-gray-900">
            {viewOnly 
              ? (lang === 'th' ? 'สัญญามอบหมายสิทธิ์นายหน้า' : lang === 'cn' ? '代理授权协议' : 'Agent Delegation Agreement')
              : (lang === 'th' ? 'ขอรับสิทธิ์นายหน้า' : lang === 'cn' ? '申请代理权' : 'Request Agent Delegation')
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                    ฿{property.price.toLocaleString()}/{lang === 'th' ? 'เดือน' : lang === 'cn' ? '月' : 'mo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DelegationEdoc
            lang={lang === 'cn' ? 'en' : lang}
            agreement={{
              id: 'delegate-temp',
              propertyId: property.id as number,
              propertyName: displayName,
              ownerId: property.ownerId || 'mock_owner_id',
              ownerName: 'Demo Owner',
              ownerSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqWDpaAAAACXBIWXMAAAsTAAALEwEAmpwYAAABeklEQVR4nO2aTWrDMBSFP6t9G12ErKI30E10IXkDOyvIDbILySr2bXSReAO5gS7C90Ukh1aUOMWx6sA9B4QY2Y9PT0+WnFJKHMdxHMdxHMdxHMdxHNvFDHAATg34vQMeO8H6gCPwZcHzG/gAps04rpg58ArMmsM34A54teC6KqaAM2C2OHqLzS7A1YLrq5gC1qT3M1uMvcf2DHgC7gU2xTADPAEPwLgYc1fR4o5U5lM8i78g64c7UrWfYm7HqvgLst7cqaobNlV2q/gNf7W4V3U/t1Z2q/gN99b4V3U/t1Z2q/gN32pxu25/Fv9a3Gpx72F/q8VdxW941uKeiz/E3I6L/Cnm6R1HqvhzzO24yL9int5xpIp+w18t7lXdL22q7FbxG77V4nbd/iz+tbiq7u/Wyq6K/9p7Vffzqaq+Kj1Wpcf2Lw8qPUyFh6XwYCo87ApPrsKjrvAkFZ5ChZeHrvA0FZ62wtNW+P8pjuM4juM4juM4juM4tuf4AQ+Yd6n2XwYJAAAAAElFTkSuQmCC', // Mock signature
              agentId: 'mock_agent',
              agentName: 'สมชาย มืออาชีพ (Agent)',
              agentSignature: isSigned ? signature : null,
              commissionRate: property.agentCommissionRate || 10,
              status: isSigned ? 'active' : 'pending_agent_signature',
              createdAt: new Date().toISOString()
            }}
            currentRole={viewOnly ? 'viewer' : 'agent'}
            onSign={(sig) => {
              setSignature(sig);
              setIsSigned(true);
            }}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl h-12 font-bold"
            >
              {lang === 'th' ? 'ปิด' : lang === 'cn' ? '关闭' : 'Close'}
            </Button>
            {!viewOnly && (
              <Button
                onClick={handleSubmit}
                disabled={!isSigned || isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-black"
              >
                {isSubmitting 
                  ? (lang === 'th' ? 'กำลังส่ง...' : lang === 'cn' ? '发送中...' : 'Sending...')
                  : (lang === 'th' ? 'เซ็นชื่อและส่งคำร้อง' : lang === 'cn' ? '签名并发送请求' : 'Sign & Submit Request')
                }
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
