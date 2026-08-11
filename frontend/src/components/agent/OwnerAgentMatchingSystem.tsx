'use client';

import React, { useState } from 'react';
import { MapPin, Star, MessageSquare, ShieldCheck, Search, Loader2, CheckCircle2, Radar, ArrowRight, Building2, Key, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ContractDocument } from '../contract/ContractSystem/ContractDocument';
import { SignaturePad } from '../shared/ContractManager/SignaturePad';


interface Applicant {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  initial: string;
  isApproved?: boolean;
}

interface Post {
  id: string;
  project: string;
  details: string;
  commission: string;
  status: 'searching' | 'closed';
  applicants: Applicant[];
  agentsNearbyCount: number;
}

export function OwnerAgentMatchingSystem({ lang = 'th' }: { lang?: 'th' | 'en' | 'cn' }) {
  const [activeTab, setActiveTab] = useState('post'); // post, myposts
  const [toastMessage, setToastMessage] = useState('');

  // State for Post Form (Pre-filled for easy testing)
  const [isPosting, setIsPosting] = useState(false);
  const [postForm, setPostForm] = useState({ 
    project: 'คอนโด Life Asoke Hype (1 ห้องนอน 35 ตร.ม.)', 
    location: 'พระราม 9, อโศก', 
    details: 'กุญแจฝากไว้ที่นิติบุคคล, รหัสห้องคือ 8894, ห้ามเลี้ยงสัตว์', 
    commission: '1 เดือน (สำหรับสัญญา 1 ปี)' 
  });

  // States for Agent Authorization Document & Signatures
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSignatureDataUrl, setAuthSignatureDataUrl] = useState('');
  const [authContract, setAuthContract] = useState({
    id: 'cnt-auth-001',
    propertyName: 'แบบร่างหนังสือแต่งตั้งและมอบอำนาจตัวแทนเอเจ้นท์ (Agent Power of Attorney Draft)',
    propertyAddress: 'พระราม 9, อโศก',
    zone: 'โซนทั่วไป',
    unitNo: 'ห้องใหม่',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentAmount: 0,
    deposit: 0,
    ownerName: 'คุณ (เจ้าของห้อง)',
    tenantName: '-',
    agentName: 'คุณสมชาย (นายหน้าแต่งตั้งประจำแพลตฟอร์ม)',
    hasAgent: true,
    status: 'pending_signatures' as const,
    signatures: {} as Record<string, { signatureDataUrl: string; name: string; signedAt: string }>
  });

  const handleAuthSignSubmit = () => {
    if (!authSignatureDataUrl) return;
    setAuthContract(prev => ({
      ...prev,
      signatures: {
        ...prev.signatures,
        owner: {
          signatureDataUrl: authSignatureDataUrl,
          name: 'คุณ (เจ้าของห้อง)',
          signedAt: new Date().toISOString()
        }
      }
    }));
    showToast('✍️ ลงนามมอบอำนาจตัวแทนล่วงหน้าสำเร็จแล้ว');
    setIsAuthModalOpen(false);
  };

  // State for My Posts
  const [myMockPosts, setMyMockPosts] = useState<Post[]>([
    {
      id: 'post-1',
      project: 'คอนโด Life Asoke Hype (1 ห้องนอน 35 ตร.ม.)',
      details: 'กุญแจฝากไว้ที่นิติบุคคล สามารถพาลูกค้าไปดูได้เลยค่ะ',
      commission: '1 เดือน',
      status: 'searching', 
      applicants: [
        { id: 'a1', name: 'Natthapong P.', rating: 4.9, reviews: 120, distance: '2.1 km', initial: 'N', isApproved: true },
        { id: 'a2', name: 'Sompong K.', rating: 4.5, reviews: 34, distance: '3.5 km', initial: 'S', isApproved: true }
      ],
      agentsNearbyCount: 28
    }
  ]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleChatClick = (agentName: string) => {
    showToast(`เปิดห้องแชทกับ ${agentName} แล้ว (1:1)`);
  };

  const handlePostSubmit = () => {
    if (!postForm.project || !postForm.commission) {
      showToast('กรุณากรอกข้อมูลชื่อโครงการ และค่าคอมมิชชัน');
      return;
    }
    
    setIsPosting(true);
    // Simulate network delay
    setTimeout(() => {
      setIsPosting(false);
      showToast('กระจายข้อมูลไปยังเอเจนต์ในระบบเรียบร้อยแล้ว!');
      
      const newPostId = `post-${Date.now()}`;
      // Add new post
      const newPost: Post = {
        id: newPostId,
        project: postForm.project,
        details: postForm.details,
        commission: postForm.commission,
        status: 'searching',
        applicants: [],
        agentsNearbyCount: 45
      };
      
      setMyMockPosts(prev => [newPost, ...prev]);
      setPostForm({ project: '', location: '', details: '', commission: '' });
      setActiveTab('myposts'); 

      // Simulate agents applying after a short delay
      setTimeout(() => {
        setMyMockPosts(posts => posts.map(post => {
          if (post.id === newPostId) {
            return {
              ...post,
              applicants: [
                { id: `new-a1-${Date.now()}`, name: 'Wichai T.', rating: 4.8, reviews: 56, distance: '5.2 km', initial: 'W', isApproved: true }
              ]
            };
          }
          return post;
        }));
      }, 4000);

    }, 1500);
  };

  const handleCloseListing = (postId: string) => {
    setMyMockPosts(posts => posts.map(post => {
      if (post.id === postId) {
        return { ...post, status: 'closed' };
      }
      return post;
    }));
    showToast('ปิดการค้นหาเรียบร้อยแล้ว');
  };

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
            <h2 className="text-xl font-black text-blue-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              เปิดรับนายหน้า (Owner Matching)
            </h2>
            <p className="text-sm text-gray-500 mt-1">เปิดรับนายหน้าและตัวแทน (Open Listing) ให้ทุกคนช่วยกันทำการตลาดให้คุณ</p>
          </div>
          <div className="flex bg-blue-50 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('post')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'post' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100/50'}`}
            >
              โพสต์หาเอเจนต์
            </button>
            <button 
              onClick={() => setActiveTab('myposts')}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'myposts' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100/50'}`}
            >
              ประกาศของฉัน
            </button>
          </div>
        </div>

        {activeTab === 'post' && (
          <div className="space-y-4">
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-4">
              <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2 mb-1">
                <Radar className="w-4 h-4 text-blue-600" /> ทำไมถึงควรโพสต์ที่นี่?
              </h3>
              <p className="text-sm text-blue-700/80">ระบบจะช่วยกระจายประกาศของคุณไปยังเอเจนต์ในเครือข่ายของเรา เอเจนต์ที่สนใจจะติดต่อคุณเพื่อรับข้อมูลไปทำการตลาดให้ทันที</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อโครงการ / คอนโด / หมู่บ้าน</label>
                <input 
                  type="text" 
                  value={postForm.project}
                  onChange={(e) => setPostForm({...postForm, project: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                  placeholder="เช่น คอนโด Life Asoke Hype (1 ห้องนอน 35 ตร.ม.)" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ย่านที่ตั้ง</label>
                <input 
                  type="text" 
                  value={postForm.location}
                  onChange={(e) => setPostForm({...postForm, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                  placeholder="เช่น พระราม 9, อโศก" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ค่าคอมมิชชันที่ให้เอเจนต์</label>
                <input 
                  type="text" 
                  value={postForm.commission}
                  onChange={(e) => setPostForm({...postForm, commission: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                  placeholder="เช่น 1 เดือน (สำหรับสัญญา 1 ปี)" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดเพิ่มเติม (การรับกุญแจ/การพาดูห้อง)</label>
                <textarea 
                  rows={3} 
                  value={postForm.details}
                  onChange={(e) => setPostForm({...postForm, details: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" 
                  placeholder="เช่น กุญแจฝากไว้ที่นิติบุคคล, รหัสห้องคือ XXXX, ห้ามเลี้ยงสัตว์..."
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">แนบเอกสารร่างสัญญาและเซ็นมอบหมายสิทธิ์ล่วงหน้า (เพื่อให้เอเจนต์เซ็นรับงานได้ทันที)</label>
                <div 
                  onClick={() => setIsAuthModalOpen(true)}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                    authContract.signatures.owner 
                      ? 'border-green-300 bg-green-50/30 hover:bg-green-50/50' 
                      : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/50'
                  }`}
                >
                  <Building2 className={`w-10 h-10 mb-2 ${authContract.signatures.owner ? 'text-green-600' : 'text-blue-500'}`} />
                  <p className={`text-sm font-bold ${authContract.signatures.owner ? 'text-green-900' : 'text-blue-900'}`}>
                    สัญญาแต่งตั้งตัวแทนแบบเปิด_signed_template.pdf {authContract.signatures.owner && '✅'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {authContract.signatures.owner 
                      ? 'ลงนามมอบหมายสิทธิ์ล่วงหน้าสำเร็จแล้ว • เอเจนต์เข้าเซ็นรับงานได้ทันที' 
                      : 'คลิกเพื่อเปิดดูเอกสารร่างและลงลายมือชื่อมอบหมายสิทธิ์ล่วงหน้า'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center gap-4">
              <button 
                onClick={handlePostSubmit}
                disabled={isPosting}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-sm shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'โพสต์และกระจายหาเอเจนต์'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'myposts' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {myMockPosts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <p>คุณยังไม่มีประกาศ</p>
              </div>
            ) : (
              myMockPosts.map(post => (
                <div key={post.id} className={`bg-white rounded-xl shadow-sm border ${post.status === 'closed' ? 'border-gray-200 opacity-60' : 'border-blue-100'} p-5 transition-all`}>
                  <div className="flex flex-col sm:flex-row justify-between mb-4 pb-4 border-b border-gray-100 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {post.status === 'searching' ? (
                          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            เปิดรับนายหน้าแบบมอบสิทธิ์ล่วงหน้าสำเร็จ
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-gray-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" />
                            ปิดรับแล้ว
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{post.project}</h3>
                      <p className="text-gray-600 mt-1 text-sm"><Key className="w-3.5 h-3.5 inline mr-1" /> {post.details}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-xs text-gray-500 font-medium">ค่าคอมมิชชัน</div>
                      <div className="text-xl font-black text-blue-700">{post.commission}</div>
                    </div>
                  </div>

                  {post.status === 'searching' && (
                    <>
                      <div className="flex items-center justify-between mb-3 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            มีนายหน้านำทรัพย์นี้ไปรีโพสต์แล้ว {post.id === 'post-1' ? '55' : post.applicants.length} คน (เห็นเฉพาะคุณ)
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">ระบบอนุมัติสิทธิ์และจับคู่ 1:1 กับลูกค้าให้โดยอัตโนมัติเมื่อเอเจนต์ลงนาม</p>
                        </div>
                        <button 
                          onClick={() => handleCloseListing(post.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 underline shrink-0"
                        >
                          ปิดประกาศ (ได้ผู้เช่าแล้ว)
                        </button>
                      </div>

                      <div className="space-y-3">
                        {post.applicants.map(applicant => (
                          <div key={applicant.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg transition-colors gap-4 bg-green-50/30 border-green-200">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 bg-green-100 text-green-700">
                                {applicant.initial}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-gray-900">{applicant.name}</h5>
                                  <ShieldCheck className="w-4 h-4 text-green-500" />
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">เซ็นสัญญาและได้รับสิทธิ์อัตโนมัติแล้ว (1:1)</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1 font-medium">
                                  <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-3 h-3 fill-amber-500" /> {applicant.rating} ({applicant.reviews} รีวิว)</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button 
                                onClick={() => handleChatClick(applicant.name)}
                                className="flex-1 sm:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" /> แชทคุยกับนายหน้า (1:1)
                              </button>
                            </div>
                          </div>
                        ))}

                        {post.applicants.length === 0 && (
                          <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Radar className="w-5 h-5 text-blue-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
                            </div>
                            <p className="text-gray-600 font-bold mb-1">ระบบกำลังกระจายข้อมูลให้เอเจนต์...</p>
                            <p className="text-gray-400 text-sm font-medium">แจ้งเตือนไปยังเอเจนต์ {post.agentsNearbyCount} คน ในเครือข่ายของเรา</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dialog for Agent Authorization Agreement */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="max-w-[840px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none font-sans">
          <div className="bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <span className="font-black text-gray-900 text-sm">
                ลงนามมอบหมายสิทธิ์ล่วงหน้า (Agent Power of Attorney)
              </span>
              <DialogClose asChild>
                <button className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogClose>
            </div>

            {/* Document body */}
            <div className="p-4 sm:p-8 bg-gray-100">
              <div className="bg-white shadow-2xl mx-auto max-w-[794px] p-6 sm:p-12 border border-gray-200 rounded-none relative">
                <ContractDocument
                  contract={authContract as any}
                  userRole="owner"
                  onChange={(patch) => setAuthContract(prev => ({ ...prev, ...patch }))}
                />

                {authContract.signatures.owner ? (
                  <div className="mt-8 border-t border-dashed border-gray-200 pt-6 flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">ลายมือชื่อผู้มอบอำนาจ (เจ้าของห้อง)</p>
                    <img src={authContract.signatures.owner.signatureDataUrl} alt="Owner Signature" className="max-h-16 mt-2 border border-gray-100 p-1" />
                    <p className="text-xs text-gray-400 mt-2">ลงนามโดย {authContract.signatures.owner.name} เมื่อ {new Date(authContract.signatures.owner.signedAt).toLocaleDateString('th-TH')}</p>
                  </div>
                ) : (
                  <div className="mt-8 border-t border-dashed border-gray-200 pt-6 bg-blue-50/50 p-4 rounded-xl">
                    <p className="text-sm font-black text-gray-900 mb-3 text-center">ลงลายมือชื่อผู้มอบอำนาจ (เจ้าของห้อง) เพื่อมอบสิทธิ์ล่วงหน้า</p>
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
                        ยืนยันลายเซ็น
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
