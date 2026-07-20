import { OMISE_API_URL, getAuthHeader } from './config';

/**
 * Create a transfer (payout to agent/owner)
 */
export async function createTransfer(
  recipientId: string,
  amount: number,
  metadata?: Record<string, any>
): Promise<any> {
  try {
    const response = await fetch(`${OMISE_API_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(amount * 100),
        recipient: recipientId,
        metadata: JSON.stringify(metadata || {}),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create transfer');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating transfer:', error);
    throw new Error(`Failed to create transfer: ${error.message}`);
  }
}

/**
 * Create a recipient (for agent/owner to receive payouts)
 */
export async function createRecipient(
  name: string,
  email: string,
  type: 'individual' | 'corporation',
  bankAccount: {
    brand: string;
    number: string;
    name: string;
  }
): Promise<any> {
  try {
    const response = await fetch(`${OMISE_API_URL}/recipients`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        name,
        email,
        type,
        bank_account: JSON.stringify(bankAccount),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create recipient');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating recipient:', error);
    throw new Error(`Failed to create recipient: ${error.message}`);
  }
}
