import React from 'react';
import { IframeStatus } from '../hooks/useIframeStatus';

interface StatusPillProps {
  status: IframeStatus;
}

const statusConfig = {
  checking: {
    label: 'جارٍ الاتصال',
    color: 'bg-amber-500',
    textColor: 'text-amber-900',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    borderColor: 'border-amber-300 dark:border-amber-700',
    animate: true
  },
  loading: {
    label: 'جارٍ التحميل',
    color: 'bg-blue-500',
    textColor: 'text-blue-900 dark:text-blue-100',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    animate: true
  },
  online: {
    label: 'متصل',
    color: 'bg-green-500',
    textColor: 'text-green-900 dark:text-green-100',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
    animate: false
  },
  offline: {
    label: 'غير متصل',
    color: 'bg-red-500',
    textColor: 'text-red-900 dark:text-red-100',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-700',
    animate: false
  },
  error: {
    label: 'خطأ',
    color: 'bg-red-600',
    textColor: 'text-red-900 dark:text-red-100',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-700',
    animate: false
  }
};

export function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bgColor} ${config.borderColor} backdrop-blur-sm transition-all duration-300`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`w-2 h-2 rounded-full ${config.color} ${config.animate ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}
