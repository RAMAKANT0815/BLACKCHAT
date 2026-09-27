import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // This tells Vite: "If a request starts with /api, send it to the backend"
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Replace with your backend port if different
        changeOrigin: true,
        secure: false,
      }
    }
  }
})