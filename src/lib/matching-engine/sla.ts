/**
 * คำนวณเวลาที่เหลือของ SLA (milliseconds)
 * ใช้ใน client-side countdown timer
 */
export function getSLATimeRemaining(slaDeadline: Date): {
  minutes: number;
  seconds: number;
  isExpired: boolean;
  urgencyLevel: 'normal' | 'warning' | 'critical';
} {
  const now = new Date();
  const remaining = slaDeadline.getTime() - now.getTime();

  if (remaining <= 0) {
    return { minutes: 0, seconds: 0, isExpired: true, urgencyLevel: 'critical' };
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  let urgencyLevel: 'normal' | 'warning' | 'critical' = 'normal';
  if (minutes <= 5) urgencyLevel = 'critical';
  else if (minutes <= 10) urgencyLevel = 'warning';

  return { minutes, seconds, isExpired: false, urgencyLevel };
}
