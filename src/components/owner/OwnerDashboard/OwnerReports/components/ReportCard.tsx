/**
 * ReportCard component for displaying KPI stats
 */

import { TrendingUp } from 'lucide-react';

interface ReportCardProps {
  label: string;
  value: string;
  trend?: string;
  colorClass: string;
  bgColorClass: string;
}

export function ReportCard({ label, value, trend, colorClass, bgColorClass }: ReportCardProps) {
  return (
    <div className={`${bgColorClass} border border-gray-200 rounded-none p-4`}>
      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-semibold text-gray-900 mt-2">{value}</p>
      {trend && (
        <p className="text-xs text-gray-500 font-medium mt-1">
          <TrendingUp className="w-3 h-3 inline mr-1 text-gray-400" />
          {trend}
        </p>
      )}
    </div>
  );
}
