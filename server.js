import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Health check endpoint for Cloud Run and load balancers
app.get(['/healthz', '/_health'], (req, res) => {
  res.status(200).send('OK');
});

// Check if dist exists, otherwise inform that build is required
if (!fs.existsSync(distPath)) {
  console.warn(`Warning: Directory ${distPath} does not exist yet.`);
}

// Serve static assets from dist
app.use(
  express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      // Don't cache HTML files, Service Worker, or PWA manifest so updates apply immediately
      if (
        filePath.endsWith('.html') ||
        filePath.endsWith('sw.js') ||
        filePath.endsWith('manifest.webmanifest')
      ) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// SPA fallback for all unknown routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application build in progress or not found.');
  }
});

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running and listening on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown handling for Cloud Run revision rotation
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
