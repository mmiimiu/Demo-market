import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Bed, Bath, Square, ArrowRight, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lang, MockListing } from "./types";
import { translations } from "./translations";
import { mockListings } from "./mockData";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { PropertyModal } from "@/components/listings/PropertyModal";
import { mockProperties } from "@/lib/properties";

interface FeaturedListingsProps {
  lang: Lang;
  savedIds: number[];
  toggleSave: (id: number) => void;
}

export default function FeaturedListings({ lang, savedIds, toggleSave }: FeaturedListingsProps) {
  const text = translations[lang];
  const { ref, isVisible } = useScrollReveal(0.1);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const handleViewDetails = (listing: MockListing) => {
    // Find corresponding property from mockProperties
    const property = mockProperties.find(p => p.id === listing.id);
    if (property) {
      setSelectedProperty(property);
    }
  };

  return (
    <section ref={ref} className="py-20 px-4 bg-white">
      <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{text.featured.title}</h2>
            <p className="text-slate-500 text-sm sm:text-base leading-[1.6]">{text.featured.subtitle}</p>
          </div>
          <Link href="/listings" className="group flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-blue-600 font-semibold hover:text-blue-700 transition-colors whitespace-nowrap">
            {text.featured.viewAll} 
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {mockListings.map((listing, i) => (
            <div key={listing.id} onClick={() => handleViewDetails(listing)} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 border border-slate-100/50 hover:border-blue-200/50 cursor-pointer hover:-translate-y-1 block" style={{ transitionDelay: `${i * 100}ms` }} aria-label={`View details for ${listing.title}`}>
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-blue-600 text-white text-xs border-0 shadow-lg px-3 py-1.5 rounded-full font-semibold">{listing.tag}</Badge>
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-900">4.8</span>
                  </div>
                </div>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(listing.id); }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform hover:bg-white">
                  <Heart className={`w-5 h-5 transition-colors ${savedIds.includes(listing.id) ? "fill-red-500 text-red-500" : "text-slate-400 hover:text-red-500"}`} />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs text-white/95 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full font-medium">{listing.type}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm md:text-base leading-[1.3] group-hover:text-blue-600 transition-colors mb-1.5 tracking-tight line-clamp-1">{listing.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="tracking-[0.01em] line-clamp-1">{listing.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                    <Bed className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold">{listing.beds} {text.featured.beds}</span>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                    <Bath className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold">{listing.baths} {text.featured.baths}</span>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                    <Square className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold">{listing.sqm} {text.featured.sqm}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-lg md:text-xl font-bold text-blue-600">฿{listing.price.toLocaleString()}</span>
                    <span className="text-[10px] md:text-xs text-slate-400 font-normal ml-1">{text.featured.perMonth}</span>
                  </div>
                  <Button size="sm" className="bg-slate-100 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg font-semibold px-3 h-8 text-xs transition-all">
                    {lang === "th" ? "ดู" : "View"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          lang={lang}
          currency="THB"
          isSaved={savedIds.includes(selectedProperty.id)}
          onToggleSave={toggleSave}
          workLocation={undefined}
        />
      )}
    </section>
  );
}
