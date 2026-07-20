import { MockListing } from './types';
import { getImageData } from '@/lib/properties/utils';

export const mockListings: MockListing[] = [
  { id: 1, title: "คอนโดหรู ใกล้ BTS อโศก สุขุมวิท", location: "สุขุมวิท กรุงเทพฯ", price: 18000, beds: 1, baths: 1, sqm: 35, tag: "ใกล้ BTS", image: getImageData('p1').url, type: "คอนโด" },
  { id: 3, title: "คอนโดมินิมอล นิมมานเหมินท์ วิวดอย", location: "นิมมาน เชียงใหม่", price: 12000, beds: 1, baths: 1, sqm: 40, tag: "ราคาดี", image: getImageData('p3').url, type: "คอนโด" },
  { id: 2, title: "บ้านเดี่ยวบรรยากาศสวน รามอินทรา", location: "มีนบุรี กรุงเทพฯ", price: 25000, beds: 3, baths: 2, sqm: 150, tag: "HOT", image: getImageData('p2').url, type: "บ้านเดี่ยว" },
  { id: 4, title: "อพาร์ตเมนต์ตากอากาศ ใกล้หาดป่าตอง", location: "ป่าตอง ภูเก็ต", price: 20000, beds: 2, baths: 2, sqm: 55, tag: "ใหม่", image: getImageData('p4').url, type: "อพาร์ตเมนต์" },
  { id: 12, title: "เรสซิเดนซ์หรู ติด BTS พร้อมพงษ์", location: "คลองเตย กรุงเทพฯ", price: 45000, beds: 2, baths: 2, sqm: 95, tag: "เฟอร์ครบ", image: getImageData('p12').url, type: "คอนโด" },
  { id: 15, title: "ทาวน์เฮ้าส์ใกล้รถไฟฟ้า บางขุนนนท์", location: "บางขุนนนท์ กรุงเทพฯ", price: 15000, beds: 2, baths: 2, sqm: 80, tag: "กว้างขวาง", image: getImageData('p15').url, type: "ทาวน์เฮ้าส์" },
];
