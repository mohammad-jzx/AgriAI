import tensorflow as tf
import numpy as np
from PIL import Image
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Nombres de las clases
CLASS_NAMES = [
    'Apple___Apple_scab',
    'Apple___Black_rot',
    'Apple___Cedar_apple_rust',
    'Apple___healthy',
    'Blueberry___healthy',
    'Cherry_(including_sour)___Powdery_mildew',
    'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot',
    'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight',
    'Corn_(maize)___healthy',
    'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)',
    'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)',
    'Peach___Bacterial_spot',
    'Peach___healthy',
    'Pepper,_bell___Bacterial_spot',
    'Pepper,_bell___healthy',
    'Potato___Early_blight',
    'Potato___Late_blight',
    'Potato___healthy',
    'Raspberry___healthy',
    'Soybean___healthy',
    'Squash___Powdery_mildew',
    'Strawberry___Leaf_scorch',
    'Strawberry___healthy',
    'Tomato___Bacterial_spot',
    'Tomato___Early_blight',
    'Tomato___Late_blight',
    'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus',
    'Tomato___Tomato_mosaic_virus',
    'Tomato___healthy'
]

# Cargar el modelo
model = None

def load_model():
    global model
    # Buscar el modelo en el directorio principal
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(parent_dir, 'best_model.h5')
    
    # Si no existe, buscar trained_model.h5
    if not os.path.exists(model_path):
        model_path = os.path.join(parent_dir, 'trained_model.h5')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No se encontró ningún modelo en {parent_dir}")
    
    model = tf.keras.models.load_model(model_path)
    print(f"Modelo cargado desde: {model_path}")

def model_prediction(image_bytes):
    # Verificar que el modelo esté cargado
    global model
    if model is None:
        load_model()
        
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image = image.resize((128, 128))
    input_arr = np.array(image)
    input_arr = np.expand_dims(input_arr, axis=0)
    prediction = model.predict(input_arr)
    result_index = np.argmax(prediction)
    return CLASS_NAMES[result_index]

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    image_bytes = file.read()
    
    if model is None:
        try:
            load_model()
        except Exception as e:
            return jsonify({'error': f'Error al cargar el modelo: {str(e)}'}), 500
    
    try:
        result = model_prediction(image_bytes)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': f'Error en la predicción: {str(e)}'}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({'status': 'Model server is running'})

if __name__ == '__main__':
    # Puerto 5001 para no interferir con el backend de Node.js
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port, debug=True) 