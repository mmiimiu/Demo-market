/**
 * Geocoding API
 * POST /api/maps/geocode - Convert address to coordinates
 */

import { NextRequest } from 'next/server';
import { apiHandler, ApiResponseBuilder, getRequestBody, ApiError } from '@/lib/api/response';
import { MapsService } from '@/lib/services/maps';

interface GeocodeRequest {
  address: string;
}

/**
 * POST /api/maps/geocode
 * Geocode an address to coordinates
 */
export const POST = apiHandler(async (req: NextRequest) => {
  const body = await getRequestBody<GeocodeRequest>(req);

  if (!body.address || body.address.trim().length === 0) {
    throw new ApiError(400, 'MISSING_ADDRESS', 'Address is required');
  }

  try {
    const result = await MapsService.geocode(body.address);

    if (!result) {
      return ApiResponseBuilder.notFound('Address');
    }

    return ApiResponseBuilder.success(result);
  } catch (error: any) {
    console.error('Geocoding error:', error);
    throw new ApiError(500, 'GEOCODE_ERROR', 'Failed to geocode address', error.message);
  }
});
