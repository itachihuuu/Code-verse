import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { apiRouter } from './src/server/app';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Mount the API Router on /api
app.use('/api', apiRouter);

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all other routes to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CodeVerse Server running on port ${PORT}`);
});
