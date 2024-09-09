import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // ou vue si vous utilisez Vue

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3500',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
});
