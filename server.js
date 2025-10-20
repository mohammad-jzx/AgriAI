// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors    from 'cors';
import path    from 'path';
import { fileURLToPath } from 'url';

const app  = express();
const PORT = process.env.PORT || 3000;

// لتخزين آخر قراءة
let latestReadings = {};

// Middlewares
app.use(express.json()); // لقراءة JSON من الـ POST
app.use(cors());         // للسماح بالطلبات من الواجهة

// راوت POST من ESP32 ليُحدّث latestReadings
app.post('/api/sensor/update', (req, res) => {
  latestReadings = req.body;
  console.log('Received sensor update:', latestReadings);
  res.sendStatus(204);
});

// راوت GET للواجهة لتُجلب آخر القيم
app.get('/api/sensor', (req, res) => {
  res.json(latestReadings);
});

// خدمة الملفات الثابتة من مجلد public/
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
