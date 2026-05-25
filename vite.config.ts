import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/SpriteSplit/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('react-router') || id.includes('remix-run') || id.includes('@remix-run')) {
              return 'vendor-router';
            }
            if (id.includes('konva') || id.includes('canvas')) {
              return 'vendor-konva';
            }
            if (id.includes('jszip') || id.includes('file-saver')) {
              return 'vendor-zip';
            }
            return 'vendor-others';
          }
        }
      }
    }
  }
})
