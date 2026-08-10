import React from 'react';
import { Camera, X } from 'lucide-react';
import type { Language } from '@/lib/types';

interface MaintenancePhotoUploadProps {
  images: string[];
  onUploadMock: () => void;
  onRemove: (index: number) => void;
  lang: Language;
}

export function MaintenancePhotoUpload({ images, onUploadMock, onRemove, lang }: MaintenancePhotoUploadProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {lang === 'th' ? 'รูปภาพประกอบ' : 'Attach Photos'}
      </label>
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group">
            <img src={img} alt="issue" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {images.length < 5 && (
          <button
            type="button"
            onClick={onUploadMock}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Camera className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold uppercase">Add Photo</span>
          </button>
        )}
      </div>
    </div>
  );
}
