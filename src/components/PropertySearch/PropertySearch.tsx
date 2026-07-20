/**
 * PropertySearch component
 * Search form with filters for properties
 */

'use client';

import { useState } from 'react';
import { Search, MapPin, DollarSign, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PropertySearchProps } from './types';
import type { PropertySearchParams, PropertyType } from '@/lib/types/property';

export default function PropertySearch({ onSearch, initialParams }: PropertySearchProps) {
  const [params, setParams] = useState<Partial<PropertySearchParams>>(initialParams || {});

  const handleSearch = () => {
    onSearch({
      ...params,
      page: params.page || 1,
      limit: params.limit || 20,
      sort: params.sort || 'newest',
    } as PropertySearchParams);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="location"
              placeholder="Bangkok, Sukhumvit..."
              className="pl-10"
              value={params.location || ''}
              onChange={(e) => setParams({ ...params, location: e.target.value })}
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select
            value={params.property_type?.[0] || 'all'}
            onValueChange={(value) => setParams({ ...params, property_type: [value as PropertyType] })}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range (THB)</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Min"
                type="number"
                className="pl-10"
                value={params.min_price || ''}
                onChange={(e) => setParams({ ...params, min_price: Number(e.target.value) })}
              />
            </div>
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Max"
                type="number"
                className="pl-10"
                value={params.max_price || ''}
                onChange={(e) => setParams({ ...params, max_price: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Select
            value={params.bedrooms?.toString() || 'any'}
            onValueChange={(value) => setParams({ ...params, bedrooms: value === 'any' ? undefined : Number(value) })}
          >
            <SelectTrigger id="bedrooms">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSearch} className="gap-2">
          <Search className="w-4 h-4" />
          Search Properties
        </Button>
      </div>
    </div>
  );
}
