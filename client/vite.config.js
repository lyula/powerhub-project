import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
  name: 'PowerHub',
  short_name: 'PowerHub',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0bb6bc',
        icons: [
          {
            src: '/app-logo', // Use your actual filename and extension if needed (e.g., /app-logo.png)
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
