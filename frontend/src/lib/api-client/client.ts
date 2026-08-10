import { auth } from '@/firebase/config';
import { BaseApiClient } from './request';
import { type ApiResponse } from './types';

class ApiClient extends BaseApiClient {
  // Authentication
  auth = {
    getMe: () => this.request('/auth/me'),
    updateMe: (data: any) => this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onboard: (data: { role: string; profileData?: any }) => this.request('/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  // Properties
  properties = {
    list: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params)}` : '';
      return this.request(`/properties${queryString}`);
    },
    
    get: (id: string) => this.request(`/properties/${id}`),
    
    create: (data: any) => this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id: string, data: any) => this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (id: string) => this.request(`/properties/${id}`, {
      method: 'DELETE',
    }),
  };

  // Search
  search = {
    smart: (query: string, language?: string) => this.request('/search/smart', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
    }),
  };

  // Inquiries
  inquiries = {
    list: (params?: Record<string, any>) => {
      const queryString = params ? `?${new URLSearchParams(params)}` : '';
      return this.request(`/inquiries${queryString}`);
    },
    
    create: (data: any) => this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  // Payments
  payments = {
    createQR: (data: {
      amount: number;
      description: string;
      type: string;
      propertyId?: string;
      recipientId?: string;
    }) => this.request('/payments/qr', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  // Maps
  maps = {
    geocode: (address: string) => this.request('/maps/geocode', {
      method: 'POST',
      body: JSON.stringify({ address }),
    }),
    
    nearbyBTS: (coordinates: { latitude: number; longitude: number }, maxDistance?: number) =>
      this.request('/maps/nearby-bts', {
        method: 'POST',
        body: JSON.stringify({ coordinates, maxDistance }),
      }),
  };

  // Upload
  upload = {
    image: async (file: File, folder?: string, tags?: string[]) => {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      if (tags) formData.append('tags', tags.join(','));

      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;

      const response = await fetch(`${this.baseURL}/api/upload/image`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data.data;
    },
  };
}

export const api = new ApiClient();
