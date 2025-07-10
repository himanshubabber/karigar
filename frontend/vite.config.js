import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
//https://karigar-5vd9jayi8-himanshubabbers-projects.vercel.app
//https://karigarbackend.vercel.app/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure:false,
      },
    },
  },
});
