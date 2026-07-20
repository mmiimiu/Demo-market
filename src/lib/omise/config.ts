export const OMISE_API_BASE = 'https://api.omise.co';

export async function omiseFetch(path: string, method = 'GET', body?: object): Promise<any> {
  const secretKey = process.env.OMISE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('OMISE_SECRET_KEY is not set in environment variables.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
    'Omise-Version': '2019-05-29',
  };

  const res = await fetch(`${OMISE_API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Omise API Error [${res.status}]: ${err.message || 'Unknown error'}`);
  }

  return res.json();
}
