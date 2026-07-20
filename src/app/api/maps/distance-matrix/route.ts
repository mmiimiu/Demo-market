/**
 * @fileOverview Distance Matrix API Endpoint
 * Route: GET /api/maps/distance-matrix
 * Query Params: ?origin=...&destination=...&mode=...
 *
 * Calculates travel distance and duration using Google Maps Distance Matrix.
 * Gracefully falls back to a deterministic seed-based calculation if Google Maps API key is missing or fails.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDistanceMatrix } from '@/lib/services/maps/commute';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const mode = (searchParams.get('mode') || 'driving') as any;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'origin and destination are required' }, { status: 400 });
    }

    // Check if Google Maps API Key is a valid key
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const isMockKey = !googleApiKey || googleApiKey.startsWith('your_') || googleApiKey === 'placeholder-api-key';

    if (isMockKey) {
      const result = calculateMockCommute(origin, destination, mode);
      return NextResponse.json({ success: true, ...result, mock: true });
    }

    const data = await getDistanceMatrix(origin, destination, mode);
    if (!data) {
      const result = calculateMockCommute(origin, destination, mode);
      return NextResponse.json({ success: true, ...result, mock: true });
    }

    return NextResponse.json({
      success: true,
      distance: data.distance,
      duration: data.duration,
    });
  } catch (error: any) {
    console.error('[distance-matrix] GET Error:', error);
    try {
      const { searchParams } = new URL(req.url);
      const origin = searchParams.get('origin') || 'Unknown';
      const destination = searchParams.get('destination') || 'Unknown';
      const mode = (searchParams.get('mode') || 'driving') as any;
      const result = calculateMockCommute(origin, destination, mode);
      return NextResponse.json({ success: true, ...result, mock: true });
    } catch {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  }
}

/**
 * Server-side seed-based mock commute calculator
 */
function calculateMockCommute(
  origin: string,
  destination: string,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit'
) {
  const combined = (origin + destination).toLowerCase();
  const seed = combined.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 50;

  let baseDuration = 10 + (seed % 20); // in minutes
  if (mode === 'walking') {
    baseDuration = baseDuration * 4;
  } else if (mode === 'bicycling') {
    baseDuration = baseDuration * 2.5;
  } else if (mode === 'transit') {
    baseDuration = 8 + (seed % 15);
  }

  return {
    distance: {
      text: `${(baseDuration * 0.4).toFixed(1)} km`,
      value: Math.round(baseDuration * 400),
    },
    duration: {
      text: `${Math.round(baseDuration)} mins`,
      value: Math.round(baseDuration * 60),
    },
  };
}
