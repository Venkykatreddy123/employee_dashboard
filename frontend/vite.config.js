import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Consistent with Modernized Backend
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // Maintaining the /api prefix for backend mapping
      }
    }
  }
})
