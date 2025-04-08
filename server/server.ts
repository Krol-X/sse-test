import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем __dirname эквивалент для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS настройки
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Статические файлы
app.use(express.static(path.join(__dirname, '../client')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Простой SSE endpoint
app.get('/sse-simple', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  res.write('event: connected\ndata: {"status": "connected"}\n\n');
  
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
  }, 5000);
  
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

// SSE endpoint с переподключением
app.get('/sse-reconnect', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  let counter = 0;
  
  const interval = setInterval(() => {
    counter++;
    res.write(`data: ${JSON.stringify({ 
      time: new Date().toISOString(),
      counter 
    })}\n\n`);
    
    // Имитация разрыва соединения после 5 сообщений
    if (counter === 5) {
      clearInterval(interval);
      res.end();
    }
  }, 1000);
  
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

const PORT = process.env.PORT || 10000;

console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Static files path:', path.join(__dirname, '../client'));
});