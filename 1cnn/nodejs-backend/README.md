# Backend de Node.js para Detección de Enfermedades en Plantas

Este es un backend de Node.js que actúa como un proxy hacia un servidor Python que carga el modelo CNN preentrenado y hace predicciones sobre enfermedades de plantas.

## Requisitos previos

- Node.js (versión 14 o superior)
- NPM o Yarn
- Python (versión 3.7 o superior)
- TensorFlow (2.x)

## Instalación

1. Instalar todas las dependencias (Node.js y Python) con un solo comando:

```bash
npm run setup
```

En Windows:

```bash
npm run setup:windows
```

Esto instalará:
- Dependencias de Node.js desde package.json
- Dependencias de Python desde requirements.txt

## Ejecución

Para iniciar el servidor:

```bash
npm start
```

Para desarrollo con recarga automática:

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

Esta aplicación inicia dos servidores:
1. Servidor Node.js en el puerto 3000 - Maneja las solicitudes del cliente web
2. Servidor Python en el puerto 5001 - Carga el modelo y realiza las predicciones

El servidor Node.js actúa como un proxy y automáticamente inicia y se comunica con el servidor Python.

## Endpoints API

### GET /

Verifica que el servidor esté funcionando.

**Respuesta:**
```json
{
  "status": "Server is running"
}
```

### POST /predict

Recibe una imagen y devuelve la predicción de la enfermedad.

**Parámetros:**
- `file`: Archivo de imagen (JPEG, PNG)

**Respuesta:**
```json
{
  "result": "Apple___healthy"
}
```

## Solución de problemas

Si encuentras problemas al cargar el modelo:

1. Asegúrate de que el modelo esté correctamente convertido en la carpeta `/model`
2. Verifica que el formato del modelo sea compatible con TensorFlow.js
3. Comprueba que las rutas a los archivos del modelo sean correctas 