import React from 'react';
import { CheckCircle2, AlertTriangle, X, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryGroupProps } from './types';

export const CategoryGroup: React.FC<CategoryGroupProps> = ({
  lang,
  category,
  catItems,
  updateItemStatus,
  updateRemark,
  handleMockUploadPhoto,
  removePhoto
}) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
      <h3 className="font-black text-lg text-gray-900 mb-4">{category}</h3>
      
      <div className="space-y-6">
        {catItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="font-bold text-gray-800">{item.name}</div>
              
              <div className="flex bg-gray-50 p-1 rounded-xl">
                {[
                  { id: 'good', label: lang === 'th' ? 'ปกติ' : 'Good', icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
                  { id: 'damaged', label: lang === 'th' ? 'ชำรุด' : 'Damaged', icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
                  { id: 'untested', label: lang === 'th' ? 'ไม่ได้ทดสอบ' : 'Untested', icon: X, color: 'text-gray-600 bg-gray-200' },
                ].map(statusBtn => (
                  <button
                    key={statusBtn.id}
                    onClick={() => updateItemStatus(item.id, statusBtn.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                      item.status === statusBtn.id 
                        ? statusBtn.color 
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"
                    )}
                  >
                    {item.status === statusBtn.id && <statusBtn.icon className="w-3.5 h-3.5" />}
                    {statusBtn.label}
                  </button>
                ))}
              </div>
            </div>

            {(item.status === 'damaged' || item.status === 'untested') && (
              <div className="mt-4 pt-4 border-t border-gray-50 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <input
                  type="text"
                  placeholder={lang === 'th' ? 'ระบุรายละเอียดปัญหา...' : 'Describe the issue...'}
                  value={item.remark}
                  onChange={(e) => updateRemark(item.id, e.target.value)}
                  className="w-full text-sm px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                />
                
                <div className="flex flex-wrap gap-2">
                  {item.photos.map((photo, pIdx) => (
                    <div key={pIdx} className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden group">
                      <img src={photo} alt="evidence" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(item.id, pIdx)}
                        className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleMockUploadPhoto(item.id)}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[8px] font-bold uppercase">Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
