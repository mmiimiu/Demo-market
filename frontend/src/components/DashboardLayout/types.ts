/**
 * DashboardLayout component types
 */

import type { DashboardTab } from '@/lib/types/dashboard';
import type { UserRole } from '@/lib/types/user';

export interface DashboardLayoutProps {
  role: UserRole;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  children: React.ReactNode;
}
