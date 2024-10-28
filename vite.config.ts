import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(() => {
  const apiUrl = process.env.MODE === 'development' ?
    (process.env.VITE_DEV_API_URL || 'http://localhost:8000') :
    (process.env.VITE_PROD_API_URL || 'http://localhost:8000');
  return {
    plugins: [react()],
    define: {
      __API_URL__: JSON.stringify(apiUrl), // Inject the API URL as a global variable
    },
  };
});
