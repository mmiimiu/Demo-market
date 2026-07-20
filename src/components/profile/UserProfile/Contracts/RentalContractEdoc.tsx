import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Language, UserRole } from '@/lib/types';
import { FileUp, Plus, Trash2, Edit2, Check, PenTool } from 'lucide-react';
import { SignatureSection } from '../Delegations/SignatureSection';

interface Props {
  lang: Language;
  currentRole: UserRole;
  currentUser?: any;
}

export const RentalContractEdoc = ({ lang, currentRole, currentUser }: Props) => {
  const isTh = lang === 'th';
  
  const [ownerName, setOwnerName] = useState(currentUser?.displayName || 'นาย สมชาย ใจดี');
  const [tenantName, setTenantName] = useState('นาย ณัฐพล ใจสู้');
  const [agentName, setAgentName] = useState('PrimeRent Agent');
  const [propertyName, setPropertyName] = useState('คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204');
  
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2027-06-30');
  const [rentAmount, setRentAmount] = useState('18,000');
  const [depositAmount, setDepositAmount] = useState('36,000');
  
  const [isEditing, setIsEditing] = useState(false);
  const [furniture, setFurniture] = useState<{item: string, value: string}[]>([
    { item: 'เครื่องปรับอากาศ (Air Conditioner)', value: '15000' },
    { item: 'โทรทัศน์ (Television)', value: '10000' },
    { item: 'ตู้เย็น (Refrigerator)', value: '8000' },
    { item: 'เครื่องซักผ้า (Washing Machine)', value: '12000' },
    { item: 'เตียงและที่นอน (Bed & Mattress)', value: '15000' },
    { item: 'ตู้เสื้อผ้า (Wardrobe)', value: '10000' },
    { item: 'ชุดโซฟา (Sofa Set)', value: '8000' },
    { item: 'ไมโครเวฟ (Microwave)', value: '3000' },
    { item: 'เครื่องทำน้ำอุ่น (Water Heater)', value: '4000' },
    { item: 'โต๊ะอาหารและเก้าอี้ (Dining Table Set)', value: '5000' }
  ]);
  const [hasAgent, setHasAgent] = useState(true);

  const addFurniture = () => setFurniture([...furniture, { item: '', value: '' }]);
  const updateFurniture = (idx: number, field: 'item'|'value', val: string) => {
    const newF = [...furniture];
    newF[idx][field] = val;
    setFurniture(newF);
  };
  const removeFurniture = (idx: number) => setFurniture(furniture.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardContent className="p-6 md:p-10 relative">
          {currentRole !== 'renter' && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="absolute right-6 top-6">
              {isEditing ? <><Check className="w-4 h-4 mr-2" /> {isTh ? 'บันทึก' : 'Save'}</> : <><Edit2 className="w-4 h-4 mr-2" /> {isTh ? 'แก้ไข' : 'Edit'}</>}
            </Button>
          )}
          
          <div className="flex flex-col items-center mb-10 border-b border-gray-100 pb-6 mt-4">
            <h3 className="text-2xl font-black text-gray-900 mb-2">{isTh ? 'หนังสือสัญญาเช่าที่พักอาศัย' : 'Residential Lease Agreement'}</h3>
            <p className="text-sm font-medium text-gray-500">{isTh ? 'ทำขึ้น ณ แพลตฟอร์ม PrimeRent (สัญญาเช่าฉบับสมบูรณ์)' : 'Created on PrimeRent Platform (Complete Lease Agreement)'}</p>
          </div>

          <div className="text-[15px] leading-8 text-gray-800 space-y-6 mb-10">
            <p className="indent-10">
              {isTh ? 'สัญญาเช่าฉบับนี้ทำขึ้นระหว่าง ' : 'This agreement is made between '}
              {isEditing ? (
                <Input className="inline-block w-40 h-8 px-2 text-sm mx-1 font-bold" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
              ) : (
                <span className="font-bold underline px-1 text-black">{ownerName}</span>
              )}
              {isTh ? ' (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้ให้เช่า") ฝ่ายหนึ่ง กับ ' : ' (hereinafter referred to as the "Lessor"), and '}
              {isEditing ? (
                <Input className="inline-block w-40 h-8 px-2 text-sm mx-1 font-bold" value={tenantName} onChange={e => setTenantName(e.target.value)} />
              ) : (
                <span className="font-bold underline px-1 text-black">{tenantName}</span>
              )}
              {isTh ? ' (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้เช่า") อีกฝ่ายหนึ่ง ' : ' (hereinafter referred to as the "Tenant"). '}
              {hasAgent && (
                <>
                  {isTh ? 'โดยมี ' : 'With '}
                  {isEditing ? (
                    <Input className="inline-block w-40 h-8 px-2 text-sm mx-1 font-bold" value={agentName} onChange={e => setAgentName(e.target.value)} />
                  ) : (
                    <span className="font-bold underline px-1 text-black">{agentName}</span>
                  )}
                  {isTh ? ' เป็นตัวแทนและพยานผู้ประสานงานร่วมดูแล' : ' acting as the agent and coordinating witness.'}
                </>
              )}
            </p>
            
            <p className="indent-10">
              {isTh ? 'ทั้งสองฝ่ายตกลงทำสัญญาเช่าทรัพย์สินประเภทห้องพัก โครงการ ' : 'Both parties agree to lease the residential property located at '}
              {isEditing ? (
                <Input className="inline-block w-64 h-8 px-2 text-sm mx-1 font-bold" value={propertyName} onChange={e => setPropertyName(e.target.value)} />
              ) : (
                <span className="font-bold underline px-1 text-black">{propertyName}</span>
              )}
              {isTh ? ' โดยมีเงื่อนไขรายละเอียดดังนี้:' : ' with the following terms and conditions:'}
            </p>
          </div>

          <div className="bg-gray-50/80 p-6 md:p-8 rounded-2xl mb-10 border border-gray-100 space-y-5 shadow-sm">
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-600 font-medium">{isTh ? 'อัตราค่าเช่ารายเดือน:' : 'Monthly Rent:'}</span>
              <div className="flex items-center">
                {isEditing ? <Input className="w-32 h-9 text-right font-bold" value={rentAmount} onChange={e => setRentAmount(e.target.value)} /> : <span className="font-black text-lg">฿{rentAmount}</span>}
                <span className="ml-2 text-gray-800 font-bold">{isTh ? 'บาท / เดือน' : 'THB / month'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-600 font-medium">{isTh ? 'เงินประกันความเสียหาย (มัดจำ):' : 'Security Deposit:'}</span>
              <div className="flex items-center">
                {isEditing ? <Input className="w-32 h-9 text-right font-bold" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} /> : <span className="font-black text-lg">฿{depositAmount}</span>}
                <span className="ml-2 text-gray-800 font-bold">{isTh ? 'บาท' : 'THB'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-gray-600 font-medium">{isTh ? 'ระยะเวลาเช่าเริ่มต้น:' : 'Lease Start Date:'}</span>
              {isEditing ? <Input type="date" className="w-44 h-9 font-bold" value={startDate} onChange={e => setStartDate(e.target.value)} /> : <span className="font-black text-base">{new Date(startDate).toLocaleDateString(isTh?'th-TH':'en-US', {day:'numeric', month:'short', year:'numeric'})}</span>}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">{isTh ? 'ระยะเวลาเช่าสิ้นสุด:' : 'Lease End Date:'}</span>
              {isEditing ? <Input type="date" className="w-44 h-9 font-bold" value={endDate} onChange={e => setEndDate(e.target.value)} /> : <span className="font-black text-base">{new Date(endDate).toLocaleDateString(isTh?'th-TH':'en-US', {day:'numeric', month:'short', year:'numeric'})}</span>}
            </div>
          </div>

          <div className="mb-12 text-[15px] text-gray-800 leading-relaxed">
            <h4 className="font-black mb-4 text-black">{isTh ? 'ข้อตกลงและหน้าที่เพิ่มเติม:' : 'Additional Terms and Duties:'}</h4>
            <ol className="list-decimal pl-6 space-y-3 font-medium text-gray-600">
              <li>{isTh ? 'ผู้เช่าตกลงชำระเงินค่าเช่าล่วงหน้าภายในวันที่ 5 ของทุกเดือน หากล่าช้าจะยินยอมให้ปรับวันละ 100 บาท' : 'Tenant agrees to pay rent by the 5th of every month. Late payments incur a 100 THB/day penalty.'}</li>
              <li>{isTh ? 'ผู้เช่าตกลงรับผิดชอบชำระค่าสาธารณูปโภค ค่าน้ำ ค่าไฟ ตามหน่วยวัดอัตราที่ทางการเรียกเก็บ' : 'Tenant is responsible for utility bills (water, electricity) at government rates.'}</li>
              <li>{isTh ? 'ห้ามมิให้ผู้เช่านำทรัพย์สินไปให้ผู้อื่นเช่าช่วง หรือใช้ประกอบกิจการผิดกฎหมาย' : 'Subletting or using the property for illegal activities is strictly prohibited.'}</li>
            </ol>
          </div>

          <div className="mb-10 border-t border-gray-100 pt-8">
            <h4 className="font-black text-lg mb-2 text-gray-900">{isTh ? 'เอกสารแนบท้าย 1: รายการเฟอร์นิเจอร์และประเมินค่าเสียหาย' : 'Appendix 1: Furniture Inventory & Damage Value'}</h4>
            <p className="text-sm text-gray-500 mb-6">{isTh ? 'รายละเอียดทรัพย์สินภายในห้องพัก หากเกิดความเสียหายผู้เช่ายินยอมชดใช้ตามมูลค่าที่ระบุด้านล่าง' : 'List of properties inside the room. Tenant agrees to compensate the listed value in case of damages.'}</p>
            <div className="space-y-3">
              {furniture.map((f, i) => (
                <div key={i} className="flex items-center gap-1 md:gap-2 mb-1.5 group relative">
                  <span className="w-4 text-right text-gray-500 font-bold !text-[10px] shrink-0" style={{ fontSize: '10px' }}>{i + 1}.</span>
                  {isEditing ? (
                    <>
                      <PenTool className="w-3.5 h-3.5 text-amber-500 absolute -left-4 opacity-70" />
                      <input type="text" value={f.item} onChange={e => updateFurniture(i, 'item', e.target.value)} style={{ fontSize: '10px' }} className="flex-[2] border-b border-gray-300 border-dashed bg-transparent px-1 font-normal focus:outline-none focus:bg-amber-50 focus:border-amber-400 !text-[10px] transition-colors" placeholder="Item name" />
                      <div className="flex-1 mx-2 shrink-0" />
                      <input type="text" value={f.value} onChange={e => updateFurniture(i, 'value', e.target.value)} style={{ fontSize: '10px' }} className="w-20 border-b border-gray-300 border-dashed bg-transparent px-1 font-bold focus:outline-none focus:bg-amber-50 focus:border-amber-400 !text-[10px] text-center transition-colors text-amber-700" placeholder="0" />
                      <span className="text-gray-700 font-bold !text-[10px] w-8 shrink-0" style={{ fontSize: '10px' }}>{isTh ? 'บาท' : 'THB'}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeFurniture(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-6 w-6 shrink-0 ml-1 rounded-full">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-[2] font-normal text-gray-900 !text-[10px] pl-1" style={{ fontSize: '10px' }}>{f.item}</span>
                      <div className="flex-1 mx-2 shrink-0" />
                      <span className="font-bold text-amber-700 !text-[10px] px-2 text-center" style={{ fontSize: '10px' }}>{Number(f.value || 0).toLocaleString()}</span>
                      <div className="flex-1 mx-2 shrink-0" />
                      <span className="text-gray-900 font-bold !text-[10px] w-8 shrink-0 text-right" style={{ fontSize: '10px' }}>{isTh ? 'บาท' : 'THB'}</span>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <Button variant="outline" size="sm" onClick={addFurniture} className="mt-4 border-dashed border-gray-300 text-gray-600 font-bold">
                  <Plus className="w-4 h-4 mr-1" /> {isTh ? 'เพิ่มรายการ' : 'Add Item'}
                </Button>
              )}
            </div>
          </div>

          <div className="mb-10 border-t border-gray-100 pt-8">
            <h4 className="font-black text-lg mb-4 text-gray-900">{isTh ? 'เอกสารแนบท้าย 2: รูปภาพและเอกสารเพิ่มเติม' : 'Appendix 2: Photos & Documents'}</h4>
            <Button variant="outline" className="w-full h-32 border-dashed border-2 bg-gray-50/50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center text-gray-500">
                <FileUp className="w-8 h-8 mb-3 text-gray-400" />
                <span className="font-bold">{isTh ? 'คลิกเพื่ออัปโหลดไฟล์ (PDF, JPG, PNG)' : 'Click to upload files'}</span>
                <span className="text-xs text-gray-400 mt-2 font-medium">{isTh ? 'รองรับขนาดสูงสุด 5MB' : 'Max size 5MB'}</span>
              </div>
            </Button>
          </div>

          <div className="mb-8 flex items-center gap-3 bg-blue-50/80 p-4 rounded-xl border border-blue-100">
            <input type="checkbox" id="hasAgent" className="w-4 h-4 text-blue-600 rounded border-gray-300" checked={hasAgent} onChange={e => setHasAgent(e.target.checked)} />
            <label htmlFor="hasAgent" className="text-sm font-bold text-blue-900">{isTh ? 'มีเอเจ้นท์เป็นตัวแทนประสานงาน (สัญญาสามฝ่าย)' : 'Agent acts as coordinator (3-Party Agreement)'}</label>
          </div>

          <SignatureSection 
            lang={lang} 
            currentRole={currentRole} 
            mode="rental" 
            hasAgent={hasAgent} 
            agreement={{
              ownerName: ownerName, 
              agentName: agentName,
              tenantName: tenantName
            }} 
            onSign={() => {}} 
          />
        </CardContent>
      </Card>
    </div>
  );
};
