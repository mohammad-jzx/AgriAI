const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');

const app = express();
const port = 3000;
const modelServerPort = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración para subir archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Variable para almacenar el proceso Python
let pythonProcess = null;

// Función para iniciar el servidor Python
function startPythonServer() {
  if (pythonProcess) {
    console.log('El servidor Python ya está en ejecución');
    return;
  }

  const pythonScript = path.join(__dirname, 'model-server.py');
  
  // Verificar que el script exista
  if (!fs.existsSync(pythonScript)) {
    console.error(`No se encontró el script Python: ${pythonScript}`);
    return;
  }

  console.log(`Iniciando servidor Python: ${pythonScript}`);
  pythonProcess = spawn('python', [pythonScript]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Servidor Python (stdout): ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Servidor Python (stderr): ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Servidor Python cerrado con código: ${code}`);
    pythonProcess = null;
  });

  // Esperar a que el servidor Python se inicie
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkServer = async () => {
      try {
        const response = await axios.get(`http://localhost:${modelServerPort}`);
        if (response.status === 200) {
          console.log('Servidor Python iniciado correctamente');
          resolve();
        } else {
          retry();
        }
      } catch (error) {
        retry();
      }
    };
    
    const retry = () => {
      attempts++;
      if (attempts >= maxAttempts) {
        reject(new Error('No se pudo conectar al servidor Python'));
      } else {
        console.log(`Intentando conectar al servidor Python (${attempts}/${maxAttempts})...`);
        setTimeout(checkServer, 1000);
      }
    };
    
    // Esperar un momento antes de comenzar a verificar
    setTimeout(checkServer, 2000);
  });
}

// Ruta para la predicción
app.post('/predict', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Asegurarse de que el servidor Python esté corriendo
    if (!pythonProcess) {
      try {
        await startPythonServer();
      } catch (error) {
        return res.status(500).json({ error: 'Error starting model server' });
      }
    }
    
    // Reenviar la solicitud al servidor Python
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    const response = await axios.post(`http://localhost:${modelServerPort}/predict`, formData, {
      headers: formData.getHeaders()
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error durante la predicción:', error);
    res.status(500).json({ error: 'Error during prediction process' });
  }
});

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Ruta para verificar el estado del servidor Python
app.get('/model-server-status', async (req, res) => {
  try {
    if (!pythonProcess) {
      return res.json({ status: 'stopped' });
    }
    
    try {
      const response = await axios.get(`http://localhost:${modelServerPort}`);
      res.json({ status: 'running', pythonServerStatus: response.data });
    } catch (error) {
      res.json({ status: 'error', message: 'Python server is not responding' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error checking model server status' });
  }
});

// Iniciar el servidor
app.listen(port, async () => {
  console.log(`Servidor Node.js iniciado en el puerto ${port}`);
  
  // Iniciar el servidor Python al arrancar
  try {
    await startPythonServer();
    console.log('Servidor Python iniciado correctamente');
  } catch (error) {
    console.error('Error al iniciar el servidor Python:', error);
  }
}); 