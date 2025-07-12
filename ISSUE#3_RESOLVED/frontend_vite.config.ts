import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Keep the frontend on its default port
    proxy: {
      // Proxy requests from /api to your backend server
      '/api': {
        target: 'http://localhost:8000', // Your backend server URL
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['dompurify'],
  },
});