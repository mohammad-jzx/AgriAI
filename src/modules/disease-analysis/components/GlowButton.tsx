import React, { ReactNode } from 'react';

interface GlowButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function GlowButton({
  onClick,
  icon,
  label,
  shortcut,
  disabled = false,
  variant = 'secondary'
}: GlowButtonProps) {
  const baseClasses = 'relative group px-4 py-2.5 rounded-2xl font-medium transition-all duration-300 transform backdrop-blur-sm';

  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-green-500/50'
    : 'bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500';

  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const activeClasses = !disabled ? 'hover:scale-105 active:scale-95 hover:shadow-xl' : '';

  const title = shortcut ? `${label} (${shortcut})` : label;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? disabledClasses : activeClasses}`}
      aria-label={label}
      title={title}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">{icon}</span>
        <span className="hidden sm:inline text-sm">{label}</span>
      </div>

      {!disabled && variant === 'secondary' && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {shortcut && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {shortcut}
        </span>
      )}
    </button>
  );
}
