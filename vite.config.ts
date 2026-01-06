import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
       clientPort: 443,
    }
  },
  // Relative base path ensures assets load correctly regardless of the repo name
  base: './',
})
