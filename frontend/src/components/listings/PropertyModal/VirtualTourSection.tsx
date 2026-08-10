'use client';

import React, { useState } from 'react';
import { Maximize2, ExternalLink, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualTourSectionProps {
  tourUrl: string;
  lang: 'th' | 'en' | 'cn';
}

function getEmbedUrl(url: string): string {
  if (!url) return '';
  // YouTube: convert watch?v= or youtu.be to embed
  if (url.includes('youtube.com/watch')) {
    const id = new URL(url).searchParams.get('v');
    return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
  }
  // Matterport
  if (url.includes('matterport.com')) {
    if (url.includes('/show/')) return url.replace('/show/', '/show/?m=').replace('?m=?m=', '?m=');
    return url;
  }
  // Kuula
  if (url.includes('kuula.co')) return url;
  // Generic iframe-able URL
  return url;
}

export function VirtualTourSection({ tourUrl, lang }: VirtualTourSectionProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const embedUrl = getEmbedUrl(tourUrl);
  const isTh = lang === 'th';
  const isCn = lang === 'cn';

  const label = (th: string, en: string, cn: string) => isTh ? th : isCn ? cn : en;

  if (!tourUrl) return null;

  return (
    <div className="space-y-4 pt-8 border-t border-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-gray-900 uppercase tracking-[0.15em] flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          {label('ชมห้องแบบ 360°', 'Virtual Tour 360°', '360° 虚拟看房')}
        </h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 text-xs font-black text-primary hover:text-primary/80 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            {label('เต็มจอ', 'Fullscreen', '全屏')}
          </button>
          <a
            href={tourUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {label('เปิดในหน้าใหม่', 'Open', '新窗口')}
          </a>
        </div>
      </div>

      {/* Embedded Tour */}
      <div className="relative aspect-video bg-gray-900 overflow-hidden border border-gray-200">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="xr-spatial-tracking; gyroscope; accelerometer"
          title="Virtual Tour"
          loading="lazy"
        />
        <div className="absolute inset-0 pointer-events-none border border-primary/10" />
      </div>

      <p className="text-[10px] text-gray-400 font-bold text-center">
        🎮 {label('ลากเมาส์หรือใช้นิ้วเพื่อหมุนมุมมอง', 'Drag or swipe to rotate the view', '拖动或滑动以旋转视角')}
      </p>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/80">
            <span className="text-white font-black text-sm flex items-center gap-2">
              <Video className="w-4 h-4" />
              {label('ชมห้อง 360°', 'Virtual Tour 360°', '360° 虚拟看房')}
            </span>
            <button
              onClick={() => setFullscreen(false)}
              className="text-white/60 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
            >
              ✕ {label('ปิด', 'Close', '关闭')}
            </button>
          </div>
          <iframe
            src={embedUrl}
            className="flex-1 w-full"
            allowFullScreen
            allow="xr-spatial-tracking; gyroscope; accelerometer"
            title="Virtual Tour Fullscreen"
          />
        </div>
      )}
    </div>
  );
}
