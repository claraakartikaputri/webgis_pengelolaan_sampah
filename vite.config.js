import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000
  }
})
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
