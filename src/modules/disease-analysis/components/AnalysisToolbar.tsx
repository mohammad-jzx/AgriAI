import React from 'react';
import { RefreshCw, Maximize, ExternalLink, Copy, Monitor } from 'lucide-react';
import { StatusPill } from './StatusPill';
import { GlowButton } from './GlowButton';
import { IframeStatus } from '../hooks/useIframeStatus';
import { AnalysisSource } from '../config';

interface AnalysisToolbarProps {
  status: IframeStatus;
  sources: AnalysisSource[];
  currentSourceId: string;
  onSourceChange: (sourceId: string) => void;
  onRefresh: () => void;
  onFullscreen: () => void;
  onOpenExternal: () => void;
  onCopyLink: () => void;
  onContrastToggle: () => void;
  isHighContrast: boolean;
  isFullscreen: boolean;
}

export function AnalysisToolbar({
  status,
  sources,
  currentSourceId,
  onSourceChange,
  onRefresh,
  onFullscreen,
  onOpenExternal,
  onCopyLink,
  onContrastToggle,
  isHighContrast,
  isFullscreen
}: AnalysisToolbarProps) {
  return (
    <div
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 animate-fade-in"
      role="toolbar"
      aria-label="أدوات تحليل الأمراض"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusPill status={status} />

          {sources.length > 1 && (
            <div className="relative">
              <select
                value={currentSourceId}
                onChange={(e) => onSourceChange(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-green-400 dark:hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-pointer"
                aria-label="اختر مصدر التحليل"
              >
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
              <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <GlowButton
            onClick={onRefresh}
            icon={<RefreshCw className="w-5 h-5" />}
            label="تحديث"
            shortcut="Alt+R"
          />

          <GlowButton
            onClick={onFullscreen}
            icon={<Maximize className="w-5 h-5" />}
            label={isFullscreen ? 'خروج' : 'ملء الشاشة'}
            shortcut="Alt+F"
          />

          <GlowButton
            onClick={onOpenExternal}
            icon={<ExternalLink className="w-5 h-5" />}
            label="فتح خارجي"
            shortcut="Alt+O"
          />

          <GlowButton
            onClick={onCopyLink}
            icon={<Copy className="w-5 h-5" />}
            label="نسخ الرابط"
            shortcut="Alt+C"
          />

          <button
            onClick={onContrastToggle}
            className={`px-4 py-2.5 rounded-2xl font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm ${
              isHighContrast
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500'
            }`}
            aria-label="تبديل التباين العالي"
            aria-pressed={isHighContrast}
            title="تبديل التباين العالي"
          >
            <span className="hidden sm:inline">تباين</span>
            <span className="sm:hidden">A</span>
          </button>
        </div>
      </div>
    </div>
  );
}
