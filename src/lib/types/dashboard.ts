/**
 * Dashboard-related types
 */

import type { UserRole } from './user';
import type { Property } from './property';

export type DashboardTab = 'overview' | 'properties' | 'bookings' | 'messages' | 'settings';

export type DashboardStat = {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
};

export type DashboardActivity = {
  id: string;
  type: 'view' | 'inquiry' | 'booking' | 'message';
  propertyId: string;
  propertyName: string;
  timestamp: Date;
  description: string;
};

export interface DashboardConfig {
  role: UserRole;
  tabs: DashboardTab[];
  stats: DashboardStat[];
  recentActivity?: DashboardActivity[];
}
