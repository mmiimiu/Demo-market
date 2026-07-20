'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Check, Calendar, MapPin, Home, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/types';
import { mockProperties } from '@/lib/properties';
import { AgentDelegationModal } from '@/components/agent/AgentDelegationModal';
import { toast } from '@/hooks/use-toast';

interface AgentJob {
  propertyId: number;
  propertyName: string;
  propertyNameEn: string;
  propertyNameCn: string;
  location: string;
  locationEn: string;
  locationCn: string;
  price: number;
  type: string;
  status: 'active' | 'completed' | 'pending';
  assignedDate: string;
  ownerApproved: boolean;
}

export default function AgentJobsPage() {
  const lang: Language = 'th'; // Default to Thai for demo
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showDelegationModal, setShowDelegationModal] = useState(false);

  // Mock agent jobs data
  const [jobs] = useState<AgentJob[]>([
    {
      propertyId: 1,
      propertyName: 'คอนโดหรู ใกล้ BTS อโศก สุขุมวิท',
      propertyNameEn: 'Luxury Condo near BTS Asok, Sukhumvit',
      propertyNameCn: '素坤逸阿速 BTS 站旁豪华公寓',
      location: 'สุขุมวิท กรุงเทพฯ',
      locationEn: 'Sukhumvit, Bangkok',
      locationCn: '曼谷 素坤逸',
      price: 18000,
      type: 'condo',
      status: 'active',
      assignedDate: '2026-07-01',
      ownerApproved: true
    },
    {
      propertyId: 3,
      propertyName: 'คอนโดมินิมอล นิมมานเหมินท์ วิวดอย',
      propertyNameEn: 'Minimalist Nimman Condo, Doi Suthep View',
      propertyNameCn: '宁曼路山景极简公寓',
      location: 'นิมมาน เชียงใหม่',
      locationEn: 'Nimmanhaemin, Chiang Mai',
      locationCn: '清迈 宁曼路',
      price: 12000,
      type: 'condo',
      status: 'pending',
      assignedDate: '2026-06-28',
      ownerApproved: false
    }
  ]);

  const handleViewContract = (job: AgentJob) => {
    const property = mockProperties.find(p => p.id === job.propertyId);
    if (property) {
      setSelectedProperty(property);
      setShowDelegationModal(true);
    }
  };

  const handleRepost = (job: AgentJob) => {
    toast({
      title: lang === 'th' ? 'รีโพสต์สำเร็จ' : lang === 'cn' ? '重新发布成功' : 'Repost Successful',
      description: lang === 'th' 
        ? 'ประกาศถูกโพสต์ใหม่แล้ว' 
        : lang === 'cn' 
        ? '房源已重新发布' 
        : 'Listing has been reposted successfully',
    });
    // Navigate to listings page after a short delay
    setTimeout(() => {
      window.location.href = '/listings';
    }, 1500);
  };

  const getDisplayName = (job: AgentJob) => {
    return job.propertyName;
  };

  const getDisplayLocation = (job: AgentJob) => {
    return job.location;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {lang === 'th' ? 'งานนายหน้าของฉัน' : lang === 'cn' ? '我的代理工作' : 'My Agent Jobs'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {lang === 'th' 
                  ? 'รายการทรัพย์ที่ได้รับสิทธิ์จากเจ้าของ' 
                  : lang === 'cn' 
                  ? '从业主处获得授权的房源列表' 
                  : 'Properties delegated by owners'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white border-none font-black text-xs px-3 py-1 rounded-xl">
                {jobs.filter(j => j.status === 'active').length} {lang === 'th' ? 'งานที่กำลังทำ' : lang === 'cn' ? '进行中' : 'Active'}
              </Badge>
              <Badge className="bg-orange-500 text-white border-none font-black text-xs px-3 py-1 rounded-xl">
                {jobs.filter(j => j.status === 'pending').length} {lang === 'th' ? 'รออนุมัติ' : lang === 'cn' ? '待批准' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {jobs.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-gray-900 mb-2">
                {lang === 'th' ? 'ยังไม่มีงานนายหน้า' : lang === 'cn' ? '暂无代理工作' : 'No Agent Jobs Yet'}
              </h3>
              <p className="text-sm text-gray-500">
                {lang === 'th' 
                  ? 'เมื่อเจ้าของอนุมัติคำขอของคุณ งานจะปรากฏที่นี่' 
                  : lang === 'cn' 
                  ? '当业主批准您的请求后，工作将显示在这里' 
                  : 'Jobs will appear here when owners approve your requests'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <Card key={job.propertyId} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Property Image */}
                    <div className="w-full lg:w-48 h-32 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={mockProperties.find(p => p.id === job.propertyId)?.img || '/placeholder.png'} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Property Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-black text-gray-900 mb-1">
                            {getDisplayName(job)}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{getDisplayLocation(job)}</span>
                          </div>
                        </div>
                        <Badge 
                          className={cn(
                            "font-black text-xs px-3 py-1 rounded-xl",
                            job.status === 'active' ? "bg-green-500 text-white border-none" :
                            job.status === 'pending' ? "bg-orange-500 text-white border-none" :
                            "bg-gray-500 text-white border-none"
                          )}
                        >
                          {job.status === 'active' 
                            ? (lang === 'th' ? 'กำลังทำ' : lang === 'cn' ? '进行中' : 'Active')
                            : job.status === 'pending'
                            ? (lang === 'th' ? 'รออนุมัติ' : lang === 'cn' ? '待批准' : 'Pending')
                            : (lang === 'th' ? 'เสร็จสิ้น' : lang === 'cn' ? '已完成' : 'Completed')
                          }
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                              {lang === 'th' ? 'ประเภท' : lang === 'cn' ? '类型' : 'Type'}
                            </p>
                            <p className="text-sm font-black text-gray-900">{job.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                              {lang === 'th' ? 'ราคา' : lang === 'cn' ? '价格' : 'Price'}
                            </p>
                            <p className="text-sm font-black text-gray-900">฿{job.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                              {lang === 'th' ? 'ได้รับเมื่อ' : lang === 'cn' ? '获得时间' : 'Assigned'}
                            </p>
                            <p className="text-sm font-black text-gray-900">{job.assignedDate}</p>
                          </div>
                        </div>
                      </div>

                      {/* Owner Approval Status */}
                      <div className={cn(
                        "flex items-center gap-2 p-3 rounded-xl mb-4",
                        job.ownerApproved ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
                      )}>
                        {job.ownerApproved ? (
                          <>
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-bold text-green-900">
                              {lang === 'th' ? 'เจ้าของอนุมัติแล้ว' : lang === 'cn' ? '业主已批准' : 'Owner Approved'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-bold text-orange-900">
                              {lang === 'th' ? 'รอการอนุมัติจากเจ้าของ' : lang === 'cn' ? '等待业主批准' : 'Waiting for Owner Approval'}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleViewContract(job)}
                          variant="outline"
                          className="flex-1 rounded-xl h-10 font-bold border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {lang === 'th' ? 'ดูรายละเอียดสัญญา' : lang === 'cn' ? '查看协议详情' : 'View Contract'}
                        </Button>
                        {job.ownerApproved && (
                          <Button
                            onClick={() => handleRepost(job)}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 font-black"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {lang === 'th' ? 'รีโพสต์ประกาศนี้' : lang === 'cn' ? '重新发布此房源' : 'Repost This Listing'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Agent Delegation Modal (View Only Mode) */}
      {selectedProperty && (
        <AgentDelegationModal
          open={showDelegationModal}
          onClose={() => {
            setShowDelegationModal(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          lang={lang}
          viewOnly={true}
        />
      )}
    </div>
  );
}
