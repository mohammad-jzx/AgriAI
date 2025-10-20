import React, { useRef, useState, useEffect } from 'react';
import { SkeletonPanel } from './SkeletonPanel';
import { ErrorPanel } from './ErrorPanel';
import { IframeStatus } from '../hooks/useIframeStatus';

interface FrameShellProps {
  src: string;
  status: IframeStatus;
  error: string | null;
  title: string;
  onRetry: () => void;
  onOpenExternal: () => void;
  onLoad?: () => void;
  allow?: string;
  sandbox?: string;
  isFullscreen: boolean;
  isHighContrast: boolean;
}

export function FrameShell({
  src,
  status,
  error,
  title,
  onRetry,
  onOpenExternal,
  onLoad,
  allow = 'camera; microphone; fullscreen',
  sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups',
  isFullscreen,
  isHighContrast
}: FrameShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const showSkeleton = status === 'checking' || status === 'loading' || isLoading;
  const showError = status === 'offline' || status === 'error';
  const showIframe = status === 'loading' || status === 'online';

  const containerClasses = `
    relative w-full min-h-[560px] rounded-2xl overflow-hidden
    transition-all duration-500 ease-out
    ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-280px)]'}
    ${isHighContrast ? 'ring-4 ring-gray-900 dark:ring-white' : 'ring-2 ring-gray-200 dark:ring-gray-700'}
    focus-within:ring-4 focus-within:ring-green-500
    shadow-2xl hover:shadow-green-500/20
  `;

  return (
    <div ref={containerRef} className={containerClasses}>
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 -z-10" />

      {showSkeleton && (
        <div className="absolute inset-0 z-10">
          <SkeletonPanel />
        </div>
      )}

      {showError && (
        <div className="absolute inset-0 z-10">
          <ErrorPanel message={error || undefined} onRetry={onRetry} onOpenExternal={onOpenExternal} />
        </div>
      )}

      {showIframe && (
        <>
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  جارٍ تحميل المحلل...
                </p>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={src}
            title={title}
            allow={allow}
            sandbox={sandbox}
            onLoad={handleIframeLoad}
            className={`
              w-full h-full border-0 rounded-2xl
              transition-opacity duration-500
              ${isLoading ? 'opacity-0' : 'opacity-100'}
              ${isHighContrast ? 'contrast-150' : ''}
            `}
            aria-label={title}
          />
        </>
      )}

      <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-transparent bg-gradient-to-r from-green-400 via-blue-500 to-green-400 opacity-0 hover:opacity-20 transition-opacity duration-300 -z-10"
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite linear'
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
