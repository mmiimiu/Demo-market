import { type Property } from '../types';
import { getImageData } from './utils';

export const mockProperties1: Property[] = [
  { 
    id: 1, type: "condo", name: "คอนโดหรู ใกล้ BTS อโศก สุขุมวิท",
    nameEn: "Luxury Condo near BTS Asok, Sukhumvit", 
    nameCn: "素坤逸阿速 BTS 站旁豪华公寓",
    location: "สุขุมวิท กรุงเทพฯ",
    locationEn: "Sukhumvit, Bangkok", 
    locationCn: "曼谷 素坤逸",
    price: 26000, originalPrice: 28000, bed: 1, bath: 1, sqm: 35, stars: 4,
    amenities: ["air", "parking", "furnished", "gym", "bts_mrt", "pool"], badge: "featured",
    contractStatus: "pending_signature",
    tour360Url: "https://www.youtube.com/embed/1TqP6H4JZPM",
    img: getImageData('p1').url, imageHint: getImageData('p1').hint 
  },
  { 
    id: 2, type: "house", name: "บ้านเดี่ยวบรรยากาศสวน รามอินทรา",
    nameEn: "Garden Style House, Ram Inthra", 
    nameCn: "兰音他花园式别墅",
    location: "มีนบุรี กรุงเทพฯ",
    locationEn: "Min Buri, Bangkok", 
    locationCn: "曼谷 民武里",
    price: 25000, bed: 3, bath: 2, sqm: 150, stars: 4,
    amenities: ["parking", "garden", "air", "pet", "playground"], badge: "",
    img: getImageData('p2').url, imageHint: getImageData('p2').hint 
  },
  { 
    id: 3, type: "condo", name: "คอนโดมินิมอล นิมมานเหมินท์ วิวดอย",
    nameEn: "Minimalist Nimman Condo, Doi Suthep View", 
    nameCn: "宁曼路山景极简公寓",
    location: "นิมมาน เชียงใหม่",
    locationEn: "Nimmanhaemin, Chiang Mai", 
    locationCn: "清迈 宁曼路",
    price: 12000, bed: 1, bath: 1, sqm: 40, stars: 4,
    amenities: ["air", "pool", "gym", "furnished", "nice_view"], badge: "hot",
    img: getImageData('p3').url, imageHint: getImageData('p3').hint 
  },
  { 
    id: 4, type: "apartment", name: "อพาร์ตเมนต์ตากอากาศ ใกล้หาดป่าตอง",
    nameEn: "Vacation Apartment near Patong Beach", 
    nameCn: "芭东海滩旁度假公寓",
    location: "ป่าตอง ภูเก็ต",
    locationEn: "Patong, Phuket", 
    locationCn: "普吉岛 芭东",
    price: 20000, bed: 2, bath: 2, sqm: 55, stars: 3,
    amenities: ["air", "seaview", "parking", "furnished"], badge: "",
    img: getImageData('p4').url, imageHint: getImageData('p4').hint 
  },
  { 
    id: 5, type: "townhouse", name: "ทาวน์เฮ้าส์ร่วมสมัย ย่านลาดพร้าว",
    nameEn: "Contemporary Townhouse, Ladprao", 
    nameCn: "拉抛现代联排别墅",
    location: "ลาดพร้าว กรุงเทพฯ",
    locationEn: "Ladprao, Bangkok", 
    locationCn: "曼谷 拉抛",
    price: 22000, bed: 3, bath: 3, sqm: 120, stars: 3,
    amenities: ["parking", "air", "bts_mrt"], badge: "",
    img: getImageData('p5').url, imageHint: getImageData('p5').hint 
  },
  { 
    id: 6, type: "condo", name: "คอนโดวิวทะเลพาโนรามา พัทยากลาง",
    nameEn: "Panorama Ocean View Condo, Central Pattaya", 
    nameCn: "芭提雅市中心全海景公寓",
    location: "พัทยากลาง ชลบุรี",
    locationEn: "Central Pattaya, Chonburi", 
    locationCn: "春武里 芭提雅",
    price: 16000, bed: 1, bath: 1, sqm: 45, stars: 5,
    amenities: ["pool", "seaview", "furnished", "air", "gym"], badge: "featured",
    img: getImageData('p6').url, imageHint: getImageData('p6').hint 
  },
  { 
    id: 7, type: "condo", name: "สตูดิโอแต่งครบ ใกล้ MRT ลาดพร้าว",
    nameEn: "Fully Furnished Studio near MRT Ladprao", 
    nameCn: "拉抛 MRT 站旁精装修单身公寓",
    location: "จตุจักร กรุงเทพฯ",
    locationEn: "Chatuchak, Bangkok", 
    locationCn: "曼谷 乍都乍",
    price: 8500, bed: 0, bath: 1, sqm: 28, stars: 2,
    amenities: ["air", "furnished", "gym", "bts_mrt", "parking"], badge: "hot",
    img: getImageData('p7').url, imageHint: getImageData('p7').hint 
  },
  { 
    id: 8, type: "apartment", name: "อพาร์ตเมนต์นักศึกษา หลัง มช.",
    nameEn: "Student Apartment near CMU", 
    nameCn: "清迈大学旁学生公寓",
    location: "สุเทพ เชียงใหม่",
    locationEn: "Suthep, Chiang Mai", 
    locationCn: "清迈 素贴",
    price: 7500, bed: 1, bath: 1, sqm: 32, stars: 2,
    amenities: ["air", "parking", "furnished", "bts_mrt"], badge: "",
    img: getImageData('p8').url, imageHint: getImageData('p8').hint 
  },
  { 
    id: 9, type: "house", name: "วิลล่าส่วนตัวพร้อมสวน หัวหิน",
    nameEn: "Private Villa with Garden, Hua Hin", 
    nameCn: "华欣带花园私人别墅",
    location: "หัวหิน ประจวบคีรีขันธ์",
    locationEn: "Hua Hin, Prachuap", 
    locationCn: "巴蜀 华欣",
    price: 35000, bed: 4, bath: 3, sqm: 220, stars: 4,
    amenities: ["parking", "garden", "pet", "air", "playground", "pool"], badge: "",
    img: getImageData('p9').url, imageHint: getImageData('p9').hint 
  },
  { 
    id: 10, type: "condo", name: "คอนโดเลี้ยงสัตว์ได้ ใจกลางอารีย์",
    nameEn: "Pet-Friendly Condo, Heart of Ari", 
    nameCn: "阿黎市中心宠物友好公寓",
    location: "พญาไท กรุงเทพฯ",
    locationEn: "Phaya Thai, Bangkok", 
    locationCn: "曼谷 披耶泰",
    price: 28000, bed: 1, bath: 1, sqm: 48, stars: 4,
    amenities: ["air", "pet", "furnished", "bts_mrt", "pool", "gym"], badge: "featured",
    img: getImageData('p10').url, imageHint: getImageData('p10').hint 
  }
];
