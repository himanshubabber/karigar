import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://karigar-5vd9jayi8-himanshubabbers-projects.vercel.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
