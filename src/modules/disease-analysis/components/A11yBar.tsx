import React, { useState } from 'react';
import { Settings, Keyboard, Type } from 'lucide-react';

interface A11yBarProps {
  onFontSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onContrastToggle: () => void;
  isHighContrast: boolean;
}

export function A11yBar({ onFontSizeChange, onContrastToggle, isHighContrast }: A11yBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    onFontSizeChange(size);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="ltr">
      {isOpen && (
        <div className="mb-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-64 space-y-4 animate-fade-in">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Type className="w-4 h-4" />
              حجم الخط
            </label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                    fontSize === size
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  aria-label={`حجم الخط ${size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}`}
                >
                  {size === 'small' ? 'ص' : size === 'medium' ? 'م' : 'ك'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={onContrastToggle}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isHighContrast
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label="تبديل التباين العالي"
              aria-pressed={isHighContrast}
            >
              <span className="text-sm">تباين عالٍ</span>
              <div className={`w-10 h-6 rounded-full transition-colors ${isHighContrast ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${isHighContrast ? 'mr-5' : 'mr-1'}`} />
              </div>
            </button>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <details>
              <summary className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors">
                <Keyboard className="w-4 h-4" />
                <span>اختصارات لوحة المفاتيح</span>
              </summary>
              <ul className="mt-3 space-y-1.5 text-xs text-gray-600 dark:text-gray-400 pr-6">
                <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Alt+R</kbd> تحديث</li>
                <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Alt+F</kbd> ملء الشاشة</li>
                <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Alt+O</kbd> فتح خارجي</li>
                <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">Alt+C</kbd> نسخ الرابط</li>
                <li><kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">ESC</kbd> الخروج من ملء الشاشة</li>
              </ul>
            </details>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl hover:shadow-green-500/50 transform hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="إعدادات إمكانية الوصول"
        aria-expanded={isOpen}
      >
        <Settings className={`w-6 h-6 ${isOpen ? 'rotate-90' : ''} transition-transform duration-300`} />
      </button>
    </div>
  );
}
