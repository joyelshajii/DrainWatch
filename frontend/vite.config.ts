import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://drainwatch-final.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://drainwatch-final.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
