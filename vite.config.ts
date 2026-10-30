import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
      workbox: {
        // vite-plugin-pwa only precaches js/css/html by default; fonts (woff2) must be listed
        // or the bundled @fontsource fonts are missing when the app starts offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true
      },
      manifest: {
        name: 'Worship Song',
        short_name: 'WorshipSong',
        description: 'Worship Song Application',
        display: 'standalone',
        // the app is dark: avoid a white flash / white status bar when it launches from the home screen
        theme_color: '#0F0E0C',
        background_color: '#0F0E0C',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    }),
  ],
  base: '/Worship-SongBook/',
})