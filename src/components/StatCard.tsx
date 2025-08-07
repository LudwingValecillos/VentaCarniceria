import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subLabel?: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subLabel, colorClass }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
    <p className={`text-2xl font-bold mt-1 ${colorClass || 'text-gray-900'}`}>{value}</p>
    {subLabel && <p className={`text-xs mt-1 ${colorClass?.replace('text-', 'text-') || 'text-gray-500'}`}>{subLabel}</p>}
  </div>
);

export default React.memo(StatCard);
