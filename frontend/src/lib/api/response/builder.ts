import { NextResponse } from 'next/server';
import { type ApiResponse } from './types';

export const ApiResponseBuilder = {
  /**
   * Success response
   */
  success<T>(data: T, meta?: ApiResponse['meta']): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      meta,
    });
  },

  /**
   * Error response
   */
  error(
    statusCode: number,
    code: string,
    message: string,
    details?: any
  ): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          details,
        },
      },
      { status: statusCode }
    );
  },

  /**
   * Bad request (400)
   */
  badRequest(message: string, details?: any): NextResponse<ApiResponse> {
    return this.error(400, 'BAD_REQUEST', message, details);
  },

  /**
   * Unauthorized (401)
   */
  unauthorized(message: string = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(401, 'UNAUTHORIZED', message);
  },

  /**
   * Forbidden (403)
   */
  forbidden(message: string = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(403, 'FORBIDDEN', message);
  },

  /**
   * Not found (404)
   */
  notFound(resource: string = 'Resource'): NextResponse<ApiResponse> {
    return this.error(404, 'NOT_FOUND', `${resource} not found`);
  },

  /**
   * Conflict (409)
   */
  conflict(message: string): NextResponse<ApiResponse> {
    return this.error(409, 'CONFLICT', message);
  },

  /**
   * Rate limit exceeded (429)
   */
  rateLimitExceeded(message: string = 'Rate limit exceeded'): NextResponse<ApiResponse> {
    return this.error(429, 'RATE_LIMIT_EXCEEDED', message);
  },

  /**
   * Internal server error (500)
   */
  internalError(message: string = 'Internal server error', details?: any): NextResponse<ApiResponse> {
    return this.error(500, 'INTERNAL_ERROR', message, details);
  },

  /**
   * Validation error (422)
   */
  validationError(errors: Record<string, string[]>): NextResponse<ApiResponse> {
    return this.error(422, 'VALIDATION_ERROR', 'Validation failed', errors);
  },
};
