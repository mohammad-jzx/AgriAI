# تثبيت المكتبات اللازمة

# استيراد المكتبات
from ultralytics import YOLO
import os

# تحديد مسار ملف data.yaml داخل مجلد البيانات الذي فككت ضغطه
# قم بتغيير هذا المسار للمسار الصحيح على جهازك
data_yaml_path = "data.yaml"  # استبدل هذا بالمسار الصحيح

# تحميل نموذج YOLO الأساسي
model = YOLO('yolov8n.pt')  # نموذج صغير وسريع

# تدريب النموذج
results = model.train(
    data=data_yaml_path,
    epochs=50,              # يمكنك زيادة هذا لتحسين الدقة (100-300)
    imgsz=640,              # حجم الصورة
    batch=16,               # قلل هذا إذا واجهت مشاكل في الذاكرة
    patience=20,            # عدد الدورات قبل التوقف المبكر
    name='ripeness_model'   # اسم المشروع
)

# تقييم النموذج بعد التدريب
results = model.val()

# تصدير النموذج بتنسيق ONNX للاستخدام في تطبيقات Node.js
model.export(format='onnx')