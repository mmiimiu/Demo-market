/**
 * Properties API - List and create properties
 * GET /api/properties - List properties with filters
 * POST /api/properties - Create new property
 */

import { NextRequest } from 'next/server';
import { 
  apiHandler, 
  ApiResponseBuilder, 
  getRequestBody, 
  getQueryParams,
  getPaginationParams,
  buildPaginationMeta,
  ApiError 
} from '@/lib/api/response';
import { requireOwnerOrAgent } from '@/lib/api/auth';
import { 
  propertyHelpers, 
  type Property,
  type PropertyType 
} from '@/lib/db/firestore';

/**
 * GET /api/properties
 * List properties with filtering and pagination
 */
export const GET = apiHandler(async (req: NextRequest) => {
  const searchParams = getQueryParams(req);
  const { page, limit, offset } = getPaginationParams(searchParams);

  const bedrooms = searchParams.get('bedrooms');
  const sqmMin = searchParams.get('sqmMin');
  const amenitiesParam = searchParams.get('amenities');

  const { properties, total } = await propertyHelpers.searchProperties({
    status: searchParams.get('status') || 'available',
    type: searchParams.get('type') as PropertyType | null,
    priceMin: parseInt(searchParams.get('priceMin') || '0', 10),
    priceMax: parseInt(searchParams.get('priceMax') || '9999999', 10),
    province: searchParams.get('province'),
    district: searchParams.get('district'),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc',
    bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
    sqmMin: sqmMin ? parseInt(sqmMin, 10) : null,
    amenities: amenitiesParam ? amenitiesParam.split(',') : null,
    petFriendly: searchParams.get('petFriendly') === 'true',
    furnished: searchParams.get('furnished') === 'true',
    limit,
    offset,
  });

  return ApiResponseBuilder.success(properties, buildPaginationMeta(page, limit, total));
});

/**
 * POST /api/properties
 * Create a new property listing
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const authContext = await requireOwnerOrAgent(req);
  const body = await getRequestBody<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>(req);

  // Validate required fields
  if (!body.name || !body.type || !body.price || !body.location) {
    throw new ApiError(400, 'MISSING_FIELDS', 'Missing required fields');
  }

  // Validate ownership
  if (body.ownerId !== authContext.uid && authContext.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'You can only create properties for yourself');
  }

  try {
    const createdProperty = await propertyHelpers.createProperty(body);
    return ApiResponseBuilder.success(createdProperty);
  } catch (error: any) {
    console.error('Error creating property:', error);
    throw new ApiError(500, 'CREATE_ERROR', 'Failed to create property', error.message);
  }
});
