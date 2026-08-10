/**
 * Nearby BTS API
 * POST /api/maps/nearby-bts - Find nearby BTS/MRT stations
 */

import { NextRequest } from 'next/server';
import { apiHandler, ApiResponseBuilder, getRequestBody, ApiError } from '@/lib/api/response';
import { MapsService, type Coordinates } from '@/lib/services/maps';

interface NearbyBTSRequest {
  coordinates: Coordinates;
  maxDistance?: number; // meters
}

/**
 * POST /api/maps/nearby-bts
 * Find nearby BTS/MRT stations
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const body = await getRequestBody<NearbyBTSRequest>(req);

  if (!body.coordinates || !body.coordinates.latitude || !body.coordinates.longitude) {
    throw new ApiError(400, 'MISSING_COORDINATES', 'Coordinates are required');
  }

  try {
    const maxDistance = body.maxDistance || 2000; // Default 2km
    const stations = await MapsService.findNearbyBTS(body.coordinates, maxDistance);

    return ApiResponseBuilder.success(stations);
  } catch (error: any) {
    console.error('Nearby BTS error:', error);
    throw new ApiError(500, 'NEARBY_BTS_ERROR', 'Failed to find nearby stations', error.message);
  }
});
