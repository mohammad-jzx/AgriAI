import React, { useState, useCallback, useEffect } from 'react';
import { Leaf, Info } from 'lucide-react';
import { BackgroundFX } from '../components/BackgroundFX';
import { AnalysisToolbar } from '../components/AnalysisToolbar';
import { FrameShell } from '../components/FrameShell';
import { A11yBar } from '../components/A11yBar';
import { useIframeStatus } from '../hooks/useIframeStatus';
import { useHotkeys } from '../hooks/useHotkeys';
import { ANALYSIS_SOURCES } from '../config';

export function DiseaseAnalysisPage() {
  const [currentSourceId, setCurrentSourceId] = useState(ANALYSIS_SOURCES[0].id);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [copySuccess, setCopySuccess] = useState(false);

  const currentSource = ANALYSIS_SOURCES.find(s => s.id === currentSourceId) || ANALYSIS_SOURCES[0];
  const { status, error, retry, markOnline } = useIframeStatus(currentSource.src, {
    healthUrl: currentSource.healthUrl
  });

  const handleRefresh = useCallback(() => {
    retry();
    window.location.reload();
  }, [retry]);

  const handleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      const container = document.getElementById('analysis-container');
      if (container) {
        try {
          await container.requestFullscreen();
          setIsFullscreen(true);
        } catch (err) {
          console.error('فشل الدخول إلى وضع ملء الشاشة:', err);
        }
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleOpenExternal = useCallback(() => {
    window.open(currentSource.src, '_blank', 'noopener,noreferrer');
  }, [currentSource.src]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.origin + currentSource.src);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [currentSource.src]);

  const handleSourceChange = useCallback((sourceId: string) => {
    setCurrentSourceId(sourceId);
  }, []);

  const handleContrastToggle = useCallback(() => {
    setIsHighContrast(prev => !prev);
  }, []);

  const handleFontSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    const rootElement = document.documentElement;
    rootElement.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
  }, []);

  useHotkeys([
    { key: 'r', altKey: true, handler: handleRefresh },
    { key: 'f', altKey: true, handler: handleFullscreen },
    { key: 'o', altKey: true, handler: handleOpenExternal },
    { key: 'c', altKey: true, handler: handleCopyLink },
    { key: '1', altKey: true, handler: () => ANALYSIS_SOURCES[0] && handleSourceChange(ANALYSIS_SOURCES[0].id) },
    { key: '2', altKey: true, handler: () => ANALYSIS_SOURCES[1] && handleSourceChange(ANALYSIS_SOURCES[1].id) },
    { key: '3', altKey: true, handler: () => ANALYSIS_SOURCES[2] && handleSourceChange(ANALYSIS_SOURCES[2].id) }
  ]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const fontSizeClass = fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div
      id="analysis-container"
      className={`relative min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500 ${fontSizeClass} ${isHighContrast ? 'high-contrast' : ''}`}
      dir="rtl"
    >
      <BackgroundFX />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center gap-3 mb-4 group">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-green-500/50 transform group-hover:scale-110 transition-all duration-300">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent animate-gradient">
              تحليل أمراض النباتات
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            شغّل محرّك الذكاء الاصطناعي لفحص الأوراق والصور الحقلية، مع عرض النتائج داخل المنصة.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
            <Info className="w-4 h-4" />
            <span>نسخة تجريبية - Beta</span>
          </div>
        </header>

        <AnalysisToolbar
          status={status}
          sources={ANALYSIS_SOURCES}
          currentSourceId={currentSourceId}
          onSourceChange={handleSourceChange}
          onRefresh={handleRefresh}
          onFullscreen={handleFullscreen}
          onOpenExternal={handleOpenExternal}
          onCopyLink={handleCopyLink}
          onContrastToggle={handleContrastToggle}
          isHighContrast={isHighContrast}
          isFullscreen={isFullscreen}
        />

        <main>
          <FrameShell
            src={currentSource.src}
            status={status}
            error={error}
            title="تحليل أمراض النباتات"
            onRetry={retry}
            onOpenExternal={handleOpenExternal}
            onLoad={markOnline}
            isFullscreen={isFullscreen}
            isHighContrast={isHighContrast}
          />
        </main>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 space-y-2">
          <p>
            💡 <strong>تلميح:</strong> استخدم اختصارات لوحة المفاتيح للتنقل السريع (Alt+R للتحديث، Alt+F لملء الشاشة)
          </p>
          <p className="text-xs">
            🔒 جميع البيانات تُعالج محليًا ولا تُرسل إلى خوادم خارجية. خصوصيتك مهمة لنا.
          </p>
        </footer>
      </div>

      <A11yBar
        onFontSizeChange={handleFontSizeChange}
        onContrastToggle={handleContrastToggle}
        isHighContrast={isHighContrast}
      />

      {copySuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="px-6 py-3 bg-green-500 text-white rounded-2xl shadow-2xl flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span className="font-medium">تم نسخ الرابط بنجاح!</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .high-contrast {
          filter: contrast(1.2);
        }
        .high-contrast * {
          border-width: 2px !important;
        }
        .high-contrast .backdrop-blur-sm,
        .high-contrast .backdrop-blur-md {
          backdrop-filter: none !important;
        }
      `}</style>
    </div>
  );
}
