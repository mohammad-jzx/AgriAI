import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  isAnalyzing: boolean;
  onReset: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, isAnalyzing, onReset }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onImageUpload(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-green-100 dark:border-gray-700 p-6" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">رفع صورة للنبات</h2>
        {isAnalyzing && (
          <button
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="إلغاء التحليل"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400' 
            : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10'
        } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isAnalyzing ? handleClick : undefined}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-green-500 dark:text-green-400 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">جاري تحليل الصورة...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">يتم معالجة الصورة باستخدام نموذج الذكاء الاصطناعي</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-700 dark:text-gray-200 font-medium">
                اسحب صورة النبات هنا أو اضغط لاختيار صورة
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                يدعم JPG, PNG, WEBP (بحد أقصى 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={isAnalyzing}
      />

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-right">
        <p className="font-medium mb-2">نصائح للحصول على نتائج دقيقة:</p>
        <ul className="space-y-1 pr-2">
          <li>• تأكد من وجود إضاءة جيدة</li>
          <li>• ركز على الأجزاء المصابة من النبات</li>
          <li>• تجنب الصور الضبابية أو البعيدة</li>
          <li>• أظهر الأوراق أو السيقان أو الثمار بوضوح</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload; 