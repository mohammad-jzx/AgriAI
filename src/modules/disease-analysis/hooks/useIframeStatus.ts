import { useState, useEffect, useCallback } from 'react';

export type IframeStatus = 'checking' | 'loading' | 'online' | 'offline' | 'error';

interface UseIframeStatusOptions {
  healthUrl?: string;
  timeout?: number;
}

export function useIframeStatus(src: string, options: UseIframeStatusOptions = {}) {
  const { healthUrl, timeout = 3500 } = options;
  const [status, setStatus] = useState<IframeStatus>('checking');
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    if (!healthUrl) {
      setStatus('loading');
      return;
    }

    setStatus('checking');
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(healthUrl, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors'
      });

      clearTimeout(timeoutId);

      if (response.ok || response.type === 'opaque') {
        setStatus('online');
      } else {
        setStatus('loading');
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setError('انتهت مهلة الاتصال');
        setStatus('loading');
      } else {
        setError('فشل الاتصال بالخدمة');
        setStatus('loading');
      }
    }
  }, [healthUrl, timeout]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const retry = useCallback(() => {
    checkHealth();
  }, [checkHealth]);

  const markOnline = useCallback(() => {
    setStatus('online');
    setError(null);
  }, []);

  const markOffline = useCallback((errorMsg?: string) => {
    setStatus('offline');
    setError(errorMsg || 'الخدمة غير متصلة');
  }, []);

  return { status, error, retry, markOnline, markOffline };
}
