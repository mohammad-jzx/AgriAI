import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Leaf, TrendingUp, Shield } from 'lucide-react';

// دالة مساعدة آمنة للتعامل مع toFixed
function safeToFixed(value: number | null | undefined, digits: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(digits);
}

interface ResultsProps {
  image: string;
  results: any;
  isAnalyzing: boolean;
}

const Results: React.FC<ResultsProps> = ({ image, results, isAnalyzing }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'منخفض': return 'text-green-600 bg-green-100';
      case 'متوسط': return 'text-yellow-600 bg-yellow-100';
      case 'عالي': return 'text-red-600 bg-red-100';
      case 'مرتفع': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-green-100 dark:border-gray-700 p-6" dir="rtl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">نتائج التحليل</h2>
      
      {/* Image Preview */}
      <div className="mb-6">
        <img 
          src={image} 
          alt="صورة النبات المرفوعة" 
          className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
        />
      </div>

      {isAnalyzing ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <div className="w-8 h-8 border-4 border-green-600 dark:border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">جاري تحليل الصورة...</p>
          <p className="text-gray-500 dark:text-gray-400">يتم معالجة الصورة عبر شبكة عصبية تلافيفية</p>
        </div>
      ) : results ? (
        <div className="space-y-6">
          {/* Main Detection Result */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{results.disease}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(results.severity)}`}>
                شدة الإصابة: {results.severity}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 flex-row-reverse">
                <Leaf className="w-5 h-5 text-green-600 dark:text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">النبات: <strong>{results.plant}</strong></span>
              </div>
              <div className="flex items-center gap-2 flex-row-reverse">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  نسبة الثقة: <strong className={getConfidenceColor(results.confidence)}>{safeToFixed(results.confidence)}%</strong>
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(results.confidence, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Treatment Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-900/50">
              <div className="flex items-center gap-2 mb-3 flex-row-reverse">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                <h4 className="font-semibold text-red-900 dark:text-red-300">العلاج الفوري</h4>
              </div>
              <p className="text-red-800 dark:text-red-300 text-sm text-right">{results.treatment}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900/50">
              <div className="flex items-center gap-2 mb-3 flex-row-reverse">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-300">الوقاية</h4>
              </div>
              <p className="text-blue-800 dark:text-blue-300 text-sm text-right">{results.preventive}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2 flex-row-reverse">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                تم الاكتشاف في {results.timeDetected || new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                التحليل تم باستخدام نموذج MobileNetV2
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>قم برفع صورة لعرض نتائج التحليل</p>
        </div>
      )}
    </div>
  );
};

export default Results; 