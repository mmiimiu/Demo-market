'use client';

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Trash2, Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PhotosMediaSectionProps {
  photos: string[];
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (idx: number) => void;
  t: any;
  isUploading?: boolean;
  tour360Url?: string;
  onTour360Change?: (url: string) => void;
}

export const PhotosMediaSection: React.FC<PhotosMediaSectionProps> = ({
  photos, handlePhotoUpload, removePhoto, t, isUploading, tour360Url = '', onTour360Change,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const syntheticEvent = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handlePhotoUpload(syntheticEvent);
  };

  return (
    <div className="space-y-6 pt-10 border-t border-gray-50">
      <Label className="font-black text-gray-900 text-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
            <ImageIcon className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </div>
          {t.upload_photos}
        </div>
        <Badge variant="outline" className={cn('rounded-full px-3 py-1 font-black', photos.length >= 5 ? 'text-green-500 border-green-200' : 'text-orange-500 border-orange-200')}>
          {photos.length}/10
        </Badge>
      </Label>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
          isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-gray-200 bg-gray-50/50 hover:border-primary hover:bg-primary/5'
        )}
      >
        <Camera className={cn('w-8 h-8 transition-colors', isDragging ? 'text-primary' : 'text-gray-400')} />
        <p className="text-xs font-black text-gray-500 text-center">
          {isDragging ? '🎯 วางรูปได้เลย' : 'ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือก'}
        </p>
        <p className="text-[10px] text-gray-400 font-medium">รองรับ JPG, PNG, WEBP • อัปโหลดได้ครั้งละหลายรูป • ต้องอย่างน้อย 5 รูป</p>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {photos.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-transparent hover:border-primary transition-all">
            <img src={src} className="w-full h-full object-cover" alt="" />
            <button type="button" onClick={() => removePhoto(i)}
              className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Trash2 className="w-4 h-4" />
            </button>
            {i === 0 && (
              <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-primary text-white text-[8px] font-black uppercase rounded-full tracking-wider">
                {t.cover_photo || 'รูปหลัก'}
              </div>
            )}
          </div>
        ))}
        {isUploading && (
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-primary bg-primary/5 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{t.uploading || 'อัปโหลด...'}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground font-medium">{t.upload_photos_hint}</p>

      {/* 360° Tour URL */}
      <div className="space-y-2 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
        <Label className="font-bold text-gray-700 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          360° Virtual Tour URL <span className="text-gray-400 font-normal text-xs">(ไม่บังคับ)</span>
        </Label>
        <Input
          type="url"
          placeholder="https://my.matterport.com/show/?m=... หรือ Google Street View"
          value={tour360Url}
          onChange={(e) => onTour360Change?.(e.target.value)}
          className="h-11 rounded-xl bg-white border-indigo-100 font-medium text-sm"
        />
        <p className="text-[11px] text-indigo-400 font-medium">รองรับ Matterport, Kuula, Google Street View, YouTube 360</p>
      </div>
    </div>
  );
};
