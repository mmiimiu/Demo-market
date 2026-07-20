import { BookingFormData, RENTAL_PERIODS } from './types';

export const calculateTotal = (formData: BookingFormData, property: { price: number }) => {
  const period = RENTAL_PERIODS.find(p => p.value === formData.rentalPeriod);
  if (period && period.months > 0) return property.price * period.months;
  if (formData.moveInDate && formData.moveOutDate) {
    const start = new Date(formData.moveInDate);
    const end = new Date(formData.moveOutDate);
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return property.price * months;
  }
  return property.price * 6;
};

export const getNewPeriodDates = (value: string, moveInDate: string) => {
  const period = RENTAL_PERIODS.find(p => p.value === value);
  if (period && period.months > 0 && moveInDate) {
    const moveIn = new Date(moveInDate);
    const moveOut = new Date(moveIn);
    moveOut.setMonth(moveOut.getMonth() + period.months);
    return moveOut.toISOString().split('T')[0];
  }
  return null;
};
