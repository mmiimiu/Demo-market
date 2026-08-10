// BookingForm — shared types & constants

export interface BookingFormProps {
  property: {
    id: number;
    name: string;
    price: number;
    type: string;
  };
  onClose: () => void;
  lang: 'th' | 'en' | 'cn';
  currency: 'THB' | 'USD' | 'CNY';
}

export interface BookingFormData {
  moveInDate: string;
  moveOutDate: string;
  rentalPeriod: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  specialRequests: string;
  paymentMethod: string;
}

export const RENTAL_PERIODS = [
  { value: '3months', months: 3 },
  { value: '6months', months: 6 },
  { value: '12months', months: 12 },
  { value: '24months', months: 24 },
  { value: 'custom', months: 0 },
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  THB: '฿',
  USD: '$',
  CNY: '¥',
};
