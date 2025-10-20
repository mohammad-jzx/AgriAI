import React from 'react';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface ErrorPanelProps {
  message?: string;
  onRetry: () => void;
  onOpenExternal: () => void;
}

export function ErrorPanel({ message, onRetry, onOpenExternal }: ErrorPanelProps) {
  const defaultMessage = 'الخدمة غير متصلة حاليًا. تأكد من تشغيل الخادم ثم أعد المحاولة.';

  return (
    <div className="w-full h-full min-h-[560px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-full">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            فشل الاتصال
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {message || defaultMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={onRetry}
            className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-green-500/50 transform hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label="إعادة المحاولة"
          >
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>إعادة المحاولة</span>
            </div>
          </button>

          <button
            onClick={onOpenExternal}
            className="group px-6 py-3 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 backdrop-blur-sm transform hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label="فتح في نافذة جديدة"
          >
            <div className="flex items-center justify-center gap-2">
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              <span>فتح في نافذة جديدة</span>
            </div>
          </button>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <details className="text-right">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              نصائح التشخيص
            </summary>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400 text-right list-disc list-inside">
              <li>تحقق من تشغيل خادم التحليل المحلي</li>
              <li>تأكد من إدخال عنوان URL الصحيح</li>
              <li>تحقق من إعدادات جدار الحماية</li>
              <li>جرّب إعادة تحميل الصفحة</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}
