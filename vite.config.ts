import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
          },
        },
        // Grant access to the parent directory containing shared folder
        fs: {
          allow: ['..'],
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Alias for the frontend src directory
          '@': path.resolve(__dirname, './frontend/src'),
          // Alias for the shared directory
          '@shared': path.resolve(__dirname, './shared'),
        }
      }
    };
});
