'use client';

/**
 * @fileOverview Community Q&A Board Component
 *
 * Module 16: Community Hub
 * - กระดานถาม-ตอบชุมชน จัดหมวดหมู่ตามย่าน / ประเภทห้อง
 * - Vote คำตอบที่มีประโยชน์
 * - รีวิวได้เฉพาะผู้ที่มี transaction จริง (verified)
 * - Report กระทู้/รีวิวไม่เหมาะสม
 */

import { useState, useCallback } from 'react';

/* ─────────────────────── Types ─────────────────────── */
interface Author {
  id: string;
  name: string;
  avatar: string;
  role: 'tenant' | 'owner' | 'agent';
  verified: boolean;
  transactionVerified?: boolean; // เฉพาะคนที่เช่าจริง
}

interface Answer {
  id: string;
  author: Author;
  content: string;
  votes: number;
  userVoted: boolean;
  createdAt: string;
  isAccepted: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  zone: string;
  author: Author;
  answers: Answer[];
  views: number;
  createdAt: string;
  tags: string[];
  reported: boolean;
}

type ViewMode = 'list' | 'detail' | 'new';
type Category = 'all' | 'ทำเล' | 'ราคา' | 'สิ่งอำนวยความสะดวก' | 'กฎหมาย' | 'ผู้เช่า' | 'คำแนะนำ';

/* ─────────────────────── Mock Data ─────────────────────── */
const MOCK_POSTS: Post[] = [
  {
    id: 'p001',
    title: 'ย่านอ่อนนุช vs บางนา ค่าเช่าต่างกันมากไหม?',
    content: 'กำลังมองหาคอนโด 1 ห้องนอน ราคาไม่เกิน 12,000 บาท/เดือน ย่านไหนดีกว่ากันครับ ทั้งในแง่ราคา การเดินทาง และความปลอดภัย',
    category: 'ทำเล',
    zone: 'สุขุมวิท',
    author: { id: 'u001', name: 'สมชาย ม.', avatar: '😊', role: 'tenant', verified: true, transactionVerified: false },
    views: 342,
    createdAt: '2026-06-16',
    tags: ['อ่อนนุช', 'บางนา', 'คอนโด', 'BTS'],
    reported: false,
    answers: [
      {
        id: 'a001', votes: 24, userVoted: false, isAccepted: true, createdAt: '2026-06-16',
        author: { id: 'u004', name: 'Agent วรรณา', avatar: '💼', role: 'agent', verified: true, transactionVerified: true },
        content: 'จากประสบการณ์ตรง อ่อนนุชแถว Sukhumvit 77 คอนโดเก่าหน่อยราคา 8,000-11,000 บาท บางนาฝั่ง Unixx ราคา 9,500-13,000 บาท แต่ห้องใหม่กว่า BTS ทั้งคู่เดินทางสะดวก แนะนำดูที่ตำแหน่งออฟฟิศก่อนครับ',
      },
      {
        id: 'a002', votes: 8, userVoted: false, isAccepted: false, createdAt: '2026-06-17',
        author: { id: 'u002', name: 'นิรันดร์ เจ้าของ', avatar: '🏠', role: 'owner', verified: true, transactionVerified: true },
        content: 'มีห้องย่านบางนาปล่อยเช่า 11,500 ครับ ห้องใหม่ปี 65 ถ้าสนใจ DM มาได้เลย',
      },
    ],
  },
  {
    id: 'p002',
    title: 'เงินประกันคืน 30 วัน หรือ 45 วัน? กฎหมายระบุอย่างไร',
    content: 'เจ้าของห้องบอกขอเวลา 45 วันในการคืนเงินประกัน แต่ผมเข้าใจว่ากฎหมายระบุ 30 วัน ใครทราบบ้างครับ',
    category: 'กฎหมาย',
    zone: 'ทั่วประเทศ',
    author: { id: 'u005', name: 'อานนท์ ด.', avatar: '🤔', role: 'tenant', verified: true, transactionVerified: true },
    views: 891,
    createdAt: '2026-06-14',
    tags: ['เงินประกัน', 'กฎหมาย', 'สิทธิผู้เช่า'],
    reported: false,
    answers: [
      {
        id: 'a003', votes: 67, userVoted: false, isAccepted: true, createdAt: '2026-06-14',
        author: { id: 'u007', name: 'ทนายชาติ ก.', avatar: '⚖️', role: 'owner', verified: true, transactionVerified: false },
        content: 'ตามกฎหมายไทย พ.ร.บ. คุ้มครองผู้บริโภค เจ้าของห้องต้องคืนเงินประกันภายใน 30 วันหลังออกห้อง หากไม่คืนตามกำหนดมีสิทธิ์ฟ้องร้องได้ครับ แต่ถ้าทำสัญญาระบุ 45 วัน ก็ถือว่าตกลงกันแล้ว',
      },
    ],
  },
  {
    id: 'p003',
    title: 'รีวิว The Base Sukhumvit 77 — เช่าอยู่จริง 2 ปี',
    content: 'ขอแชร์ประสบการณ์เช่าอยู่จริง 2 ปีครับ ข้อดี-ข้อเสียทุกอย่าง ไม่มีโฆษณา...',
    category: 'คำแนะนำ',
    zone: 'อ่อนนุช',
    author: { id: 'u008', name: 'ผู้เช่าจริง K.', avatar: '⭐', role: 'tenant', verified: true, transactionVerified: true },
    views: 1240,
    createdAt: '2026-06-10',
    tags: ['รีวิว', 'The Base', 'สุขุมวิท 77', 'อ่อนนุช'],
    reported: false,
    answers: [
      {
        id: 'a004', votes: 12, userVoted: false, isAccepted: false, createdAt: '2026-06-11',
        author: { id: 'u009', name: 'ผู้สนใจ T.', avatar: '😮', role: 'tenant', verified: false, transactionVerified: false },
        content: 'ขอบคุณสำหรับรีวิวครับ อยากรู้เรื่องนิติบุคคลว่าจัดการปัญหาได้ดีไหม?',
      },
    ],
  },
];

/* ─────────────────────── Helper ─────────────────────── */
const CATEGORIES: Category[] = ['all', 'ทำเล', 'ราคา', 'สิ่งอำนวยความสะดวก', 'กฎหมาย', 'ผู้เช่า', 'คำแนะนำ'];

const roleColors: Record<string, { bg: string; color: string }> = {
  tenant: { bg: '#dbeafe', color: '#1e40af' },
  owner:  { bg: '#d1fae5', color: '#065f46' },
  agent:  { bg: '#f3e8ff', color: '#6b21a8' },
};

/* ─────────────────────── Post Card ─────────────────────── */
function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.2s',
        border: '1px solid #f3f4f6',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 32, flexShrink: 0 }}>{post.author.avatar}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ ...roleColors[post.author.role], padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
              {post.author.role}
            </span>
            <span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
              📍 {post.zone}
            </span>
            <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
              {post.category}
            </span>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{post.title}</h3>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.content}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {post.tags.map((t) => (
          <span key={t} style={{ background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>#{t}</span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#9ca3af' }}>
        <span>👤 {post.author.name}</span>
        <span>💬 {post.answers.length} คำตอบ</span>
        <span>👁️ {post.views.toLocaleString()} ครั้ง</span>
        <span style={{ marginLeft: 'auto' }}>🗓 {post.createdAt}</span>
      </div>
    </div>
  );
}

/* ─────────────────────── Post Detail ─────────────────────── */
function PostDetail({ post, onBack }: { post: Post; onBack: () => void }) {
  const [answers, setAnswers] = useState(post.answers);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = (answerId: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId ? { ...a, votes: a.userVoted ? a.votes - 1 : a.votes + 1, userVoted: !a.userVoted } : a
      )
    );
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const ans: Answer = {
      id: `a_${Date.now()}`,
      author: { id: 'me', name: 'คุณ (ผู้ใช้ปัจจุบัน)', avatar: '😊', role: 'tenant', verified: true },
      content: newAnswer,
      votes: 0,
      userVoted: false,
      isAccepted: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAnswers((prev) => [...prev, ans]);
    setNewAnswer('');
    setIsSubmitting(false);
  };

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← กลับไปกระดาน
      </button>

      <div style={{ background: '#fff', borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ ...roleColors[post.author.role], padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{post.author.role}</span>
          <span style={{ background: '#ede9fe', color: '#6d28d9', padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{post.category}</span>
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 800, color: '#111827' }}>{post.title}</h2>
        <p style={{ margin: '0 0 16px', fontSize: 15, color: '#374151', lineHeight: 1.7 }}>{post.content}</p>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#9ca3af' }}>
          <span>👤 {post.author.name} {post.author.verified && '✅'}</span>
          <span>👁️ {post.views} ครั้ง</span>
          <span>🗓 {post.createdAt}</span>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>💬 {answers.length} คำตอบ</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
        {answers
          .sort((a, b) => (b.isAccepted ? 1 : 0) - (a.isAccepted ? 1 : 0) || b.votes - a.votes)
          .map((ans) => (
            <div
              key={ans.id}
              style={{
                background: ans.isAccepted ? '#f0fdf4' : '#fff',
                borderRadius: 14,
                padding: 20,
                border: ans.isAccepted ? '2px solid #86efac' : '1px solid #f3f4f6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {ans.isAccepted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 10px', borderRadius: 6 }}>✅ คำตอบที่ถูกเลือก</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => handleVote(ans.id)}
                    style={{
                      background: ans.userVoted ? '#6366f1' : '#f3f4f6',
                      color: ans.userVoted ? '#fff' : '#374151',
                      border: 'none', borderRadius: 8, width: 36, height: 36, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ▲
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 800, color: ans.votes > 0 ? '#6366f1' : '#9ca3af' }}>{ans.votes}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{ans.author.avatar}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{ans.author.name}</span>
                    <span style={{ ...roleColors[ans.author.role], padding: '1px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>{ans.author.role}</span>
                    {ans.author.transactionVerified && (
                      <span style={{ background: '#d1fae5', color: '#065f46', padding: '1px 7px', borderRadius: 5, fontSize: 11, fontWeight: 600 }}>✅ เช่าจริง</span>
                    )}
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>{ans.createdAt}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{ans.content}</p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* New Answer Box */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#111827' }}>✍️ ตอบคำถามนี้</h4>
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="แชร์ประสบการณ์หรือความเห็นของคุณ..."
          rows={4}
          style={{ width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>💡 รีวิวที่มีเครื่องหมาย ✅ เช่าจริง มาจากผู้ที่มีธุรกรรมจริงในระบบ</p>
          <button
            onClick={handleSubmitAnswer}
            disabled={!newAnswer.trim() || isSubmitting}
            style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: newAnswer.trim() ? '#6366f1' : '#e5e7eb',
              color: newAnswer.trim() ? '#fff' : '#9ca3af',
              fontWeight: 700, fontSize: 14, cursor: newAnswer.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {isSubmitting ? '⏳ กำลังส่ง...' : '📨 ส่งคำตอบ'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── New Post Form ─────────────────────── */
function NewPostForm({ onBack, onSubmit }: { onBack: () => void; onSubmit: (p: Partial<Post>) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ทำเล');
  const [zone, setZone] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit({
      title, content, category,
      zone: zone || 'ทั่วประเทศ',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
        ← กลับ
      </button>
      <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 800, color: '#111827' }}>✍️ ตั้งกระทู้ใหม่</h2>

      {[
        { label: 'หัวข้อกระทู้ *', el: <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น ย่านไหนคุ้มค่าที่สุดสำหรับงบ 10,000?" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' as const }} /> },
        {
          label: 'หมวดหมู่ *', el: (
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14 }}>
              {CATEGORIES.filter((c) => c !== 'all').map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )
        },
        { label: 'ย่าน / พื้นที่', el: <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="เช่น สุขุมวิท, บางนา, ลาดพร้าว..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' as const }} /> },
        { label: 'รายละเอียด *', el: <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="อธิบายคำถามหรือแชร์ประสบการณ์ของคุณ..." rows={5} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' as const }} /> },
        { label: 'แท็ก (คั่นด้วย ,)', el: <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="เช่น คอนโด, BTS, บางนา" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' as const }} /> },
      ].map(({ label, el }) => (
        <div key={label} style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
          {el}
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>ยกเลิก</button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim()}
          style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: title.trim() && content.trim() ? '#6366f1' : '#e5e7eb', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          🚀 โพสต์กระทู้
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── Main Component ─────────────────────── */
export default function QABoard() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');

  const filtered = posts.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = !search || p.title.includes(search) || p.content.includes(search) || p.tags.some((t) => t.includes(search));
    return matchCat && matchSearch;
  });

  const handleNewPost = useCallback((partial: Partial<Post>) => {
    const newPost: Post = {
      id: `p_${Date.now()}`,
      title: partial.title!,
      content: partial.content!,
      category: partial.category!,
      zone: partial.zone || 'ทั่วประเทศ',
      author: { id: 'me', name: 'คุณ', avatar: '😊', role: 'tenant', verified: true },
      answers: [],
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      tags: partial.tags || [],
      reported: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setViewMode('list');
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px', fontFamily: "'Inter', 'Noto Sans Thai', sans-serif" }}>
      {viewMode === 'list' && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>🏘️ ชุมชนถาม-ตอบ</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>แชร์ประสบการณ์ ถาม-ตอบเรื่องการเช่า</p>
            </div>
            <button
              id="qa-new-post-btn"
              onClick={() => setViewMode('new')}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              ✍️ ตั้งกระทู้ใหม่
            </button>
          </div>

          {/* Search + Category Filter */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 ค้นหากระทู้..."
              style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                  background: selectedCategory === c ? '#6366f1' : '#f3f4f6',
                  color: selectedCategory === c ? '#fff' : '#374151',
                  flexShrink: 0,
                }}
              >
                {c === 'all' ? 'ทั้งหมด' : c}
              </button>
            ))}
          </div>

          {/* Post List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                <p style={{ fontSize: 40, margin: '0 0 12px' }}>🔍</p>
                <p style={{ fontSize: 15 }}>ไม่พบกระทู้ที่ค้นหา</p>
              </div>
            ) : (
              filtered.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onClick={() => { setSelectedPost(p); setViewMode('detail'); }}
                />
              ))
            )}
          </div>
        </>
      )}

      {viewMode === 'detail' && selectedPost && (
        <PostDetail post={selectedPost} onBack={() => { setSelectedPost(null); setViewMode('list'); }} />
      )}

      {viewMode === 'new' && (
        <NewPostForm onBack={() => setViewMode('list')} onSubmit={handleNewPost} />
      )}
    </div>
  );
}
