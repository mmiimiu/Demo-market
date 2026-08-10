import { ApiError, type ApiResponse, type PaginationParams } from './types';

/**
 * Extract and validate request body
 */
export async function getRequestBody<T = any>(req: Request): Promise<T> {
  try {
    const body = await req.json();
    return body as T;
  } catch (error) {
    throw new ApiError(400, 'INVALID_BODY', 'Invalid request body');
  }
}

/**
 * Extract and validate query parameters
 */
export function getQueryParams(req: Request): URLSearchParams {
  const url = new URL(req.url);
  return url.searchParams;
}

/**
 * Pagination helper
 */
export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit), 10))
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build pagination meta
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): ApiResponse['meta'] {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}
