// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// http://localhost:5173/
//https://karigarbackend.vercel.app
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: true, // since it's HTTPS
      },
    },
  },
});
