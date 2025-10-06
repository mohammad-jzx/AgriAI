import React, { useState } from 'react';
import Header from './Header';
import ImageUpload from './ImageUpload';
import Results from './Results';
import ModelInfo from './ModelInfo';
import MetricsPanel from './MetricsPanel';
import AgriAiLogoDark from '../../AgriAiLogoDark.png';
import AgriAiLogo from '../../AgriAiLogo.png';

const ImageAnalysisPage: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<string>("قرعيات");

  // قائمة أنواع النباتات المدعومة
  const supportedPlants = [
    "قرعيات",
    "طماطم",
    "خيار",
    "كوسة",
    "بطيخ",
    "شمام"
  ];

  // دالة لاكتشاف الوضع الداكن
  const isDarkMode = () => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  };

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);
    setResults(null);
    setError(null);
    
    try {
      // إرسال الصورة إلى خدمة API للتحليل
      const response = await fetch('http://localhost:5000/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageUrl,
          plant: selectedPlant, // استخدام النبات المحدد من قبل المستخدم
        }),
      });
      
      if (!response.ok) {
        throw new Error(`فشل الاتصال بالخادم: ${response.status}`);
      }
      
      const data = await response.json();
      
      // إضافة وقت الكشف
      data.timeDetected = new Date().toLocaleTimeString();
      
      setResults(data);
    } catch (err) {
      console.error('خطأ في تحليل الصورة:', err);
      setError('حدث خطأ أثناء تحليل الصورة. يرجى التأكد من تشغيل خادم API والمحاولة مرة أخرى.');
      // لا نستخدم بيانات احتياطية، بل ننتظر من المستخدم المحاولة مرة أخرى
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setResults(null);
    setIsAnalyzing(false);
    setError(null);
  };

  // إعادة التصيير عند تغيير الوضع (light/dark)
  const [_, setForceUpdate] = useState(0);
  React.useEffect(() => {
    const observer = new MutationObserver(() => setForceUpdate(v => v + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900" dir="rtl" lang="ar">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-transparent rounded-full mb-4 mx-auto">
            <img
              src={isDarkMode() ? AgriAiLogoDark : AgriAiLogo}
              alt="شعار AgriAI"
              className="w-24 h-24 object-contain rounded-full shadow"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            نظام AgriAI الذكي لتحليل أمراض النبات
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            شبكة عصبية التفافية متقدمة (CNN) للتعرف الدقيق على أمراض وآفات النباتات باستخدام الذكاء الاصطناعي ورؤية الحاسوب
          </p>
        </div>
        {/* Model Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-green-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">دقة النموذج</p>
                <p className="text-2xl font-bold text-green-600">%97.3</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-green-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">عدد الأمراض المكتشفة</p>
                <p className="text-2xl font-bold text-green-600">6</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-green-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">أنواع النباتات</p>
                <p className="text-2xl font-bold text-green-600">{supportedPlants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-green-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">زمن المعالجة</p>
                <p className="text-2xl font-bold text-green-600">1.2 ثانية</p>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image Upload */}
          <div className="lg:col-span-1">
            <ImageUpload 
              onImageUpload={handleImageUpload}
              isAnalyzing={isAnalyzing}
              onReset={resetAnalysis}
            />
            
            {/* عرض رسالة الخطأ إذا وجدت */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800">
                <p>{error}</p>
                <p className="text-sm mt-1">تم استخدام وضع الاحتياط لعرض النتائج.</p>
              </div>
            )}
          </div>
          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {uploadedImage && (
              <Results 
                image={uploadedImage}
                results={results}
                isAnalyzing={isAnalyzing}
              />
            )}
          </div>
        </div>
        {/* Model Information */}
        <ModelInfo />
        {/* Performance Metrics */}
        <MetricsPanel />
      </main>
    </div>
  );
};

export default ImageAnalysisPage; 