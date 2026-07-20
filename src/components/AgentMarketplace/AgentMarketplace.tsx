/**
 * AgentMarketplace component
 * Main marketplace for finding and assigning agents
 */

'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
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
import AgentCard from './AgentCard';
import type { AgentMarketplaceProps } from './types';
import type { AgentProfile, AgentSpecialty } from '@/lib/types/collaboration';

export default function AgentMarketplace({ onAssignAgent, initialFilter }: AgentMarketplaceProps) {
  const [filter, setFilter] = useState(initialFilter || {});
  const [agents] = useState<AgentProfile[]>([]); // TODO: Fetch from API

  const handleSearch = () => {
    // TODO: Apply filters and fetch agents
    console.log('Searching with filter:', filter);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Find an Agent</h1>
        <p className="text-slate-600">Browse verified agents to help manage your properties</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Bangkok, Sukhumvit..."
              value={filter.location || ''}
              onChange={(e) => setFilter({ ...filter, location: e.target.value })}
            />
          </div>

          {/* Specialty */}
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Select
              value={filter.specialties?.[0] || 'all'}
              onValueChange={(value) => setFilter({ ...filter, specialties: [value as AgentSpecialty] })}
            >
              <SelectTrigger id="specialty">
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Min Rating</Label>
            <Select
              value={filter.min_rating?.toString() || '0'}
              onValueChange={(value) => setFilter({ ...filter, min_rating: Number(value) })}
            >
              <SelectTrigger id="rating">
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button onClick={handleSearch} className="w-full gap-2">
              <Search className="w-4 h-4" />
              Search Agents
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Available Agents {agents.length > 0 && `(${agents.length})`}
          </h2>
        </div>

        {agents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-slate-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No agents found</h3>
            <p className="text-slate-500">Try adjusting your filters to find more agents</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onAssign={() => onAssignAgent?.(agent.id)}
                onViewProfile={() => console.log('View profile:', agent.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
