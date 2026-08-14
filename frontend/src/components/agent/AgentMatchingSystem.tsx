'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Star, MessageSquare, Clock, UserCheck, ShieldCheck, Search, PlusCircle, Settings, Loader2, CheckCircle2, Radar, ArrowRight, MessageCircle, Building2, Key, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { WorkingZoneSettings } from './WorkingZoneSettings';
import { ContractDocument } from '../contract/ContractSystem/ContractDocument';
import { SignaturePad } from '../shared/ContractManager/SignaturePad';
import { useNotifications } from '@/contexts/NotificationContext';

const InteractiveMap = dynamic(
  () => import('./InteractiveMap').then(m => m.InteractiveMap),
  { ssr: false, loading: () => <div className="w-full h-[320px] rounded-xl bg-gray-100 animate-pulse flex items-center justify-center"><p className="text-sm text-gray-400 font-medium">โหลดแผนที่...</p></div> }
);

interface Applicant {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  initial: string;
}

interface Post {
  id: string;
  project: string;
  radius: string;
  price: string;
  status: 'searching' | 'matched';
  applicants: Applicant[];
  selectedAgentId: string | null;
  agentsNearbyCount: number;
  canExpand: boolean;
  expanded: boolean;
}

export function AgentMatchingSystem({ lang = 'th' }: { lang?: 'th' | 'en' | 'cn' }) {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('find'); // find, post, myposts, zones

  // State for Find Jobs (Tab 1)
  const [interestedJobs, setInterestedJobs] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [findJobs, setFindJobs] = useState([
    {
      id: 'job-1',
      project: 'คอนโด XT Phayathai',
      details: 'ต้องการคนเปิดห้องให้ลูกค้าดู (มีกุญแจฝากที่นิติ)',
      urgency: 'ด่วนมาก',
      poster: 'เอเจนต์สมชาย',
      timeAgo: '2 นาทีที่แล้ว',
      distance: '1.2 km',
      time: 'วันนี้ 14:00 น.',
      comShare: '10%'
    },
    {
      id: 'job-2',
      project: 'Noble Play',
      details: 'ต้องการคนไปช่วยตรวจเช็คสภาพห้องเช่าหลังผู้เช่าย้ายออก',
      urgency: 'ปกติ',
      poster: 'เอเจนต์มยุรี',
      timeAgo: '15 นาทีที่แล้ว',
      distance: '2.5 km',
      time: 'พรุ่งนี้ 10:00 น.',
      comShare: '15%'
    },
    {
      id: 'job-3',
      project: 'Life One Wireless',
      details: 'รับเคสพาผู้เช่าต่างชาติเดินดูส่วนกลางและสิ่งอำนวยความสะดวก',
      urgency: 'ด่วน',
      poster: 'เอเจนต์วิชัย',
      timeAgo: '1 ชั่วโมงที่แล้ว',
      distance: '3.1 km',
      time: 'วันนี้ 17:30 น.',
      comShare: '12%'
    }
  ]);

  // State for Post Jobs (Tab 2)
  const [isPosting, setIsPosting] = useState(false);
  const [postForm, setPostForm] = useState({ 
    project: 'คอนโด XT Phayathai', 
    date: '2026-08-15T14:00', 
    details: 'ต้องการคนพาผู้เช่าไปดูห้องพักและสิ่งอำนวยความสะดวกโครงการ (กุญแจฝากไว้ที่นิติบุคคล)', 
    price: '800', 
    location: 'พิกัด: 13.75254, 100.49401' 
  });
  
  // State for Owner Listings (Tab 1.5)
  const [ownerListings, setOwnerListings] = useState([
    {
      id: 'owner-job-1',
      project: 'คอนโด Life Asoke Hype (1 ห้องนอน 35 ตร.ม.)',
      details: 'กุญแจฝากไว้ที่นิติบุคคล สามารถพาลูกค้าไปดูได้เลยค่ะ',
      commission: '1 เดือน (สำหรับสัญญา 1 ปี)',
      ownerName: 'คุณมยุรี (เจ้าของห้อง)',
      location: 'พระราม 9, อโศก',
      status: 'searching', // searching, matched
      doorCode: '8894',
      keyLocation: 'นิติบุคคล ชั้น 1',
      distance: '2.1 km',
      agentsNearbyCount: 28,
      isSigned: false
    },
    {
      id: 'owner-job-2',
      project: 'Ideo Mix Sukhumvit (ห้อง 102)',
      details: 'ห้องสตูดิโอแต่งครบพร้อมเข้าอยู่ สนใจทักแชทขอข้อมูลเพิ่มเติมได้ค่ะ',
      commission: '1 เดือน',
      ownerName: 'คุณสมศักดิ์ (เจ้าของห้อง)',
      location: 'สุขุมวิท, อุดมสุข',
      status: 'searching',
      doorCode: '1025',
      keyLocation: 'ตู้จดหมายรหัส 4321',
      distance: '1.5 km',
      agentsNearbyCount: 19,
      isSigned: false
    }
  ]);

  // States for Agent Authorization Document & Signatures
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedOwnerListing, setSelectedOwnerListing] = useState<any>(null);
  const [authSignatureDataUrl, setAuthSignatureDataUrl] = useState('');
  const [authContract, setAuthContract] = useState<any>(null);

  const handleStartAuthSign = (listing: any) => {
    setSelectedOwnerListing(listing);
    setAuthSignatureDataUrl('');
    setAuthContract({
      id: `cnt-auth-${listing.id}`,
      propertyName: `แบบร่างหนังสือแต่งตั้งและมอบอำนาจตัวแทนเอเจ้นท์ - ${listing.project}`,
      propertyAddress: listing.location,
      zone: 'โซนทั่วไป',
      unitNo: 'ห้องพักมอบอำนาจ',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      rentAmount: 0,
      deposit: 0,
      ownerName: listing.ownerName,
      tenantName: '-',
      agentName: 'คุณ (นายหน้า)',
      hasAgent: true,
      status: 'pending_signatures',
      signatures: {
        owner: {
          signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><path d="M 10,15 C 30,5 40,25 60,15 C 70,10 80,10 90,15" stroke="black" stroke-width="2" fill="none"/></svg>',
          name: listing.ownerName,
          signedAt: new Date().toISOString()
        }
      }
    });
    setIsAuthModalOpen(true);
  };

  const handleAuthSignSubmit = () => {
    if (!authSignatureDataUrl || !selectedOwnerListing) return;
    
    // Update ownerListings state
    setOwnerListings(prev => prev.map(item => {
      if (item.id === selectedOwnerListing.id) {
        return { ...item, status: 'matched', isSigned: true };
      }
      return item;
    }));
    
    // 1. Add in-app notification for the User (Owner)
    addNotification({
      type: 'success',
      title: '🤝 เอเจนต์รับงานร่วมดูแลห้องพักของคุณแล้ว!',
      message: `เอเจนต์สมชาย (ตัวแทน) ได้ลงนามหนังสือแต่งตั้งมอบอำนาจเรียบร้อยแล้วสำหรับโครงการ ${selectedOwnerListing.project} สัญญาพร้อมใช้เปิดเผยข้อมูลแล้ว`,
      action: {
        label: 'เปิดดูสัญญา',
        url: '/liff/sign?role=owner'
      }
    });

    // 2. Add LINE OA notification for the Owner/User
    try {
      const storedLine = localStorage.getItem('primerent_line_oa_messages');
      const lineMsgs = storedLine ? JSON.parse(storedLine) : [];
      const newOaMsg = {
        id: 'line_msg_match_' + Date.now(),
        type: 'agent_match',
        projectName: selectedOwnerListing.project,
        agentName: 'คุณสมชาย ดีเลิศ (เอเจนต์ผู้รับงาน)',
        commission: selectedOwnerListing.commission,
        doorCode: selectedOwnerListing.doorCode,
        keyLocation: selectedOwnerListing.keyLocation,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('primerent_line_oa_messages', JSON.stringify([newOaMsg, ...lineMsgs]));
    } catch (error) {
      console.error('Error saving LINE OA message:', error);
    }
    
    showToast('✅ ลงนามสัญญามอบสิทธิ์และจับคู่สำเร็จ! ข้อมูลห้องถูกปลดล็อกแล้ว');
    setIsAuthModalOpen(false);
  };

  const handleLoadTemplate = (type: 'xt' | 'noble' | 'life') => {
    if (type === 'xt') {
      setPostForm({
        project: 'คอนโด XT Phayathai',
        date: '2026-08-15T14:00',
        details: 'ต้องการคนพาผู้เช่าไปดูห้องพักและสิ่งอำนวยความสะดวกโครงการ (กุญแจฝากไว้ที่นิติบุคคล)',
        price: '800',
        location: 'พิกัด: 13.75254, 100.49401'
      });
    } else if (type === 'noble') {
      setPostForm({
        project: 'Noble Play',
        date: '2026-08-16T10:00',
        details: 'ต้องการคนไปช่วยตรวจเช็คสภาพห้องเช่าหลังผู้เช่าย้ายออก (ถ่ายรูปห้องส่ง 10 รูป)',
        price: '600',
        location: 'พิกัด: 13.74235, 100.54012'
      });
    } else if (type === 'life') {
      setPostForm({
        project: 'Life One Wireless',
        date: '2026-08-17T17:30',
        details: 'รับเคสพาผู้เช่าต่างชาติเดินดูส่วนกลางและสิ่งอำนวยความสะดวกโครงการ',
        price: '750',
        location: 'พิกัด: 13.74712, 100.54845'
      });
    }
    showToast('ดึงข้อมูลโครงการล่าสุดเรียบร้อยแล้ว');
  };
  
  // State for Map
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedPin, setSelectedPin] = useState<{lat: number, lng: number, name: string} | null>(null);

  // State for My Posts (Tab 3)
  const [myMockPosts, setMyMockPosts] = useState<Post[]>([
    {
      id: 'post-1',
      project: 'คอนโด Life Asoke Hype',
      radius: '10km',
      price: '800',
      status: 'searching', 
      applicants: [
        { id: 'a1', name: 'Natthapong P.', rating: 4.9, reviews: 120, distance: '2.1 km', initial: 'N' },
        { id: 'a2', name: 'Sompong K.', rating: 4.5, reviews: 34, distance: '3.5 km', initial: 'S' }
      ],
      selectedAgentId: null,
      agentsNearbyCount: 28,
      canExpand: false,
      expanded: true
    }
  ]);

  // Expand logic and mock application logic
  const handleExpandRadius = (postId: string) => {
    // Set to expanding loading state and check if post qualifies
    setMyMockPosts(posts => {
      const post = posts.find(p => p.id === postId);
      if (!post || post.status !== 'searching' || post.applicants.length > 0) {
        return posts;
      }
      
      // Simulate expanding and finding new agents
      setTimeout(() => {
        setMyMockPosts(latestPosts => latestPosts.map(p => {
          if (p.id === postId && p.status === 'searching' && p.applicants.length === 0) {
            return {
              ...p,
              radius: '10km',
              agentsNearbyCount: p.agentsNearbyCount + 24,
              applicants: [
                { id: `new-a1-${Date.now()}`, name: 'Wichai T.', rating: 4.8, reviews: 56, distance: '6.2 km', initial: 'W' },
                { id: `new-a2-${Date.now()}`, name: 'Kanya R.', rating: 5.0, reviews: 12, distance: '8.5 km', initial: 'K' }
              ]
            };
          }
          return p;
        }));
        showToast('🔊 ขยายรัศมีเป็น 10km อัตโนมัติสำเร็จ! พบเอเจนต์รอบนอกเพิ่มแล้ว');
      }, 2000);

      return posts.map(p => 
        p.id === postId ? { ...p, expanded: true, radius: 'กำลังขยายค้นหา...' } : p
      );
    });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleInterest = (jobId: string) => {
    setInterestedJobs(prev => ({ ...prev, [jobId]: true }));
    const job = findJobs.find(j => j.id === jobId);
    
    // Add in-app notification
    addNotification({
      type: 'info',
      title: '🔔 มีเอเจนต์ใหม่สนใจรับงานของคุณ',
      message: `เอเจนต์ สมชาย ดีใจ ได้ส่งความสนใจที่จะร่วมดีลสำหรับโครงการ ${job?.project || ''} กรุณาตรวจสอบและกดอนุมัติ`,
      action: {
        label: 'ดูผู้สมัคร',
        url: '/liff/agent/dashboard?tab=myposts'
      }
    });
    
    showToast('ส่งคำขอรับงานสำเร็จ ระบบกำลังรอผู้โพสต์อนุมัติ');
  };

  const handlePostSubmit = () => {
    if (!postForm.project) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    setIsPosting(true);
    // Simulate network delay
    setTimeout(() => {
      setIsPosting(false);
      showToast('กระจายงานให้ตัวแทนในรัศมี 5km เรียบร้อยแล้ว');
      
      const newPostId = `post-${Date.now()}`;
      // Add new post to My Posts tab
      const newPost: Post = {
        id: newPostId,
        project: postForm.project,
        radius: '5km',
        price: postForm.price,
        status: 'searching',
        applicants: [],
        selectedAgentId: null,
        agentsNearbyCount: 14,
        canExpand: false,
        expanded: false
      };
      
      setMyMockPosts(prev => [newPost, ...prev]);
      setPostForm({ project: '', date: '', details: '', price: '', location: '' });
      setActiveTab('myposts'); 

      // Automatically expand search radius to 10km after 5 seconds if still searching and no applicants
      setTimeout(() => {
        handleExpandRadius(newPostId);
      }, 5000);

    }, 1500);
  };

  const handleApproveAgent = (postId: string, agentId: string) => {
    let postProject = '';
    let applicantName = '';
    
    setMyMockPosts(posts => posts.map(post => {
      if (post.id === postId) {
        postProject = post.project;
        const applicant = post.applicants.find(a => a.id === agentId);
        if (applicant) {
          applicantName = applicant.name;
        }
        return { ...post, status: 'matched', selectedAgentId: agentId };
      }
      return post;
    }));

    // Add in-app notification
    addNotification({
      type: 'success',
      title: '✅ จับคู่ดีล Co-Agent สำเร็จ!',
      message: `คุณได้อนุมัติให้ ${applicantName || 'เอเจนต์'} รับงานร่วมดีล ${postProject || 'โครงการ'} เรียบร้อยแล้ว ขณะนี้สามารถเปิดห้องแชทได้แล้ว`,
      action: {
        label: 'เปิดดูดีล',
        url: '/liff/agent/deals'
      }
    });

    showToast('✅ จับคู่สำเร็จ! สร้างห้องแชทสำหรับติดต่อเรียบร้อยแล้ว');
  };

  const handleChatClick = (name: string) => {
    showToast(`กำลังเปิดห้องแชทกับ ${name}...`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium text-sm border border-gray-700 whitespace-nowrap">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            {toastMessage}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="w-full">
            <h2 className="text-base sm:text-lg font-black text-gray-900">ระบบจับคู่ทำงานร่วมกับเอเจนต์ (Co-Agent & Agent Matching)</h2>
            <p className="text-xs text-gray-500 mt-1">รับงานเฉพาะกิจจากเอเจนต์หลัก หรือลงชื่อรับสิทธิ์ปล่อยเช่าจากเจ้าของห้องโดยตรง</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 bg-gray-100 p-1 rounded-xl gap-1 w-full">
            <button 
              onClick={() => setActiveTab('find')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors text-center ${activeTab === 'find' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              รับงาน Co-Agent
            </button>
            <button 
              onClick={() => setActiveTab('owner_jobs')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors text-center ${activeTab === 'owner_jobs' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              รับงาน Agent Matching
            </button>
            <button 
              onClick={() => setActiveTab('post')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors text-center ${activeTab === 'post' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ส่งงาน Co-Agent
            </button>
            <button 
              onClick={() => setActiveTab('myposts')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors text-center ${activeTab === 'myposts' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              งานที่ฉันโพสต์
            </button>
            <button 
              onClick={() => setActiveTab('zones')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-center col-span-2 sm:col-span-1 ${activeTab === 'zones' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Settings className="w-3.5 h-3.5" /> โซนทำการ
            </button>
          </div>
        </div>

        {activeTab === 'find' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-green-100 flex-1">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                ระบบกำลังค้นหางาน Co-Agent ในพื้นที่ที่คุณสนใจ
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาหรือปักหมุดทำเล..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                />
              </div>
            </div>

            {findJobs
              .filter(job => 
                job.project.toLowerCase().includes(searchQuery.toLowerCase()) || 
                job.details.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(job => (
                <div key={job.id} className={`p-4 border ${interestedJobs[job.id] ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'} transition-all rounded-xl flex flex-col sm:flex-row justify-between gap-4 group relative overflow-hidden`}>
                  {!interestedJobs[job.id] && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                  <div className="pl-1.5 opacity-100 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-100">{job.urgency}</span>
                      <span className="text-xs text-gray-400">โพสต์โดย {job.poster} • {job.timeAgo}</span>
                    </div>
                    <h3 className={`font-black text-base ${interestedJobs[job.id] ? 'text-gray-600' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>{job.project}</h3>
                    <p className="text-gray-500 mt-0.5 mb-2.5 text-xs">{job.details}</p>
                    <div className="flex flex-wrap gap-2.5 text-[10.5px] mb-1">
                      <span className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3.5 h-3.5" /> {job.distance}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5" /> {job.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col justify-between sm:justify-end gap-2 sm:min-w-[130px] shrink-0 items-start sm:items-end">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-gray-400 font-medium">ส่วนแบ่งของคุณ (Co-Agent)</div>
                      <div className={`text-sm sm:text-base font-black ${interestedJobs[job.id] ? 'text-gray-500' : 'text-blue-600'}`}>{job.comShare}</div>
                      <div className="text-[9px] text-gray-450 font-medium">🔒 แสดงเฉพาะส่วนของคุณ</div>
                    </div>
                    {interestedJobs[job.id] ? (
                      <button disabled className="px-3 py-2 bg-gray-200 text-gray-500 rounded-lg text-xs font-bold shadow-inner cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto">
                        <Clock className="w-3.5 h-3.5" /> รอการตอบรับ
                      </button>
                    ) : (
                      <button onClick={() => handleInterest(job.id)} className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 w-full sm:w-auto text-center">
                        สนใจรับงานนี้
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'owner_jobs' && (
          <div className="space-y-4 font-sans">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-blue-100 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>
              รายการห้องพักจากเจ้าของที่เปิดรับนายหน้าช่วยปล่อยเช่า
            </div>

            {ownerListings.map(listing => (
              <div key={listing.id} className={`p-4 border ${listing.status === 'matched' ? 'border-green-200 bg-green-50/10' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'} transition-all rounded-xl flex flex-col sm:flex-row justify-between gap-4 relative overflow-hidden`}>
                {listing.status === 'matched' ? (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                ) : (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                )}
                
                <div className="pl-1.5 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">
                      เจ้าของโพสต์หาเอเจนต์
                    </span>
                    <span className="text-xs text-gray-400">โพสต์โดย {listing.ownerName}</span>
                  </div>
                  <h3 className="font-black text-base text-gray-900">{listing.project}</h3>
                  <p className="text-gray-500 mt-0.5 mb-2.5 text-xs">{listing.details}</p>
                  
                  <div className="flex flex-wrap gap-2.5 text-[10.5px] mb-1">
                    <span className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                      <MapPin className="w-3 h-3" /> {listing.location} (ห่างออกไป {listing.distance})
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">
                      <Radar className="w-3 h-3" /> มีเอเจนต์ใกล้เคียง {listing.agentsNearbyCount} คน
                    </span>
                  </div>

                  {listing.status === 'matched' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 mt-3 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-black text-green-800">
                        <CheckCircle2 className="w-4 h-4 text-green-600 animate-bounce" />
                        <span>จับคู่สำเร็จแล้ว! สิทธิ์ของสัญญาแต่งตั้งตัวแทนแบบเปิดมีผลบังคับใช้</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-green-150 border-dashed">
                        <div>
                          <span className="text-gray-500 font-medium block">รหัสประตูดิจิทัล (Door Code):</span>
                          <span className="font-black text-green-950 text-sm font-mono">{listing.doorCode}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 font-medium block">จุดรับฝากกุญแจ (Key):</span>
                          <span className="font-black text-green-950 text-sm">{listing.keyLocation}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col justify-between sm:justify-end gap-2 sm:min-w-[130px] shrink-0 items-start sm:items-end">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-gray-400 font-medium">ค่าคอมมิชชัน</div>
                    <div className="text-sm sm:text-base font-black text-blue-600">{listing.commission}</div>
                  </div>
                  
                  {listing.status === 'matched' ? (
                    <button 
                      onClick={() => handleChatClick(listing.ownerName)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5 w-full sm:w-auto justify-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> แชทกับเจ้าของห้อง
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStartAuthSign(listing)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm w-full sm:w-auto text-center"
                    >
                      ลงนามรับงาน (Sign & Match)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'post' && (
          <div className="space-y-4 font-sans">
            {/* Load Recent Jobs Template Buttons */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-2">
              <span className="text-xs font-bold text-blue-900 block mb-2">งานล่าสุดที่เคยโพสต์ (คลิกเพื่อดึงข้อมูลเก่า):</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadTemplate('xt')}
                  className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-lg transition-all shadow-xs"
                >
                  🏢 XT Phayathai
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate('noble')}
                  className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-lg transition-all shadow-xs"
                >
                  🏢 Noble Play
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadTemplate('life')}
                  className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-lg transition-all shadow-xs"
                >
                  🏢 Life One Wireless
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">โครงการ / สถานที่</label>
                <input 
                  type="text" 
                  value={postForm.project}
                  onChange={(e) => setPostForm({...postForm, project: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                  placeholder="เช่น คอนโด XT Phayathai" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">เวลานัดหมาย</label>
                <input 
                  type="datetime-local" 
                  value={postForm.date}
                  onChange={(e) => setPostForm({...postForm, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดงาน</label>
              <textarea 
                rows={3} 
                value={postForm.details}
                onChange={(e) => setPostForm({...postForm, details: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                placeholder="บอกสิ่งที่ต้องทำ เช่น กุญแจอยู่ที่ไหน..."
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">ค้นหาทำเล / ปักหมุดแผนที่ (ค้นหา Co-Agent ใกล้เคียง)</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={postForm.location}
                    onChange={(e) => setPostForm({...postForm, location: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                    placeholder="พิมพ์ชื่อทำเล หรือลากปักหมุดบนแผนที่..." 
                  />
                  <button 
                    onClick={() => setIsMapOpen(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    เปิดแผนที่
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 my-2">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                สัดส่วนค่าคอมมิชชันของคุณ (ความเป็นส่วนตัวสำหรับตัวแทน)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200 text-center shadow-sm">
                  <div className="text-xs text-gray-500 font-medium">ส่วนแบ่งของคุณ (Agent หลัก)</div>
                  <div className="text-xl font-black text-blue-600 mt-0.5">70%</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-gray-200 text-center shadow-inner flex items-center justify-center">
                  <span className="text-xs text-gray-400 font-bold">🔒 ซ่อนสัดส่วน Co-Agent เพื่อความเป็นส่วนตัว</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">ระบบจะคำนวณและกระจายส่วนแบ่งให้แต่ละฝ่ายโดยอิสระ</p>
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100">
              <button 
                onClick={handlePostSubmit}
                disabled={isPosting}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'โพสต์และแจ้งเตือน Co-Agent ทันที'}
              </button>
              <p className="text-xs text-gray-500 mt-2 font-medium">ระบบจะแจ้งเตือน Co-Agent ในพื้นที่ที่คุณปักหมุด และจะขยายวงค้นหาให้อัตโนมัติ</p>
            </div>
          </div>
        )}

        {activeTab === 'myposts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {myMockPosts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>คุณยังไม่มีงานที่โพสต์</p>
              </div>
            ) : (
              myMockPosts.map(post => (
                <div key={post.id} className={`bg-white rounded-xl shadow-sm border ${post.status === 'matched' ? 'border-green-200' : 'border-gray-200'} p-5 transition-all`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b border-gray-100 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {post.status === 'searching' ? (
                          <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            กำลังค้นหาตัวแทน
                          </span>
                        ) : (
                          <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-green-100 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" />
                            จับคู่สำเร็จแล้ว
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{post.project}</h3>
                      <p className="text-gray-500 text-sm font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" /> รัศมีค้นหาปัจจุบัน: {post.radius} 
                        {post.status === 'searching' && <span className="ml-2 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs font-bold">มีเอเจนต์อยู่บริเวณนี้ {post.agentsNearbyCount} คน</span>}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs text-gray-500 font-medium">ค่าตอบแทนที่ตั้งไว้</div>
                      <div className="text-xl font-black text-gray-900">฿{post.price}</div>
                    </div>
                  </div>

                  {post.status === 'searching' && post.applicants.length > 0 && (
                    <>
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-600" /> เอเจนต์ที่สนใจรับงานนี้ ({post.applicants.length} คน)
                      </h4>
                      <div className="space-y-3">
                        {post.applicants.map(applicant => (
                          <div key={applicant.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white hover:border-blue-200 transition-colors gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold shrink-0">{applicant.initial}</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-gray-900">{applicant.name}</h5>
                                  <ShieldCheck className="w-4 h-4 text-green-500" />
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1 font-medium">
                                  <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-3 h-3 fill-amber-500" /> {applicant.rating} ({applicant.reviews} รีวิว)</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> ห่างออกไป {applicant.distance}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button 
                                onClick={() => handleChatClick(applicant.name)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                              >
                                <MessageCircle className="w-4 h-4" /> ทักแชท
                              </button>
                              <button 
                                onClick={() => handleApproveAgent(post.id, applicant.id)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                              >
                                อนุมัติให้รับงาน
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {post.status === 'searching' && post.applicants.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Radar className="w-5 h-5 text-blue-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
                      </div>
                      <p className="text-gray-600 font-bold mb-1">ระบบกำลังกระจายงานและรอเอเจนต์ตอบรับ...</p>
                      <p className="text-gray-400 text-sm font-medium mb-4">แจ้งเตือนไปยังเอเจนต์ {post.agentsNearbyCount} คนในรัศมี {post.radius}</p>
                      
                      {!post.expanded && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50/50 py-2 px-4 rounded-xl border border-amber-100/50">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>ระบบกำลังเตรียมขยายรัศมีค้นหาเป็น 10km อัตโนมัติใน 5 วินาที</span>
                        </div>
                      )}
                      {post.expanded && post.radius === 'กำลังขยายค้นหา...' && (
                        <div className="mt-4 flex justify-center text-blue-600 text-xs font-bold items-center gap-2 bg-blue-50/50 py-2 px-4 rounded-xl border border-blue-100/50">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> กำลังประมวลผลค้นหาและแจ้งเตือนเอเจนต์รอบนอก...
                        </div>
                      )}
                    </div>
                  )}

                  {post.status === 'matched' && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-lg">
                          {post.applicants.find(a => a.id === post.selectedAgentId)?.initial || 'A'}
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-bold mb-0.5">ตัวแทนที่ได้รับเลือก</p>
                          <h5 className="font-bold text-gray-900 text-lg">
                            {post.applicants.find(a => a.id === post.selectedAgentId)?.name}
                          </h5>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleChatClick(post.applicants.find(a => a.id === post.selectedAgentId)?.name || 'Agent')}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors sm:w-auto w-full justify-center"
                      >
                        <MessageSquare className="w-5 h-5" /> เปิดห้องแชทเพื่อพูดคุย
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="mt-2 animate-in fade-in duration-300">
            <WorkingZoneSettings lang={lang} />
          </div>
        )}
      </div>

      {/* Interactive Map Dialog */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="sm:max-w-[640px] p-0 overflow-hidden">
          <DialogHeader className="p-4 bg-white border-b border-gray-100">
            <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              เลือกตำแหน่งสำหรับ Co-Agent
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-gray-50">
            <InteractiveMap
              onLocationSelect={(loc) => setSelectedPin(loc)}
              initialPin={selectedPin}
            />
          </div>
          <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3">
            <DialogClose asChild>
              <button className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg">
                ยกเลิก
              </button>
            </DialogClose>
            <button 
              onClick={() => {
                if (selectedPin) {
                  setPostForm(prev => ({ ...prev, location: selectedPin.name }));
                  setIsMapOpen(false);
                }
              }}
              disabled={!selectedPin}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              ยืนยันตำแหน่งนี้
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Agent Authorization Agreement */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="max-w-[840px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none font-sans">
          <div className="bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <span className="font-black text-gray-900 text-sm">
                ลงนามมอบหมายสิทธิ์นายหน้า (Agent Authorization Sign)
              </span>
              <DialogClose asChild>
                <button className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogClose>
            </div>

            {/* Document body */}
            {authContract && (
              <div className="p-4 sm:p-8 bg-gray-100">
                <div className="bg-white shadow-2xl mx-auto max-w-[794px] p-6 sm:p-12 border border-gray-200 rounded-none relative">
                  <ContractDocument
                    contract={authContract as any}
                    userRole="agent"
                    onChange={(patch) => setAuthContract((prev: any) => ({ ...prev, ...patch }))}
                  />

                  {/* Owner Signature Details */}
                  <div className="mt-8 border-t border-dashed border-gray-200 pt-6 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">ลายมือชื่อผู้มอบอำนาจ (เจ้าของห้อง)</p>
                    <img src={authContract.signatures.owner.signatureDataUrl} alt="Owner Signature" className="max-h-12 mt-2 border border-gray-100 p-1" />
                    <p className="text-[10px] text-gray-400 mt-1">ลงนามโดย {authContract.signatures.owner.name} เมื่อ {new Date(authContract.signatures.owner.signedAt).toLocaleDateString('th-TH')}</p>
                  </div>

                  {/* Agent Signature Area */}
                  {authContract.signatures.agent ? (
                    <div className="mt-6 border-t border-dashed border-gray-200 pt-6 flex flex-col items-center justify-center text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase">ลายมือชื่อผู้รับมอบอำนาจ (นายหน้า)</p>
                      <img src={authContract.signatures.agent.signatureDataUrl} alt="Agent Signature" className="max-h-16 mt-2 border border-gray-100 p-1" />
                    </div>
                  ) : (
                    <div className="mt-8 border-t border-dashed border-gray-200 pt-6 bg-blue-50/50 p-4 rounded-xl">
                      <p className="text-sm font-black text-gray-900 mb-3 text-center">ลงลายมือชื่อผู้รับมอบอำนาจ (นายหน้า) เพื่อยืนยันการรับสิทธิ์</p>
                      <SignaturePad
                        onSigned={(url) => setAuthSignatureDataUrl(url)}
                        onClear={() => setAuthSignatureDataUrl('')}
                        hasSigned={!!authSignatureDataUrl}
                        lang="th"
                      />
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleAuthSignSubmit}
                          disabled={!authSignatureDataUrl}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors shadow-md shadow-blue-500/10"
                        >
                          ยืนยันลายเซ็นร่วมกัน
                        </button>
                        <button
                          onClick={() => setIsAuthModalOpen(false)}
                          className="px-6 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
