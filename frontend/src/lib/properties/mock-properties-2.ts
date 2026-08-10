import { type Property } from '../types';
import { getImageData } from './utils';

export const mockProperties2: Property[] = [
  { 
    id: 11, type: "apartment", name: "สตูดิโอทันสมัย ใกล้จุฬาฯ",
    nameEn: "Modern Studio near Chula University", 
    nameCn: "朱拉隆功大学旁现代公寓",
    location: "ปทุมวัน กรุงเทพฯ",
    locationEn: "Pathum Wan, Bangkok", 
    locationCn: "曼谷 巴吞旺",
    price: 15000, bed: 0, bath: 1, sqm: 32, stars: 3,
    amenities: ["air", "furnished", "bts_mrt", "nice_view", "gym"], badge: "hot",
    img: getImageData('p11').url, imageHint: getImageData('p11').hint 
  },
  { 
    id: 12, type: "condo", name: "เรสซิเดนซ์หรู ติด BTS พร้อมพงษ์",
    nameEn: "High-end Residence at BTS Phrom Phong", 
    nameCn: "澎蓬 BTS 站旁高端住宅",
    location: "คลองเตย กรุงเทพฯ",
    locationEn: "Khlong Toei, Bangkok", 
    locationCn: "曼谷 空堤",
    price: 45000, bed: 2, bath: 2, sqm: 95, stars: 5,
    amenities: ["air", "pool", "gym", "bts_mrt", "parking", "furnished", "nice_view"], badge: "featured",
    img: getImageData('p12').url, imageHint: getImageData('p12').hint 
  },
  { 
    id: 13, type: "apartment", name: "หอพักสไตล์โมเดิร์น ม.ธรรมศาสตร์ รังสิต",
    nameEn: "Modern Student Flat near TU Rangsit", 
    nameCn: "法政大学兰实校区现代公寓",
    location: "คลองหลวง ปทุมธานี",
    locationEn: "Khlong Luang, Pathum Thani", 
    locationCn: "巴吞他尼 空峦",
    price: 6500, bed: 1, bath: 1, sqm: 30, stars: 3,
    amenities: ["air", "parking", "furnished", "playground"], badge: "",
    img: getImageData('p13').url, imageHint: getImageData('p13').hint 
  },
  { 
    id: 14, type: "house", name: "บ้านเดี่ยวครอบครัว มีพื้นที่รอบบ้าน บางนา",
    nameEn: "Spacious Family Home, Bang Na", 
    nameCn: "邦纳宽敞家庭别墅",
    location: "บางนา กรุงเทพฯ",
    locationEn: "Bang Na, Bangkok", 
    locationCn: "曼谷 邦纳",
    price: 30000, bed: 3, bath: 3, sqm: 190, stars: 4,
    amenities: ["parking", "garden", "pet", "air", "playground"], badge: "",
    img: getImageData('p14').url, imageHint: getImageData('p14').hint 
  },
  { 
    id: 15, type: "townhouse", name: "ทาวน์เฮ้าส์ใกล้รถไฟฟ้า บางขุนนนท์",
    nameEn: "Townhouse near MRT Bang Khun Non", 
    nameCn: "曼坤农 MRT 站旁联เปีย别墅",
    location: "บางกอกน้อย กรุงเทพฯ",
    locationEn: "Bangkok Noi, Bangkok", 
    locationCn: "曼谷 曼谷内",
    price: 18000, bed: 2, bath: 2, sqm: 100, stars: 3,
    amenities: ["air", "parking", "bts_mrt", "nice_view"], badge: "hot",
    img: getImageData('p15').url, imageHint: getImageData('p15').hint 
  },
  { 
    id: 16, type: "condo", name: "คอนโดไลฟ์สไตล์ ใกล้ ม.เกษตรศาสตร์",
    nameEn: "Lifestyle Condo near Kasetsart University", 
    nameCn: "农业大学旁生活方式公寓",
    location: "จตุจักร กรุงเทพฯ",
    locationEn: "Chatuchak, Bangkok", 
    locationCn: "曼谷 乍都乍",
    price: 13000, bed: 1, bath: 1, sqm: 35, stars: 4,
    amenities: ["air", "pool", "gym", "furnished", "bts_mrt", "parking"], badge: "featured",
    img: getImageData('p16').url, imageHint: getImageData('p16').hint 
  },
  { 
    id: 17, type: "apartment", name: "ที่พักนักศึกษาทันสมัย ม.มหิดล ศาลายา",
    nameEn: "Modern Student Living near Mahidol Salaya", 
    nameCn: "玛希隆大学萨拉亚校区学生公寓",
    location: "พุทธมณฑล นครปฐม",
    locationEn: "Phutthamonthon, Nakhon Pathom", 
    locationCn: "佛统 普塔蒙通",
    price: 5500, bed: 1, bath: 1, sqm: 28, stars: 3,
    amenities: ["air", "parking", "furnished", "gym"], badge: "hot",
    img: getImageData('p17').url, imageHint: getImageData('p17').hint 
  },
  { 
    id: 18, type: "condo", name: "สวีทสุดหรู ใกล้เอแบค บางนา",
    nameEn: "Upscale Suite near ABAC Bangna", 
    nameCn: "易三仓大学邦纳校区高端套房",
    location: "บางบ่อ สมุทรปราการ",
    locationEn: "Bang Bo, Samut Prakan", 
    locationCn: "北榄 邦波",
    price: 11000, bed: 1, bath: 1, sqm: 38, stars: 4,
    amenities: ["air", "pool", "gym", "furnished", "parking", "nice_view"], badge: "featured",
    img: getImageData('p18').url, imageHint: getImageData('p18').hint 
  },
  { 
    id: 19, type: "condo", name: "อพาร์ตเมนต์ใจกลางเมือง ขอนแก่น",
    nameEn: "City Center Apartment, Khon Kaen", 
    nameCn: "孔敬市中心公寓",
    location: "เมือง ขอนแก่น",
    locationEn: "Mueang, Khon Kaen", 
    locationCn: "孔敬 直辖县",
    price: 6000, bed: 0, bath: 1, sqm: 30, stars: 3,
    amenities: ["air", "furnished", "parking", "nice_view"], badge: "",
    img: getImageData('p19').url, imageHint: getImageData('p19').hint 
  },
  { 
    id: 20, type: "apartment", name: "หอพักใหม่ ทำเลสะดวก หาดใหญ่",
    nameEn: "Convenient New Flat, Hat Yai", 
    nameCn: "合艾便利新公寓",
    location: "หาดใหญ่ สงขลา",
    locationEn: "Hat Yai, Songkhla", 
    locationCn: "宋卡 合艾",
    price: 4500, bed: 1, bath: 1, sqm: 32, stars: 3,
    amenities: ["air", "parking", "furnished", "bts_mrt"], badge: "",
    img: getImageData('p20').url, imageHint: getImageData('p20').hint 
  }
];
