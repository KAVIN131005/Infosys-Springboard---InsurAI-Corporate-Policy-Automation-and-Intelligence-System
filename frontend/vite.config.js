import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use PostCSS (postcss.config.js) to run Tailwind; avoid @tailwindcss/vite deep imports
export default defineConfig({
  plugins: [react()],
})
