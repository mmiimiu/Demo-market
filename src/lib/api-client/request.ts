import { auth } from '@/firebase/config';
import { type ApiResponse } from './types';

export class BaseApiClient {
  protected baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  }

  /**
   * Make authenticated request
   */
  protected async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Get Firebase ID token
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseURL}/api${endpoint}`, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data.data as T;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }
}
