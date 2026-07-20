import { where, orderBy, limit, increment, type QueryConstraint } from 'firebase/firestore';
import { type Property, type PropertyType } from './types';
import { Collections } from './collections';
import { firestoreHelpers } from './helpers';

export interface PropertyQueryParams {
  status?: string;
  type?: PropertyType | null;
  priceMin?: number;
  priceMax?: number;
  province?: string | null;
  district?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  bedrooms?: number | null;
  sqmMin?: number | null;
  amenities?: string[] | null;
  petFriendly?: boolean;
  furnished?: boolean;
  limit?: number;
  offset?: number;
}

export const propertyHelpers = {
  getPropertyById: async (propertyId: string): Promise<Property | null> => {
    return firestoreHelpers.getDocById<Property>(Collections.PROPERTIES, propertyId);
  },

  getAvailableProperties: async (maxResults: number = 50): Promise<Property[]> => {
    return firestoreHelpers.getDocsWithQuery<Property>(
      Collections.PROPERTIES,
      [
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      ]
    );
  },

  getPropertiesByOwner: async (ownerId: string): Promise<Property[]> => {
    return firestoreHelpers.getDocsWithQuery<Property>(
      Collections.PROPERTIES,
      [
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      ]
    );
  },

  incrementPropertyViews: async (propertyId: string): Promise<void> => {
    await firestoreHelpers.updateDocument(Collections.PROPERTIES, propertyId, {
      views: increment(1)
    });
  },

  searchProperties: async (params: PropertyQueryParams): Promise<{ properties: Property[]; total: number }> => {
    const constraints: QueryConstraint[] = [];

    const status = params.status || 'available';
    constraints.push(where('status', '==', status));

    if (params.type) {
      constraints.push(where('type', '==', params.type));
    }

    const priceMin = params.priceMin ?? 0;
    const priceMax = params.priceMax ?? 9999999;
    if (priceMin > 0) {
      constraints.push(where('price', '>=', priceMin));
    }
    if (priceMax < 9999999) {
      constraints.push(where('price', '<=', priceMax));
    }

    if (params.province) {
      constraints.push(where('location.province', '==', params.province));
    }

    if (params.district) {
      constraints.push(where('location.district', '==', params.district));
    }

    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    constraints.push(orderBy(sortBy, sortOrder));

    // Fetch up to 1000 properties and then apply client-side filters
    constraints.push(limit(1000));

    const properties = await firestoreHelpers.getDocsWithQuery<Property>(
      Collections.PROPERTIES,
      constraints
    );

    let filtered = properties;

    if (params.bedrooms) {
      filtered = filtered.filter(p => p.details.bedrooms >= params.bedrooms!);
    }

    if (params.sqmMin) {
      filtered = filtered.filter(p => p.details.sqm >= params.sqmMin!);
    }

    if (params.amenities && params.amenities.length > 0) {
      filtered = filtered.filter(p =>
        params.amenities!.every(amenity => p.amenities.includes(amenity as any))
      );
    }

    if (params.petFriendly) {
      filtered = filtered.filter(p => p.details.petFriendly);
    }

    if (params.furnished) {
      filtered = filtered.filter(p => p.details.furnished);
    }

    const total = filtered.length;
    const offset = params.offset ?? 0;
    const limitCount = params.limit ?? 10;
    const paginated = filtered.slice(offset, offset + limitCount);

    return { properties: paginated, total };
  },

  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property | null> => {
    const data: any = {
      ...propertyData,
      views: 0,
      saves: 0,
      inquiries: 0,
      boosted: false,
      verified: false,
      status: 'draft',
    };

    const propertyId = await firestoreHelpers.addDocument(Collections.PROPERTIES, data);
    return firestoreHelpers.getDocById<Property>(Collections.PROPERTIES, propertyId);
  }
};
