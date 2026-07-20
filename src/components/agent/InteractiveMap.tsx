'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PinLocation {
  lat: number;
  lng: number;
  name: string;
}

interface InteractiveMapProps {
  onLocationSelect: (location: PinLocation) => void;
  initialPin?: PinLocation | null;
}

const BKK_CENTER: [number, number] = [13.7563, 100.5018];

export function InteractiveMap({ onLocationSelect, initialPin }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LeafletRef = useRef<any>(null);

  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pinInfo, setPinInfo] = useState<PinLocation | null>(initialPin || null);
  const [searchError, setSearchError] = useState('');

  // Place/move marker on map
  const placeMarker = useCallback((lat: number, lng: number, name: string) => {
    const L = LeafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);

      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        const dragName = `พิกัด: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
        setPinInfo({ lat: pos.lat, lng: pos.lng, name: dragName });
        onLocationSelect({ lat: pos.lat, lng: pos.lng, name: dragName });
      });
    }

    markerRef.current.bindPopup(`<b>${name.slice(0, 60)}</b>`).openPopup();
    const loc: PinLocation = { lat, lng, name };
    setPinInfo(loc);
    onLocationSelect(loc);
  }, [onLocationSelect]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    let mounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!mounted || !mapContainerRef.current) return;

      LeafletRef.current = L;

      // Fix default icon paths for Next.js/webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const center: [number, number] = initialPin
        ? [initialPin.lat, initialPin.lng]
        : BKK_CENTER;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Place initial pin if provided
      if (initialPin && mounted) {
        placeMarker(initialPin.lat, initialPin.lng, initialPin.name);
      }

      // Click to pin
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        placeMarker(lat, lng, `พิกัด: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });
    };

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        LeafletRef.current = null;
      }
    };
  }, []); // run once on mount

  const handleSearch = async () => {
    const q = searchText.trim();
    if (!q) return;
    setIsLoading(true);
    setSearchError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'th,en' } }
      );
      const data = await res.json();

      if (!data || data.length === 0) {
        setSearchError('ไม่พบสถานที่นี้ — ลองเปลี่ยนคำค้นหาดูครับ');
        setIsLoading(false);
        return;
      }

      const { lat, lon, display_name } = data[0];
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lon);

      // Move map then place marker
      if (mapRef.current) {
        mapRef.current.flyTo([latNum, lngNum], 16, { animate: true, duration: 1.0 });
      }
      // Small delay so flyTo starts before marker is placed
      setTimeout(() => placeMarker(latNum, lngNum, display_name), 300);

    } catch {
      setSearchError('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="flex-1 pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none shadow-sm"
          placeholder="ค้นหาสถานที่ เช่น Siam Paragon, BTS อ่อนนุช..."
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading || !searchText.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          {isLoading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          )}
          ค้นหา
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-red-500 font-semibold">{searchError}</p>
      )}

      {/* Map */}
      <div
        ref={mapContainerRef}
        style={{ height: '320px', width: '100%', zIndex: 0 }}
        className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      />

      {/* Pin info */}
      {pinInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
          <span className="text-lg mt-0.5 shrink-0">📍</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-blue-800 line-clamp-2">{pinInfo.name}</p>
            <p className="text-[10px] text-blue-500 font-medium mt-0.5">
              Lat: {pinInfo.lat.toFixed(5)}, Lng: {pinInfo.lng.toFixed(5)}
            </p>
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        💡 ค้นหาแล้วกด Enter หรือปุ่ม &quot;ค้นหา&quot; • คลิกบนแผนที่เพื่อปักหมุด • ลากหมุดเพื่อขยับตำแหน่ง
      </p>
    </div>
  );
}
