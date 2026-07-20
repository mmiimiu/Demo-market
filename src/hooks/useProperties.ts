/**
 * Properties Hook - Fetch and manage properties
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import type { Property } from '@/lib/db/firestore';

interface UsePropertiesOptions {
  type?: string;
  priceMin?: number;
  priceMax?: number;
  province?: string;
  district?: string;
  bedrooms?: number;
  amenities?: string[];
  autoFetch?: boolean;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async (customParams?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        ...options,
        ...customParams,
      };

      // Convert arrays to comma-separated strings
      if (params.amenities && Array.isArray(params.amenities)) {
        params.amenities = params.amenities.join(',');
      }

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) delete params[key];
      });

      const data = await api.properties.list(params);
      setProperties(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchProperties();
    }
  }, [
    options.type,
    options.priceMin,
    options.priceMax,
    options.province,
    options.district,
    options.bedrooms,
  ]);

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
  };
}

export function useProperty(id: string | null) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProperty(null);
      return;
    }

    const fetchProperty = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.properties.get(id);
        setProperty(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  return {
    property,
    loading,
    error,
  };
}
