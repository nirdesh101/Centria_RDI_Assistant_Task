import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
   server: {
    proxy: {
      '/api': {
        target: 'https://data.fingrid.fi',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
       '/entsoe-api': {
        target: 'https://web-api.tp.entsoe.eu',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/entsoe-api/, ''),
      },
    },
  },
})
