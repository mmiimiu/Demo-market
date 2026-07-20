'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Star, MessageSquare, Clock, UserCheck, ShieldCheck, Search, PlusCircle, Settings, Loader2, CheckCircle2, Radar, ArrowRight, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { WorkingZoneSettings } from './WorkingZoneSettings';

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
  const [activeTab, setActiveTab] = useState('find'); // find, post, myposts, zones

  // State for Find Jobs (Tab 1)
  const [interestedJobs, setInterestedJobs] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState('');

  // State for Post Jobs (Tab 2)
  const [isPosting, setIsPosting] = useState(false);
  const [postForm, setPostForm] = useState({ project: '', date: '', details: '', price: '', location: '' });
  
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
    // Set to expanding loading state
    setMyMockPosts(posts => posts.map(post => 
      post.id === postId ? { ...post, expanded: true, radius: 'กำลังค้นหา...' } : post
    ));

    // Simulate expanding and finding new agents
    setTimeout(() => {
      setMyMockPosts(posts => posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            radius: '10km',
            agentsNearbyCount: post.agentsNearbyCount + 24,
            applicants: [
              { id: `new-a1-${Date.now()}`, name: 'Wichai T.', rating: 4.8, reviews: 56, distance: '6.2 km', initial: 'W' },
              { id: `new-a2-${Date.now()}`, name: 'Kanya R.', rating: 5.0, reviews: 12, distance: '8.5 km', initial: 'K' }
            ]
          };
        }
        return post;
      }));
      showToast('ขยายรัศมีเป็น 10km สำเร็จ! พบเอเจนต์ที่สนใจแล้ว');
    }, 1500);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleInterest = (jobId: string) => {
    setInterestedJobs(prev => ({ ...prev, [jobId]: true }));
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

      // Simulate waiting 5 seconds before allowing to expand radius
      setTimeout(() => {
        setMyMockPosts(posts => posts.map(post => 
          post.id === newPostId ? { ...post, canExpand: true } : post
        ));
      }, 5000);

    }, 1500);
  };

  const handleApproveAgent = (postId: string, agentId: string) => {
    setMyMockPosts(posts => posts.map(post => {
      if (post.id === postId) {
        return { ...post, status: 'matched', selectedAgentId: agentId };
      }
      return post;
    }));
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-900">Agent Matching (เปิดรับ Co-Agent)</h2>
            <p className="text-sm text-gray-500 mt-1">รับงาน Co-Agent ในพื้นที่ที่คุณสนใจ หรือหา Co-Agent ไปเปิดห้องแทนคุณ</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('find')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'find' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              รับงาน Co-Agent
            </button>
            <button 
              onClick={() => setActiveTab('post')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'post' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              เปิดรับ Co-Agent
            </button>
            <button 
              onClick={() => setActiveTab('myposts')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'myposts' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              งานที่ฉันโพสต์
            </button>
            <button 
              onClick={() => setActiveTab('zones')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-1 ${activeTab === 'zones' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Settings className="w-4 h-4" /> ตั้งค่าโซนทำการ
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
                  placeholder="ค้นหาหรือปักหมุดทำเล..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className={`p-5 border ${interestedJobs['job-1'] ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'} transition-all rounded-xl flex flex-col sm:flex-row justify-between gap-6 group relative overflow-hidden`}>
              {!interestedJobs['job-1'] && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
              <div className="pl-2 opacity-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-red-100">ด่วนมาก</span>
                  <span className="text-sm text-gray-500">โพสต์โดย เอเจนต์สมชาย • 2 นาทีที่แล้ว</span>
                </div>
                <h3 className={`font-bold text-lg ${interestedJobs['job-1'] ? 'text-gray-600' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>คอนโด XT Phayathai</h3>
                <p className="text-gray-600 mt-1 mb-3 text-sm">ต้องการคนเปิดห้องให้ลูกค้าดู (มีกุญแจฝากที่นิติ)</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">
                    <MapPin className="w-4 h-4" /> 1.2 km
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                    <Clock className="w-4 h-4" /> วันนี้ 14:00 น.
                  </span>
                </div>
              </div>
              <div className="flex sm:flex-col justify-end gap-3 sm:min-w-[140px] shrink-0">
                <div className="text-left sm:text-right flex-1 sm:flex-none">
                  <div className="text-xs text-gray-500 font-medium">ส่วนแบ่ง Co-Agent</div>
                  <div className={`text-2xl font-black ${interestedJobs['job-1'] ? 'text-gray-500' : 'text-blue-600'}`}>10%</div>
                  <div className="text-[10px] text-gray-400 font-medium">หักจากคอมมิชชัน Owner</div>
                </div>
                {interestedJobs['job-1'] ? (
                  <button disabled className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-200 text-gray-500 rounded-lg text-sm font-bold shadow-inner cursor-not-allowed flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" /> รอการตอบรับ
                  </button>
                ) : (
                  <button onClick={() => handleInterest('job-1')} className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95">
                    สนใจรับงานนี้
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'post' && (
          <div className="space-y-4">
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
                สัดส่วนค่าคอมมิชชันมาตรฐาน (ระบบจัดสรรให้อัตโนมัติ)
              </h4>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-white rounded-lg p-3 border border-blue-100 text-center shadow-sm">
                  <div className="text-xs text-gray-500 font-medium">Agent หลัก (คุณ)</div>
                  <div className="text-lg font-black text-blue-600 mt-0.5">70%</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-100 text-center shadow-sm">
                  <div className="text-xs text-gray-500 font-medium">Co-Agent</div>
                  <div className="text-lg font-black text-amber-600 mt-0.5">10%</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100 text-center shadow-sm">
                  <div className="text-xs text-gray-500 font-medium">Platform</div>
                  <div className="text-lg font-black text-gray-600 mt-0.5">20%</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">หักจ่ายตามสัดส่วนจากรายได้ฝั่ง Owner เมื่อจบงาน</p>
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
                      
                      {post.canExpand && !post.expanded && (
                         <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-2">
                           <p className="text-sm text-gray-500 mb-2 font-medium">รอนานแล้วยังไม่มีคนรับงาน?</p>
                           <button 
                             onClick={() => handleExpandRadius(post.id)}
                             className="inline-flex items-center gap-2 px-5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-full font-bold text-sm transition-colors"
                           >
                             <PlusCircle className="w-4 h-4" />
                             ขยายระยะค้นหาเป็น 10km อัตโนมัติ
                           </button>
                         </div>
                      )}
                      {post.expanded && post.radius === 'กำลังค้นหา...' && (
                        <div className="mt-4 flex justify-center text-blue-600 text-sm font-bold items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> กำลังประมวลผลค้นหาและแจ้งเตือนเอเจนต์รอบนอก...
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
    </div>
  );
}
