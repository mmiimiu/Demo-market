/**
 * PropertyDetail component
 * Full property details page with images, info, and actions
 */

'use client';

import { MapPin, Bed, Bath, Maximize2, Star, Share2, Heart, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PropertyDetailProps } from './types';

export default function PropertyDetail({ property, onContactAgent, onBookViewing, onSave }: PropertyDetailProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.name}</h1>
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="w-4 h-4" />
            <span>{property.location}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onSave}>
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative h-96 bg-slate-100 rounded-lg overflow-hidden">
          <img
            src={property.img}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {property.photos?.slice(0, 4).map((photo, index) => (
            <div key={index} className="relative h-48 bg-slate-100 rounded-lg overflow-hidden">
              <img
                src={photo}
                alt={`${property.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Property Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold text-slate-900">
                ฿{formatPrice(property.price)}
                <span className="text-lg font-normal text-slate-500">/mo</span>
              </div>
              {property.stars > 0 && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-lg font-medium">{property.stars}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <Bed className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <div className="text-2xl font-bold text-slate-900">{property.bed}</div>
                <div className="text-sm text-slate-500">Bedrooms</div>
              </div>
              <div className="text-center">
                <Bath className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <div className="text-2xl font-bold text-slate-900">{property.bath}</div>
                <div className="text-sm text-slate-500">Bathrooms</div>
              </div>
              <div className="text-center">
                <Maximize2 className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                <div className="text-2xl font-bold text-slate-900">{property.sqm}</div>
                <div className="text-sm text-slate-500">Sq. Meters</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Description</h2>
            <p className="text-slate-600 leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Location</h2>
            <div className="space-y-2 text-slate-600">
              {property.nearestBTS && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Nearest BTS:</span>
                  <span>{property.nearestBTS}</span>
                </div>
              )}
              {property.nearestMRT && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Nearest MRT:</span>
                  <span>{property.nearestMRT}</span>
                </div>
              )}
              {property.distanceToBTS && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Distance to BTS:</span>
                  <span>{property.distanceToBTS}m</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Agent</h3>
            
            {property.assignedAgentId && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-500 mb-1">Assigned Agent</div>
                <div className="font-medium text-slate-900">Agent ID: {property.assignedAgentId}</div>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={onContactAgent} className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Contact Agent
              </Button>
              <Button onClick={onBookViewing} variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Book Viewing
              </Button>
            </div>

            {property.agentCommissionRate && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                Agent Commission: {property.agentCommissionRate}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
