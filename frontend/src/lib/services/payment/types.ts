export interface OmiseCharge {
  amount: number; // in satang (1 THB = 100 satang)
  currency: string;
  description: string;
  metadata?: Record<string, any>;
  return_uri?: string;
}

export interface OmiseSource {
  type: 'promptpay' | 'internet_banking_bay' | 'internet_banking_scb';
  amount: number;
  currency: string;
}

export interface QRCodeResult {
  id: string;
  amount: number;
  currency: string;
  scannable_code: {
    type: string;
    image: {
      download_uri: string;
    };
  };
  expires_at: string;
}
