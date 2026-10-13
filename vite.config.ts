import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'deployable-dataset',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (
            req.url === '/data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv' ||
            req.url === '/data/BuildBattle_2026_Customer_Feedback_Dataset.csv'
          ) {
            const filePath = path.resolve(process.cwd(), 'data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv');
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'text/csv');
              return fs.createReadStream(filePath).pipe(res);
            } else {
              res.statusCode = 404;
              return res.end('Dataset not found');
            }
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (
            req.url === '/data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv' ||
            req.url === '/data/BuildBattle_2026_Customer_Feedback_Dataset.csv'
          ) {
            const distPath = path.resolve(process.cwd(), 'dist/data/BuildBattle_2026_Customer_Feedback_Dataset.csv');
            const origPath = path.resolve(process.cwd(), 'data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv');
            const targetPath = fs.existsSync(distPath) ? distPath : origPath;
            if (fs.existsSync(targetPath)) {
              res.setHeader('Content-Type', 'text/csv');
              return fs.createReadStream(targetPath).pipe(res);
            } else {
              res.statusCode = 404;
              return res.end('Dataset not found');
            }
          }
          next();
        });
      },
      buildStart() {
        if (process.env.VITEST) return;
        const originalDir = path.resolve(process.cwd(), 'data/original');
        const hasCsv = fs.existsSync(originalDir) && fs.readdirSync(originalDir).some(f => f.endsWith('.csv'));
        if (!hasCsv && process.env.VITE_ALLOW_EMPTY_DATASET !== 'true' && process.env.CI !== 'true') {
          throw new Error(
            '[deployable-dataset] Build Failed: "data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv" is missing. Production build requires authentic dataset at data/original/.'
          );
        }
      },
      closeBundle() {
        const srcPath = path.resolve(process.cwd(), 'data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv');
        if (fs.existsSync(srcPath)) {
          const distDataDir = path.resolve(process.cwd(), 'dist/data');
          const distDataOriginalDir = path.resolve(process.cwd(), 'dist/data/original');
          fs.mkdirSync(distDataDir, { recursive: true });
          fs.mkdirSync(distDataOriginalDir, { recursive: true });
          fs.copyFileSync(srcPath, path.join(distDataDir, 'BuildBattle_2026_Customer_Feedback_Dataset.csv'));
          fs.copyFileSync(srcPath, path.join(distDataOriginalDir, 'BuildBattle_2026_Customer_Feedback_Dataset.csv'));
        } else if (process.env.VITE_ALLOW_EMPTY_DATASET !== 'true' && process.env.CI !== 'true') {
          throw new Error(
            '[deployable-dataset] Build Failed: "data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv" is missing. Cannot copy dataset to dist/data/.'
          );
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'recharts';
            }
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('papaparse')) {
              return 'papaparse';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
