const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

// Función para convertir el modelo h5 a formato TFJS
async function convertModel() {
  try {
    console.log('Iniciando conversión del modelo...');
    
    // Crear directorio para el modelo si no existe
    const modelDir = path.join(__dirname, 'model');
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir);
    }
    
    // Ruta al modelo .h5
    const inputPath = path.join(__dirname, '..', 'best_model.h5');
    
    // Verificar que el archivo exista
    if (!fs.existsSync(inputPath)) {
      console.error(`El archivo ${inputPath} no existe`);
      return;
    }
    
    console.log(`Cargando modelo desde: ${inputPath}`);
    
    // Cargar el modelo .h5
    const model = await tf.node.loadSavedModel(inputPath);
    
    // Ruta de salida para el modelo convertido
    const outputPath = path.join(modelDir, 'model.json');
    
    // Guardar el modelo en formato TFJS
    await model.save(`file://${modelDir}`);
    
    console.log(`Modelo convertido y guardado en: ${outputPath}`);
  } catch (error) {
    console.error('Error durante la conversión del modelo:', error);
  }
}

// Ejecutar la función
convertModel(); 