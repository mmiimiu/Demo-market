import { CommuteMode } from '@/components/PrimeRentApp/types';

export function calcCommuteTime(propertyNumId: number, dest: string, mode: CommuteMode): number | null {
  if (!dest.trim()) return null;
  const seed = (propertyNumId + dest.toLowerCase().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 50;
  const bts = 8 + (seed % 15);
  const car = 12 + (seed % 25);
  const moto = Math.round(car * 0.6);
  return mode === 'bts' ? bts : mode === 'car' ? car : moto;
}
