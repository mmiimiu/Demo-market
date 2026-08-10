'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryGridProps {
  galleryImages: string[];
  imgIdx: number;
  setImgIdx: React.Dispatch<React.SetStateAction<number>>;
  totalImages: number;
  onOpenGallery: () => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  galleryImages,
  imgIdx,
  setImgIdx,
  totalImages,
  onOpenGallery,
}) => {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-gray-100">
      <div className="flex h-[280px] md:h-[400px]">
        {/* Large image on left (58%) */}
        <div className="w-[58%] relative overflow-hidden">
          <img
            src={galleryImages[imgIdx]}
            alt=""
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {/* Navigation arrows */}
          {imgIdx > 0 && (
            <button
              onClick={() => setImgIdx(i => i - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {imgIdx < totalImages - 1 && (
            <button
              onClick={() => setImgIdx(i => i + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {/* Counter */}
          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] font-black px-2 py-1 rounded-lg">
            {imgIdx + 1} / {totalImages}
          </div>
        </div>

        {/* Small images grid on right (42%) */}
        <div className="w-[42%] grid grid-cols-2 grid-rows-2 gap-1">
          {galleryImages.slice(1, 5).map((src, i) => (
            <button
              key={i}
              onClick={() => setImgIdx(i + 1)}
              className={cn(
                "relative overflow-hidden transition-all",
                imgIdx === i + 1 ? "ring-2 ring-inset ring-primary" : "opacity-90 hover:opacity-100"
              )}
            >
              <img src={src} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
          {/* 5th image with "Show all media" button */}
          <button
            onClick={onOpenGallery}
            className="relative overflow-hidden group"
          >
            <img src={galleryImages[4] || galleryImages[0]} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
              <div className="text-white text-center">
                <Maximize2 className="w-5 h-5 mx-auto mb-1" />
                <span className="text-[10px] font-black">ดูรูปทั้งหมด</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
