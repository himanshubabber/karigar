import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // https://karigar-5vd9jayi8-himanshubabbers-projects.vercel.app/
    proxy: {
      "/api":"https://karigar-5vd9jayi8-himanshubabbers-projects.vercel.app",
       
    },
  },
});
