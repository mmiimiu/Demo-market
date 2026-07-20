import { type QRCodeResult } from './types';
import { OMISE_API_URL, getAuthHeader } from './config';

/**
 * Create a PromptPay QR code for payment
 */
export async function createPromptPayQR(
  amount: number,
  description: string,
  metadata?: Record<string, any>
): Promise<QRCodeResult> {
  if (!process.env.OMISE_SECRET_KEY) {
    const mockChargeId = `chg_mock_${Date.now()}`;
    return {
      id: mockChargeId,
      amount,
      currency: 'THB',
      scannable_code: {
        type: 'image',
        image: {
          download_uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=promptpay://transfer?amount=${amount}&charge=${mockChargeId}`,
        },
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  try {
    // Create source for PromptPay
    const sourceResponse = await fetch(`${OMISE_API_URL}/sources`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        type: 'promptpay',
        amount: String(amount * 100), // Convert to satang
        currency: 'THB',
      }),
    });

    if (!sourceResponse.ok) {
      throw new Error('Failed to create PromptPay source');
    }

    const source = await sourceResponse.json();

    // Create charge with the source
    const chargeResponse = await fetch(`${OMISE_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(amount * 100),
        currency: 'THB',
        source: source.id,
        description,
        metadata: JSON.stringify(metadata || {}),
      }),
    });

    if (!chargeResponse.ok) {
      throw new Error('Failed to create charge');
    }

    const charge = await chargeResponse.json();

    return {
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      scannable_code: charge.source.scannable_code,
      expires_at: charge.expires_at,
    };
  } catch (error: any) {
    console.error('Error creating PromptPay QR:', error);
    throw new Error(`Failed to create QR code: ${error.message}`);
  }
}

/**
 * Create a charge (for credit card payments)
 */
export async function createCharge(
  tokenId: string,
  amount: number,
  description: string,
  metadata?: Record<string, any>
): Promise<any> {
  try {
    const response = await fetch(`${OMISE_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(amount * 100),
        currency: 'THB',
        card: tokenId,
        description,
        metadata: JSON.stringify(metadata || {}),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create charge');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating charge:', error);
    throw new Error(`Failed to create charge: ${error.message}`);
  }
}

/**
 * Get charge details
 */
export async function getCharge(chargeId: string): Promise<any> {
  try {
    const response = await fetch(`${OMISE_API_URL}/charges/${chargeId}`, {
      headers: {
        'Authorization': getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get charge');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error getting charge:', error);
    throw new Error(`Failed to get charge: ${error.message}`);
  }
}
