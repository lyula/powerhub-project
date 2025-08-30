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
            src: '/app-logotwo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/app-logotwo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
