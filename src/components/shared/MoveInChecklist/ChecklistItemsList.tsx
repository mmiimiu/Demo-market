import React from 'react';
import { Camera, CheckCircle2, AlertTriangle, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ChecklistItemsListProps } from './types';

export const ChecklistItemsList: React.FC<ChecklistItemsListProps> = ({
  lang,
  items,
  addItem,
  removeItem,
  updateItem,
  handlePhotoUpload
}) => {
  const isThai = lang === 'th';

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="border-none shadow-sm rounded-none overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5 space-y-2">
                <Label className="font-black text-gray-400 text-[10px] uppercase tracking-widest">{isThai ? 'ชื่อรายการ' : 'Item Name'}</Label>
                <Input 
                  value={item.name} 
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  placeholder={isThai ? 'ระบุสิ่งของ...' : 'e.g. Living room wall'}
                  className="h-12 rounded-none bg-gray-50 border-none font-bold"
                />
              </div>
              
              <div className="md:col-span-3 space-y-2">
                <Label className="font-black text-gray-400 text-[10px] uppercase tracking-widest">{isThai ? 'สถานะ' : 'Status'}</Label>
                <div className="flex gap-2">
                  {['good', 'damaged'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateItem(item.id, 'status', s as any)}
                      className={`flex-1 h-12 rounded-none border-2 transition-all flex items-center justify-center ${
                        item.status === s ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 bg-gray-50 text-gray-400'
                      }`}
                    >
                      {s === 'good' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label className="font-black text-gray-400 text-[10px] uppercase tracking-widest">{isThai ? 'รูปภาพประกอบ' : 'Photo'}</Label>
                <div className="relative h-12 rounded-none bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary/30 transition-colors group overflow-hidden">
                  {item.photo ? (
                    <img src={item.photo} className="h-full w-full object-cover" alt="Preview" />
                  ) : (
                    <Camera className="w-5 h-5 text-gray-300 group-hover:text-primary" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handlePhotoUpload(item.id, e)}
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex justify-end">
                <Button variant="ghost" size="icon" type="button" onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-destructive rounded-none">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" type="button" onClick={addItem} className="w-full h-14 rounded-none border-2 border-dashed font-black text-primary gap-2">
        <Plus className="w-5 h-5" /> {isThai ? 'เพิ่มรายการตรวจสอบ' : 'Add Item'}
      </Button>
    </div>
  );
};
