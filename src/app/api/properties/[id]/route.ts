/**
 * Property Details API
 * GET /api/properties/[id] - Get property details
 * PUT /api/properties/[id] - Update property
 * DELETE /api/properties/[id] - Delete property
 */

import { NextRequest } from 'next/server';
import { 
  apiHandler, 
  ApiResponseBuilder, 
  getRequestBody,
  ApiError 
} from '@/lib/api/response';
import { requireAuth, checkOwnership, isAdmin } from '@/lib/api/auth';
import { 
  firestoreHelpers, 
  propertyHelpers,
  Collections, 
  type Property 
} from '@/lib/db/firestore';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * GET /api/properties/[id]
 * Get property details and increment view count
 */
export const GET = apiHandler(async (req: NextRequest, context: RouteContext) => {
  const { id } = context.params;

  try {
    const property = await propertyHelpers.getPropertyById(id);

    if (!property) {
      return ApiResponseBuilder.notFound('Property');
    }

    // Increment view count (async, don't wait)
    propertyHelpers.incrementPropertyViews(id).catch(console.error);

    return ApiResponseBuilder.success(property);
  } catch (error: any) {
    console.error('Error fetching property:', error);
    throw new ApiError(500, 'FETCH_ERROR', 'Failed to fetch property', error.message);
  }
});

/**
 * PUT /api/properties/[id]
 * Update property details
 */
export const PUT = apiHandler(async (req: NextRequest, context: RouteContext) => {
  const authContext = await requireAuth(req);
  const { id } = context.params;
  const body = await getRequestBody<Partial<Property>>(req);

  try {
    // Get existing property
    const property = await propertyHelpers.getPropertyById(id);

    if (!property) {
      return ApiResponseBuilder.notFound('Property');
    }

    // Check ownership
    checkOwnership(authContext, property.ownerId);

    // Prevent changing certain fields
    const protectedFields = ['id', 'ownerId', 'createdAt', 'views', 'saves', 'inquiries'];
    protectedFields.forEach(field => {
      if (field in body) {
        delete (body as any)[field];
      }
    });

    // Update property
    await firestoreHelpers.updateDocument(Collections.PROPERTIES, id, body);

    // Fetch updated property
    const updatedProperty = await propertyHelpers.getPropertyById(id);

    return ApiResponseBuilder.success(updatedProperty);
  } catch (error: any) {
    console.error('Error updating property:', error);
    throw new ApiError(500, 'UPDATE_ERROR', 'Failed to update property', error.message);
  }
});

/**
 * DELETE /api/properties/[id]
 * Delete property
 */
export const DELETE = apiHandler(async (req: NextRequest, context: RouteContext) => {
  const authContext = await requireAuth(req);
  const { id } = context.params;

  try {
    // Get existing property
    const property = await propertyHelpers.getPropertyById(id);

    if (!property) {
      return ApiResponseBuilder.notFound('Property');
    }

    // Check ownership
    checkOwnership(authContext, property.ownerId);

    // Delete property
    await firestoreHelpers.deleteDocument(Collections.PROPERTIES, id);

    return ApiResponseBuilder.success({ id, deleted: true });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    throw new ApiError(500, 'DELETE_ERROR', 'Failed to delete property', error.message);
  }
});
