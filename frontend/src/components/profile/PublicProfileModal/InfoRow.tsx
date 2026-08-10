import React from 'react';

interface InfoRowProps {
  icon: React.ElementType;
  value: string;
}

export function InfoRow({ icon: Icon, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600 font-medium py-2 border-b border-gray-50 last:border-none">
      <div className="w-7 h-7 bg-gray-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <span className="truncate">{value}</span>
    </div>
  );
}
