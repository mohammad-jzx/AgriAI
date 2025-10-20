import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, Wifi, WifiOff, Droplets, Thermometer, Gauge, Beaker, Leaf, TrendingUp, BarChart3, History, Settings, Mic, Wrench, Moon, Sun, MapPin, CalendarCheck, Hammer, Zap, TestTube, Cloud } from 'lucide-react';
import SensorCard from './components/SensorCard';
import SensorStatus from './components/SensorStatus';
import CropSelector from './components/CropSelector';
import RecommendationPanel from './components/RecommendationPanel';
import DataHistory from './components/DataHistory';
import ManualInput from './components/ManualInput';
import { useSensorData } from './hooks/useSensorData';
import { generateRecommendations } from './utils/recommendations';
import { crops as cropDB } from './data/crops';
import { plannerCrops } from './data/plannerCrops';
import { loadCrops, saveCrops } from './utils/storage';
import type { SensorData, Crop } from './types';
import VoiceAssistant from './components/VoiceAssistant';
import InputForm from './components/InputForm';
import ResultsSection from './components/ResultsSection';
import { recommendCrops } from './utils/cropRecommendationEngine';
import type { EnvironmentalInputs, CropRecommendation } from './types/crop';
import StatCard from './components/StatCard';
import MaturityAnalysis from './components/MaturityAnalysis';
import VoiceToText from './components/VoiceToText';
import Tutorial from './components/Tutorial';
import { isFirstVisit, markTutorialCompleted } from './utils/tutorialStorage';

// دالة مساعدة آمنة للتعامل مع toFixed
function safeToFixed(value: number | null | undefined, digits: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  return value.toFixed(digits);
}

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'monitoring' | 'crops' | 'image' | 'analysis' | 'history' | 'audio' | 'planner' | 'maturity'>('home');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioText, setAudioText] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [alertSent, setAlertSent] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [statsAnimationPlayed, setStatsAnimationPlayed] = useState(false);
  const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);
  const [plannerSearched, setPlannerSearched] = useState(false);
  // حالة للتحكم في عرض الدليل التعريفي
  const [showTutorial, setShowTutorial] = useState(isFirstVisit());
  
  const { currentData, history, addData, isSimulating, startSimulation, stopSimulation } = useSensorData();

  // Geolocation state
  const [location, setLocation] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null });
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoTried, setGeoTried] = useState(false);

  // Weather state
  const WEATHER_API_KEY = '80e2b470756850c783214fbad8b06675';
  const [weather, setWeather] = useState<{ temp: number | null; humidity: number | null; desc: string | null } | null>(null);

  // Crop Planner states (moved after weather/currentData)
  const [plannerInputs, setPlannerInputs] = useState<EnvironmentalInputs>({
    ph: 7,
    temperature: 25,
    rainfall: 500,
    soilType: '',
    currentSeason: '',
    previousCrop: ''
  });
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);

  // نصوص الوجه الخلفي لكل بطاقة
  const sensorBackTexts = [
    'درجة حرارة التربة تؤثر على نمو الجذور وامتصاص العناصر الغذائية. القيم غير الطبيعية قد تعيق النمو.',
    'رطوبة التربة تؤثر على امتصاص العناصر الغذائية. القيم المنخفضة قد تسبب جفاف النبات والذبول.',
    'الرطوبة الجوية تؤثر على معدل النتح وامتصاص الماء. القيم العالية قد تزيد من خطر الأمراض الفطرية.',
    'حموضة التربة (pH) تحدد قدرة النبات على امتصاص العناصر. القيم خارج النطاق المثالي قد تمنع الامتصاص.'
  ];
  const nutrientBackTexts = [
    'النيتروجين (N) ضروري لنمو الأوراق. نقصه يسبب اصفرار الأوراق، وزيادته تؤدي لنمو مفرط وضعف الثمار.',
    'الفسفور (P) مهم لتكوين الجذور والثمار. نقصه يبطئ النمو ويضعف الإنتاجية.',
    'البوتاسيوم (K) يعزز مقاومة النبات للأمراض ويساعد في نقل الماء. نقصه يسبب ضعف النمو.',
    'الموصلية الكهربائية تعكس تركيز الأملاح في التربة. القيم العالية قد تضر الجذور.'
  ];

  const nutrientIcons = [
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 text-2xl font-bold">N</span>,
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold">P</span>,
    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-700 text-2xl font-bold">K</span>
  ];

  // Load crops on mount
  useEffect(() => {
    const savedCrops = loadCrops();
    if (savedCrops.length > 0) {
      setCrops(savedCrops);
    } else {
      setCrops(cropDB);
      saveCrops(cropDB);
    }
  }, []);

  // تحديث حالة الاتصال بناءً على وجود بيانات
  useEffect(() => {
    // إذا كان هناك بيانات حالية وليست فارغة، اعتبر المستشعر متصلاً
    if (currentData && 
        (currentData.temperature !== null || 
         currentData.humidity !== null || 
         currentData.ph !== null || 
         currentData.nitrogen !== null || 
         currentData.phosphorus !== null || 
         currentData.potassium !== null || 
         currentData.conductivity !== null)) {
      setIsConnected(true);
      // ابدأ المحاكاة إذا لم تكن قيد التشغيل بالفعل
      if (!isSimulating) {
        startSimulation();
      }
    } else {
      // إذا لم تكن هناك بيانات، اعتبر المستشعر غير متصل
      setIsConnected(false);
      // أوقف المحاكاة
      if (isSimulating) {
        stopSimulation();
      }
    }
  }, [currentData, isSimulating, startSimulation, stopSimulation]);

  // تعديل دالة الاتصال للسماح بالمحاكاة فقط
  const handleConnect = () => {
    startSimulation();
  };

  // تعديل دالة قطع الاتصال لإيقاف المحاكاة
  const handleDisconnect = () => {
    stopSimulation();
    setIsConnected(false);
  };

  const handleManualData = (data: SensorData) => {
    addData(data);
    setShowManualInput(false);
  };

  const handleAddCrop = (newCrop: Crop) => {
    const updatedCrops = [...crops, newCrop];
    setCrops(updatedCrops);
    saveCrops(updatedCrops);
  };

  const handleSelectCrop = (crop: Crop) => {
    if (selectedCrop && selectedCrop.id === crop.id) {
      setSelectedCrop(null);
    } else {
      setSelectedCrop(crop);
    }
  };

  // دالة حذف المحصول
  const handleDeleteCrop = (cropToDelete: Crop) => {
    const updatedCrops = crops.filter(crop => crop.id !== cropToDelete.id);
    setCrops(updatedCrops);
    saveCrops(updatedCrops);
    if (selectedCrop && selectedCrop.id === cropToDelete.id) {
      setSelectedCrop(null);
    }
  };

  async function sendCriticalAlert(message: string) {
    await fetch('http://localhost:4000/send-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    setAlertSent(true);
  }

  useEffect(() => {
    try {
      if (
        currentData &&
        currentData.temperature !== null &&
        currentData.temperature !== undefined &&
        currentData.temperature > 1 &&
        !alertSent
      ) {
        sendCriticalAlert('⚠️ تنبيه: درجة الحرارة تجاوزت الحد المسموح! شوف مزرعتك');
      }
    } catch (error) {
      console.error("خطأ في معالجة التنبيهات:", error);
    }
  }, [currentData, alertSent]);

  function suggestCrops() {
    const ph = plannerInputs.ph;
    const temp = plannerInputs.temperature;
    const rain = plannerInputs.rainfall;
    const soil = plannerInputs.soilType;
    // فلترة المحاصيل حسب المدخلات
    const suitable = cropDB.filter(crop =>
      (ph !== null && ph >= crop.phMin && ph <= crop.phMax) &&
      (temp !== null && temp >= crop.tempMin && temp <= crop.tempMax) &&
      (rain !== null && rain >= crop.humidityMin && rain <= crop.humidityMax)
      // يمكن إضافة شرط نوع التربة إذا أضفته في قاعدة البيانات
    );
    // جدول تناوب بسيط: نفس المحاصيل المقترحة بترتيب عشوائي أو ثابت
    const rotation = suitable;
    setRecommendations(recommendCrops(suitable, plannerInputs));
  }

  function requestLocation() {
    setGeoTried(true);
    if (!navigator.geolocation) {
      setGeoError('المتصفح لا يدعم تحديد الموقع الجغرافي');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setGeoError(null);
      },
      (error) => {
        setGeoError('لن نستطيع معرفة تفاصيل حول الطقس في منطقتك!');
        // Use a default location (Damascus, Syria as an example)
        setLocation({ lat: 33.5138, lon: 36.2765 });
      }
    );
  }

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line
  }, []);

  // Fetch weather when location is available
  useEffect(() => {
    if (location.lat && location.lon) {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&lang=ar&appid=${WEATHER_API_KEY}`)
        .then(res => res.json())
        .then(data => {
          setWeather({
            temp: data.main?.temp !== undefined ? Number(data.main.temp) : null,
            humidity: data.main?.humidity !== undefined ? Number(data.main.humidity) : null,
            desc: data.weather?.[0]?.description ?? null
          });
        })
        .catch(error => {
          console.error("خطأ في جلب بيانات الطقس:", error);
          // Set default weather data if fetch fails
          setWeather({
            temp: 25, // Number literal is fine here
            humidity: 60, // قيمة افتراضية للرطوبة الجوية
            desc: "غير متوفر"
          });
        });
    } else {
      // Set default weather if no location
      setWeather({
        temp: 25, // Number literal is fine here
        humidity: 60, // قيمة افتراضية للرطوبة الجوية
        desc: "غير متوفر"
      });
    }
  }, [location]);

  // تحديث القيم الافتراضية عند توفر بيانات المستشعر أو الطقس
  useEffect(() => {
    try {
      setPlannerInputs(prev => ({
        ...prev,
        ph: currentData && currentData.ph !== null && currentData.ph !== undefined && !isNaN(Number(currentData.ph)) ? Number(currentData.ph) : Number(prev.ph),
        temperature: weather && weather.temp !== null && weather.temp !== undefined && !isNaN(Number(weather.temp)) ? Number(weather.temp) : Number(prev.temperature),
      }));
    } catch (error) {
      console.error("خطأ في تحديث القيم الافتراضية:", error);
    }
  }, [currentData, weather]);

  // إذا تم فصل المستشعر، امسح القيم من النموذج
  useEffect(() => {
    if (!isConnected) {
      setPlannerInputs(prev => ({
        ...prev,
        ph: 7,
        temperature: 25,
      }));
    }
  }, [isConnected]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimationPlayed) {
            setStatsVisible(true);
            setStatsAnimationPlayed(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => {
      if (statsElement) {
        observer.unobserve(statsElement);
      }
    };
  }, [statsAnimationPlayed]);

  // إضافة useEffect لإعادة ضبط حالة الأنيميشن عند تغيير التبويب النشط
  useEffect(() => {
    // إذا كان التبويب النشط ليس الصفحة الرئيسية، نعيد ضبط حالة تشغيل الأنيميشن فقط
    if (activeTab !== 'home') {
      setStatsAnimationPlayed(false);
      // لا نعيد ضبط statsVisible هنا لتجنب إخفاء المحتوى
    } else {
      // عند العودة للصفحة الرئيسية، نتأكد من ظهور الإحصائيات
      setStatsVisible(true);
    }
  }, [activeTab]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // دالة لتعيين أن المستخدم قد أكمل الدليل التعريفي
  const handleTutorialComplete = () => {
    markTutorialCompleted();
    setShowTutorial(false);
    // إعادة تحميل الصفحة بعد إكمال الدليل التعريفي لإعادة تعيين شريط التنقل
    window.location.reload();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 theme-transition" dir="rtl">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 shadow-lg relative">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* زر الوضع الليلي */}
              <button
                onClick={toggleDarkMode}
                title={darkMode ? "وضع نهاري" : "وضع ليلي"}
                className="p-3 rounded-full bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
              </button>

              {/* شعار ومعلومات النظام */}
              <div className="text-center flex-1 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-3 mb-2 transform hover:scale-105 transition-all duration-300">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg">
                    <Leaf className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">AgriAI</h1>
                </div>
                <h2 className="text-xl text-gray-700 dark:text-gray-300 font-medium mb-1">نظام الاستشعار الزراعي الذكي</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>مستشعر RS485 7-in-1 للتربة</span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>تحليل ذكي</span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span>توصيات متقدمة</span>
                </div>
              </div>

              {/* عنصر فارغ للمحاذاة + إشعار الموقع إذا كان هناك خطأ */}
              <div className="w-[44px] relative">
                {geoError && (
                  <div className="absolute top-0 right-0 cursor-pointer group">
                    <MapPin className="w-6 h-6 text-yellow-500" />
                    <div className="hidden group-hover:block absolute top-full right-0 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-lg shadow-lg z-50 w-64 mt-2 text-sm">
                      <p className="font-bold text-yellow-600 mb-1">ملاحظة:</p>
                      <p>{geoError}</p>
                      {/* زر لإعادة المحاولة */}
                      <button 
                        onClick={requestLocation}
                        className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* زخرفة خط التقسيم مع تأثير متدرج */}
          <div className="h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="w-full">
              {/* Main Content */}
              <div>
                {/* Navigation Tabs - Nueva barra de navegación profesional */}
                <div className="bg-white dark:bg-gray-900 rounded-xl mb-6 overflow-hidden theme-transition shadow-lg">
                  <div className="px-2 py-1 flex flex-wrap justify-center relative">
                    <div className="flex overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      {[
                        { id: 'home', label: 'الصفحة الرئيسية', icon: <Settings className="w-5 h-5" /> },
                        { id: 'monitoring', label: 'المراقبة المباشرة', icon: <Activity className="w-5 h-5" />, dataTour: 'dashboard' },
                        { id: 'crops', label: 'اختيار المحصول', icon: <Leaf className="w-5 h-5" />, dataTour: 'crops' },
                        { id: 'analysis', label: 'التحليل والتوصيات', icon: <TrendingUp className="w-5 h-5" />, dataTour: 'analysis' },
                        { id: 'maturity', label: 'نضج المحصول والحصاد الذكي', icon: <CalendarCheck className="w-5 h-5" /> },
                        { id: 'image', label: 'تحليل الصور', icon: <BarChart3 className="w-5 h-5" />, dataTour: 'image-analysis' },
                        { id: 'audio', label: 'التحليل الصوتي', icon: <Mic className="w-5 h-5" />, dataTour: 'voice-assistant' },
                        { id: 'planner', label: 'تخطيط المحاصيل', icon: <Leaf className="w-5 h-5 rotate-45" />, dataTour: 'planner' },
                        { id: 'history', label: 'السجلات والتقارير', icon: <History className="w-5 h-5" />, dataTour: 'history' },
                      ].map((item, index) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as any)}
                          data-tour={item.dataTour}
                          className={`
                            nav-item relative py-4 px-5 m-1 text-center font-medium transition-all duration-300 flex flex-col items-center
                            rounded-lg animate-fade-in theme-transition
                            ${activeTab === item.id
                              ? 'text-emerald-500 dark:text-emerald-400 transform scale-105 nav-item-active'
                              : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-emerald-300'}
                            delay-${(index + 1) * 100}
                          `}
                        >
                          <div className={`
                            nav-icon-container flex justify-center items-center mb-2 p-2 rounded-full
                            ${activeTab === item.id 
                              ? 'bg-gradient-to-r from-green-500 to-green-400 text-white nav-icon-active' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}
                            transition-all duration-300
                          `}>
                            {item.icon}
                          </div>
                          <span className="text-sm">{item.label}</span>
                          {activeTab === item.id && (
                            <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full active-nav-indicator"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 theme-transition">
                  {activeTab === 'home' && (
                    <div>
                      <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2 justify-center text-center"><Settings className="w-6 h-6" /> الصفحة الرئيسية</h2>
                      <p className="mb-2 text-green-600 dark:text-green-300 font-semibold">وصف للنظام:</p>
                      <p className="mb-6 text-gray-700 dark:text-gray-200">هذا النظام يهدف إلى مراقبة وتحليل بيانات التربة والمحاصيل الزراعية باستخدام مستشعرات ذكية وتقديم توصيات متقدمة للمزارعين.</p>
                      {/* إعدادات النظام وصندوق الإحصائيات */}
                      <div className="p-4 mb-6 max-w-full w-full">
                        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2 mt-10">
                          <Settings className="w-5 h-5" />
                          إعدادات النظام
                        </h3>
                        <SensorStatus 
                          isConnected={isConnected}
                          onConnect={handleConnect}
                          onDisconnect={handleDisconnect}
                          onManualInput={() => setShowManualInput(true)}
                          hasData={currentData !== null && (
                            currentData.temperature !== null || 
                            currentData.humidity !== null || 
                            currentData.ph !== null || 
                            currentData.nitrogen !== null || 
                            currentData.phosphorus !== null || 
                            currentData.potassium !== null || 
                            currentData.conductivity !== null
                          )}
                        />
                        <div className="mt-4" id="stats-section">
                          <h4 className="text-base md:text-lg font-bold text-gray-700 dark:text-white mb-6 flex items-center gap-2 justify-center text-center mt-20">
                            <BarChart3 className="w-4 h-4" />
                            إحصائيات سريعة
                          </h4>
                          <div className={`mt-2 mb-8 transition-all duration-1500 ${statsVisible || statsAnimationPlayed ? 'animate-fadeInUp' : 'opacity-0 -translate-y-8 -translate-x-4 scale-95'}`}>
                            <div className="flex flex-wrap justify-center gap-8">
                              <StatCard
                                icon={<Thermometer />}
                                value={currentData ? (currentData.temperature !== null ? safeToFixed(currentData.temperature) + '°C' : '-') : '--'}
                                label="درجة حرارة التربة"
                                color="#22c55e"
                                delay={0}
                                shape="circle"
                              />
                              <StatCard
                                icon={<Sun />}
                                value={weather && weather.temp !== null ? safeToFixed(weather.temp) + '°C' : '--'}
                                label="درجة حرارة الجو"
                                color="#fbbf24"
                                delay={50}
                                shape="circle"
                              />
                              <StatCard
                                icon={<Cloud />}
                                value={weather && weather.humidity !== null ? safeToFixed(weather.humidity) + '%' : '--'}
                                label="الرطوبة الجوية"
                                color="#60a5fa"
                                delay={75}
                                shape="circle"
                              />
                              <StatCard
                                icon={<Droplets />}
                                value={currentData ? (currentData.humidity !== null ? safeToFixed(currentData.humidity) + '%' : '-') : '--'}
                                label="رطوبة التربة"
                                color="#38bdf8"
                                delay={100}
                                shape="circle"
                              />
                              <StatCard
                                icon={<BarChart3 />}
                                value={history ? history.length.toString() : '--'}
                                label="عدد القراءات"
                                color="#6366f1"
                                delay={200}
                                shape="circle"
                              />
                              <StatCard
                                icon={<Leaf />}
                                value={crops ? crops.length.toString() : '--'}
                                label="عدد المحاصيل"
                                color="#16a34a"
                                delay={300}
                                shape="circle"
                              />
                            </div>
                          </div>
                        </div>
                        {/* صورة AiAgent مع معلومات النظام */}
                        <div className="mt-12 flex justify-center">
                          <div 
                            className={`rounded-2xl shadow-xl p-8 max-w-lg w-full transform hover:scale-105 transition-all duration-300 cursor-pointer ${darkMode ? 'bg-gray-900' : 'animate-gradient-x'}`}
                            onClick={(e) => {
                              const card = e.currentTarget;
                              const currentTransform = card.style.transform || '';
                              if (currentTransform.includes('rotateY(180deg)')) {
                                card.style.transform = currentTransform.replace('rotateY(180deg)', 'rotateY(0deg)');
                              } else {
                                card.style.transform = currentTransform + ' rotateY(180deg)';
                              }
                            }}
                            style={{ 
                              transformStyle: 'preserve-3d',
                              transition: 'transform 0.6s ease-in-out'
                            }}
                          >
                            {/* الوجه الأمامي */}
                            <div className="flex flex-col items-center text-center backface-hidden">
                              <div className="relative mb-6">
                                <img 
                                  src={darkMode ? "/AiAgentDark.png" : "/AiAgent.png"} 
                                  alt="AgriAI Agent" 
                                  className="relative w-32 h-32 object-contain rounded-full border-4 border-green-500 dark:border-gray-700 shadow-lg"
                                />
                              </div>
                              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">AgriAI Agent</h3>
                              <p className="text-green-700 dark:text-green-200 text-lg mb-4">
                                المساعد الذكي للزراعة
                              </p>
                              
                              {/* معلومات النظام */}
                              <div className="w-full text-right">
                                <div className="text-base text-green-900 dark:text-green-100 mb-3">
                                  <span className="font-semibold">الإصدار:</span> AgriAI v2.0
                                </div>
                                <div className="text-base text-green-900 dark:text-green-100 font-semibold mb-2">المميزات:</div>
                                <ul className="space-y-2 pl-4 text-green-800 dark:text-green-200 text-sm">
                                  <li className="flex items-center gap-2"><span className="text-lg">️</span> مستشعر RS485 7-in-1</li>
                                  <li className="flex items-center gap-2"><span className="text-lg">🤖</span> تحليل ذكي للتربة</li>
                                  <li className="flex items-center gap-2"><span className="text-lg">💡</span> توصيات متقدمة</li>
                                  <li className="flex items-center gap-2"><span className="text-lg">🔄</span> مراقبة مستمرة</li>
                                  <li className="flex items-center gap-2"><span className="text-lg">🌱</span> إضافة محاصيل مخصصة</li>
                                </ul>
                              </div>
                              
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mt-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">متصل ومستعد للمساعدة</span>
                              </div>
                            </div>
                            
                            {/* الوجه الخلفي */}
                            <div 
                              className="absolute inset-0 flex flex-col items-center justify-center text-center backface-hidden"
                              style={{ transform: 'rotateY(180deg)' }}
                            >
                              <h3 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-6">Powered By</h3>
                              <img 
                                src={darkMode ? "/AgriAiLogoDark.png" : "/AgriAiLogo.png"}
                                alt="AgriAI Logo" 
                                className="w-32 h-32 object-contain mb-6 border-4 border-green-500 dark:border-green-400 rounded-full shadow-lg"
                              />
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">تطوير متقدم للزراعة الذكية</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'monitoring' && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-12 flex items-center gap-2 justify-center text-center">
                        <Activity className="w-6 h-6 text-green-600" />
                        المراقبة المباشرة للمستشعر
                      </h3>
                      
                      {!isConnected ? (
                        <div className="text-center py-12">
                          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg">المستشعر غير متصل</p>
                          <p className="text-gray-500">اضغط 'اتصال' في الشريط الجانبي لبدء المراقبة</p>
                        </div>
                      ) : currentData ? (
                        <div>
                          {/* Environmental Conditions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 overflow-visible">
                            {[
                              {
                                title: 'درجة الحرارة',
                                value: safeToFixed(currentData?.temperature) + '°C',
                                icon: <Thermometer className="w-6 h-6" />, color: 'red', range: '15-35°C', 
                                trend: currentData?.temperature !== null && currentData?.temperature !== undefined ? (currentData.temperature > 35 ? 'up' as const : currentData.temperature < 15 ? 'down' as const : undefined) : undefined,
                                back: sensorBackTexts[0]
                              },
                              {
                                title: 'الرطوبة الجوية',
                                value: weather && weather.humidity !== null ? safeToFixed(weather.humidity) + '%' : '-',
                                icon: <Cloud className="w-6 h-6" />, color: 'blue', range: '30-70%', 
                                trend: weather?.humidity !== null && weather?.humidity !== undefined ? (weather.humidity > 70 ? 'up' as const : weather.humidity < 30 ? 'down' as const : undefined) : undefined,
                                back: 'الرطوبة الجوية تؤثر على نمو النبات وتطوره. القيم المرتفعة قد تزيد من خطر الإصابة بالأمراض الفطرية.'
                              },
                              {
                                title: 'رطوبة التربة',
                                value: safeToFixed(currentData?.humidity) + '%',
                                icon: <Droplets className="w-6 h-6" />, color: 'purple', range: '50-80%', 
                                trend: currentData?.humidity !== null && currentData?.humidity !== undefined ? (currentData.humidity > 80 ? 'up' as const : currentData.humidity < 50 ? 'down' as const : undefined) : undefined,
                                back: sensorBackTexts[1]
                              },
                              {
                                title: 'حموضة التربة',
                                value: `pH ${safeToFixed(currentData?.ph)}`,
                                icon: <TestTube className="w-6 h-6" />, color: 'orange', range: '6.0-7.5', 
                                trend: currentData?.ph !== null && currentData?.ph !== undefined ? (currentData.ph > 7.5 ? 'up' as const : currentData.ph < 6.0 ? 'down' as const : undefined) : undefined,
                                back: sensorBackTexts[3]
                              }
                            ].map((card, idx) => (
                              <div className="relative min-h-[220px]" key={card.title}>
                                <SensorCard
                                  title={card.title}
                                  value={card.value}
                                  icon={card.icon}
                                  color={card.color as any}
                                  range={card.range}
                                  trend={card.trend}
                                  flipped={flippedCardIndex === idx}
                                  onClick={() => setFlippedCardIndex(flippedCardIndex === idx ? null : idx)}
                                  backContent={<span className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{card.back}</span>}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Nutrients */}
                          <div className="mb-8 mt-24 flex flex-col items-center justify-center w-full">
                            <div className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center flex flex-col items-center justify-center">
                              <span className="text-2xl mb-2">🧪</span>
                              <span>العناصر الغذائية</span>
                            </div>
                            <div className="mt-2 w-full">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 overflow-visible">
                                {[
                                  {
                                    title: 'النيتروجين (N)',
                                    value: `ppm ${safeToFixed(currentData?.nitrogen, 0)}`,
                                    icon: nutrientIcons[0], color: 'green', range: '10-50 ppm', 
                                    trend: currentData?.nitrogen !== null && currentData?.nitrogen !== undefined ? (currentData.nitrogen > 50 ? 'up' as const : currentData.nitrogen < 10 ? 'down' as const : undefined) : undefined,
                                    back: nutrientBackTexts[0]
                                  },
                                  {
                                    title: 'الفسفور (P)',
                                    value: `ppm ${safeToFixed(currentData?.phosphorus, 0)}`,
                                    icon: nutrientIcons[1], color: 'blue', range: '5-30 ppm', 
                                    trend: currentData?.phosphorus !== null && currentData?.phosphorus !== undefined ? (currentData.phosphorus > 30 ? 'up' as const : currentData.phosphorus < 5 ? 'down' as const : undefined) : undefined,
                                    back: nutrientBackTexts[1]
                                  },
                                  {
                                    title: 'البوتاسيوم (K)',
                                    value: `ppm ${safeToFixed(currentData?.potassium, 0)}`,
                                    icon: nutrientIcons[2], color: 'orange', range: '80-200 ppm', 
                                    trend: currentData?.potassium !== null && currentData?.potassium !== undefined ? (currentData.potassium > 200 ? 'up' as const : currentData.potassium < 80 ? 'down' as const : undefined) : undefined,
                                    back: nutrientBackTexts[2]
                                  },
                                  {
                                    title: 'الموصلية الكهربائية',
                                    value: `mS/cm ${safeToFixed(currentData?.conductivity, 2)}`,
                                    icon: <Zap className="w-6 h-6" />, color: 'purple', range: '0.5-2.5 mS/cm', 
                                    trend: currentData?.conductivity !== null && currentData?.conductivity !== undefined ? (currentData.conductivity > 2.5 ? 'up' as const : currentData.conductivity < 0.5 ? 'down' as const : undefined) : undefined,
                                    back: nutrientBackTexts[3]
                                  }
                                ].map((card, idx) => (
                                  <div className="relative min-h-[220px]" key={card.title}>
                                    <SensorCard
                                      title={card.title}
                                      value={card.value}
                                      icon={card.icon}
                                      color={card.color as any}
                                      range={card.range}
                                      trend={card.trend}
                                      flipped={flippedCardIndex === idx + 4}
                                      onClick={() => setFlippedCardIndex(flippedCardIndex === idx + 4 ? null : idx + 4)}
                                      backContent={<span className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{card.back}</span>}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Data Trends */}
                          {history.length > 1 && (
                            <div className="mt-16">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center flex justify-center">📈 اتجاهات البيانات</h4>
                              <DataHistory data={history.slice(-20)} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p className="text-gray-600">جاري تحميل البيانات...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'crops' && (
                    <div className="pb-32 relative z-10">
                      <CropSelector
                        crops={crops}
                        selectedCrop={selectedCrop}
                        onSelectCrop={handleSelectCrop}
                        onAddCrop={handleAddCrop}
                        onDeleteCrop={handleDeleteCrop}
                        currentData={currentData}
                      />
                    </div>
                  )}

                  {activeTab === 'image' && (
                    <ImageAnalysisPage />
                  )}

                  {activeTab === 'analysis' && (
                    <>
                      {selectedCrop && currentData ? (
                        <RecommendationPanel
                          selectedCrop={selectedCrop}
                          currentData={currentData}
                          recommendations={(() => {
                            try {
                              return generateRecommendations(currentData, selectedCrop);
                            } catch (error) {
                              console.error("Error generating recommendations:", error);
                              return {
                                needsIrrigation: false,
                                needsNitrogen: false,
                                needsPhosphorus: false,
                                needsPotassium: false,
                                soilPhStatus: 'مناسب',
                                temperatureStatus: 'مناسب',
                                humidityStatus: 'مناسب',
                                overallStatus: 'جيد',
                                recommendations: ['⚠️ حدث خطأ في تحليل البيانات، يرجى المحاولة مرة أخرى'],
                                alerts: [{ type: 'إشعار', message: 'حدث خطأ في تحليل البيانات' }]
                              };
                            }
                          })()}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="text-4xl mb-4">🤖</div>
                          <div className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">لا يوجد تحليل متاح حالياً</div>
                          <div className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                            يرجى اختيار محصول من قائمة المحاصيل والتأكد من توفر بيانات المستشعر لعرض التحليل والتوصيات الذكية.
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'history' && (
                    <DataHistory data={history} showDetailed airTemperatureAvg={weather && weather.temp !== null ? weather.temp : null} />
                  )}

                  {activeTab === 'audio' && <VoiceToText />}

                  {activeTab === 'planner' && (
                    <div>
                      <h2 className="text-2xl font-bold text-green-700 dark:text-green-500 mb-4 text-center justify-center">تخطيط المحاصيل</h2>
                      <div className="p-6 text-gray-800 dark:text-gray-200 bg-transparent">
                        <InputForm
                          inputs={plannerInputs}
                          onInputChange={(inputs) => {
                            setPlannerInputs(inputs);
                            setPlannerSearched(false);
                          }}
                          onAnalyze={() => {
                            const all = recommendCrops(plannerCrops, plannerInputs);
                            const filtered = all
                              .filter(crop => crop.nameAr !== plannerInputs.previousCrop)
                              .filter((crop, idx, arr) => arr.findIndex(c => c.nameAr === crop.nameAr) === idx)
                              .filter(crop => crop.suitabilityScore > 60)
                              .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
                            setRecommendations(filtered);
                            setPlannerSearched(true);
                          }}
                          disableAnalyze={!(plannerInputs.soilType && plannerInputs.currentSeason)}
                        />
                        {plannerSearched && <ResultsSection recommendations={recommendations} />}
                      </div>
                    </div>
                  )}

                  {activeTab === 'maturity' && (
                    <div>
                      <MaturityAnalysis />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Manual Input Modal */}
      {showManualInput && (
        <ManualInput
          onSubmit={handleManualData}
          onClose={() => setShowManualInput(false)}
        />
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <Tutorial isFirstVisit={showTutorial} onComplete={handleTutorialComplete} />
      )}
    </>
  );
}

export default App;