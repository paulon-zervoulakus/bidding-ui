import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const isDevelopment = mode === 'development';
  return {
    plugins: [react()],
    define: {
      __API_URL__: isDevelopment
        ? JSON.stringify(env.VITE_DEV_API_URL || 'http://localhost:8081')
        : JSON.stringify(env.VITE_PROD_API_URL || 'http://localhost:8082'),
    },
  };
});
