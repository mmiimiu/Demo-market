/**
 * DashboardLayout component
 * Premium layout wrapper for user dashboards with responsive sidebar and top app bar
 */

'use client';

import { Home, Building2, Calendar, MessageSquare, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import type { DashboardLayoutProps } from './types';
import type { DashboardTab } from '@/lib/types/dashboard';

const tabConfig: Record<DashboardTab, { label: string; icon: any }> = {
  overview: { label: 'Overview', icon: Home },
  properties: { label: 'Properties', icon: Building2 },
  bookings: { label: 'Bookings', icon: Calendar },
  messages: { label: 'Messages', icon: MessageSquare },
  settings: { label: 'Settings', icon: Settings },
};

export default function DashboardLayout({ role, activeTab, onTabChange, children }: DashboardLayoutProps) {
  const tabs: DashboardTab[] = ['overview', 'properties', 'bookings', 'messages', 'settings'];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
          <nav className="flex-1 space-y-0.5 p-3" role="navigation" aria-label="Dashboard navigation">
            {tabs.map((tab) => {
              const config = tabConfig[tab];
              const Icon = config.icon;
              return (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'ghost'}
                  className={`w-full justify-start transition-colors duration-200 rounded-xl ${activeTab === tab ? 'bg-[#E51D53] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                  onClick={() => onTabChange(tab)}
                  aria-current={activeTab === tab ? 'page' : undefined}
                >
                  <Icon className={`w-5 h-5 mr-3 ${activeTab === tab ? 'text-white' : 'text-gray-500'}`} />
                  {config.label}
                </Button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-gray-200">
            <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-none">
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {/* Mobile Header (Shows only on mobile) */}
          <div className="md:hidden mb-6 flex items-center justify-between">
             <h2 className="text-xl font-semibold text-gray-900">{tabConfig[activeTab].label}</h2>
          </div>
          
          <div className="max-w-7xl mx-auto scroll-reveal">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom" role="navigation" aria-label="Mobile navigation">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.slice(0, 5).map((tab) => {
            const config = tabConfig[tab];
            const Icon = config.icon;
            const isActive = activeTab === tab;
            
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${isActive ? 'text-[#E51D53]' : 'text-gray-500'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#E51D53]/10' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
