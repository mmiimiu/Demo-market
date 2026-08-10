import { symbols, rates } from './constants';

export const formatPrice = (priceThb: number, currency: 'THB' | 'USD' | 'CNY') => {
  const symbol = symbols[currency] || '฿';
  const rate = rates[currency] || 1;
  const converted = Math.round(priceThb * rate);
  return `${symbol}${converted.toLocaleString()}`;
};
