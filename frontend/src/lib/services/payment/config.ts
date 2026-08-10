export const OMISE_SECRET_KEY = process.env.OMISE_SECRET_KEY || '';
export const OMISE_PUBLIC_KEY = process.env.OMISE_PUBLIC_KEY || '';
export const OMISE_API_URL = 'https://api.omise.co';

export function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(OMISE_SECRET_KEY + ':').toString('base64');
}
