export const langFlags = {
  th: "https://flagcdn.com/w40/th.png",
  en: "https://flagcdn.com/w40/us.png",
  cn: "https://flagcdn.com/w40/cn.png"
};

export const symbols = { THB: '฿', USD: '$', CNY: '¥' };
export const rates = { THB: 1, USD: 0.028, CNY: 0.20 };

export const getCategories = (t: any) => [
  { icon: '🏢', label: t.cat_condo || 'คอนโด', q: 'condo' },
  { icon: '🏠', label: t.cat_house || 'บ้านเดี่ยว', q: 'house' },
  { icon: '🏬', label: t.cat_apartment || 'อพาร์ตเมนต์', q: 'apartment' },
  { icon: '🛏', label: t.cat_dorm || 'หอพัก', q: 'dorm' },
  { icon: '🌴', label: t.cat_villa || 'วิลล่า / รีสอร์ท', q: 'villa' },
  { icon: '📦', label: t.cat_studio || 'สตูดิโอ', q: 'studio' },
];

export const getPopularLocations = (t: any) => [
  { label: t.loc_asoke_sukhumvit || 'อโศก / สุขุมวิท', query: 'อโศก', count: '1,240+' },
  { label: t.loc_silom_sathorn || 'สีลม / สาทร', query: 'สีลม', count: '890+' },
  { label: t.loc_ladprao_ratchada || 'ลาดพร้าว / รัชดา', query: 'ลาดพร้าว', count: '720+' },
  { label: t.loc_rama9_petchaburi || 'พระราม 9 / เพชรบุรี', query: 'พระราม 9', count: '540+' },
  { label: t.loc_nimman || 'นิมมานเหมินทร์ (เชียงใหม่)', query: 'นิมมาน', count: '310+' },
  { label: t.loc_patong || 'ป่าตอง (ภูเก็ต)', query: 'ป่าตอง', count: '280+' },
];
