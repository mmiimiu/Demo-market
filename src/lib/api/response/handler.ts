import { NextResponse } from 'next/server';
import { type ApiResponse, ApiError } from './types';
import { ApiResponseBuilder } from './builder';

/**
 * Async handler wrapper for API routes
 * Handles errors and provides consistent error responses
 */
export function apiHandler<T = any>(
  handler: (req: any, context?: any) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (req: any, context?: any): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error('API Error:', error);

      // Handle ApiError
      if (error instanceof ApiError) {
        return ApiResponseBuilder.error(
          error.statusCode,
          error.code,
          error.message,
          error.details
        );
      }

      // Handle Firebase Auth errors
      if (error.code?.startsWith('auth/')) {
        return ApiResponseBuilder.unauthorized(error.message);
      }

      // Handle Firestore permission errors
      if (error.code === 'permission-denied') {
        return ApiResponseBuilder.forbidden('Permission denied');
      }

      // Default internal error
      return ApiResponseBuilder.internalError(
        process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message
      );
    }
  };
}
