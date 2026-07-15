import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import express from 'express';

// Load environment variables for the server middleware
dotenv.config();

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'express-api-middleware',
        configureServer(server) {
          // Create an express app for the API
          const app = express();
          app.use(express.json({ limit: '10mb' }));
          
          // Import the router dynamically to avoid any early evaluation issues
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api')) {
              const { apiRouter } = await import('./src/server/app');
              app(req as any, res as any, next);
              // Bind our apiRouter to the express app if not already done
              if (app._router === undefined || !app._router.stack.some((layer: any) => layer.name === 'router')) {
                app.use('/api', apiRouter);
              }
            } else {
              next();
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

export default defineConfig(() => {
  return {
    base: './', // 🟢 Forces relative asset paths so it works in sub-folders
    plugins: [
      react(),
      tailwindcss(),
      // ...
    ],
    // ...
  };
});
