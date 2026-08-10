/**
 * PropertyCard component
 * Displays a property listing with premium glassmorphism and scale hover
 */

'use client';

import React from 'react';
import { MapPin, Bed, Bath, Maximize2, Star } from 'lucide-react';
import type { PropertyCardProps } from './types';

export default function PropertyCard({ property, onClick, showAgentInfo = false }: PropertyCardProps) {
  const [imgError, setImgError] = React.useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  return (
    <div
      onClick={onClick}
      className="glass-card premium-card-hover rounded-2xl cursor-pointer overflow-hidden relative group flex flex-col"
    >
      {/* Image with overlay gradient */}
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        {imgError ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Image not available</p>
            </div>
          </div>
        ) : (
          <img
            src={property.img}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        )}
        {property.badge && (
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg border border-white/20">
              {property.badge}
            </span>
          </div>
        )}
        {property.boosted && (
          <div className="absolute top-4 right-4 z-20">
            <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg border border-white/20">
              Boosted
            </span>
          </div>
        )}
        
        {/* Bottom image content (Location & Rating) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
          <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium drop-shadow-md">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="line-clamp-1 drop-shadow">{property.location}</span>
          </div>
          {property.stars > 0 && (
            <div className="flex items-center gap-1 text-amber-400 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold text-white">{property.stars}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 text-sm">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Bed className="w-4 h-4 text-primary" />
              <span className="font-medium">{property.bed}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Bath className="w-4 h-4 text-primary" />
              <span className="font-medium">{property.bath}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
              <Maximize2 className="w-4 h-4 text-primary" />
              <span className="font-medium">{property.sqm} m²</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rent per month</span>
            <div className="text-xl font-extrabold text-primary">
              ฿{formatPrice(property.price)}
            </div>
          </div>
          {showAgentInfo && property.assignedAgentId && (
            <div className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
              Agent Assigned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
