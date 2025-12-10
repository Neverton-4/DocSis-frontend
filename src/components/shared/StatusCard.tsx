import React from 'react';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  title: string;
  percentage: number;
  type: 'pending' | 'completed' | 'inProgress' | 'canceled';
}

const StatusCard: React.FC<StatusCardProps> = ({ title, percentage, type }) => {
  const colorMap = {
    pending: 'text-pending',
    completed: 'text-completed',
    inProgress: 'text-inprogress',
    canceled: 'text-canceled',
  };

  const bgColorMap = {
    pending: 'from-pending/20 to-pending/5',
    completed: 'from-completed/20 to-completed/5',
    inProgress: 'from-inprogress/20 to-inprogress/5',
    canceled: 'from-canceled/20 to-canceled/5',
  };

  const strokeColorMap = {
    pending: '#ff5757',
    completed: '#4cd964',
    inProgress: '#3b82f6',
    canceled: '#ff5757',
  };

  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dash = (percentage * circumference) / 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
      <div className="relative">
        <svg height={size} width={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColorMap[type]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-base font-bold', colorMap[type])}>{percentage}%</span>
        </div>
      </div>
      <div className="ml-2 flex-1">
        <h3 className="text-base font-bold text-gray-700">{title}</h3>
      </div>
    </div>
  );
};

export default StatusCard;