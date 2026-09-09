import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
  host: '0.0.0.0' ,
  port: 5173,

  hmr: {
    host: 'localhost',
    port: 5173,
  },
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
      configure: (proxy) => {
        proxy.on('error' , (err) => {
          console.log('Proxy error:', err);
        });
        proxy.on('proxyReq' , (_ , req) => {
          console.log('Proxy request:', req.method, req.url);
        });

        proxy.on('proxyRes' , (res , req) => {
          console.log('Proxy response:', res.statusCode, req.url);
        });
      },
    },

  },
}})
