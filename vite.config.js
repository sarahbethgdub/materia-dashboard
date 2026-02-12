import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves from https://<user>.github.io/<repo>/
// If your repo is named something other than 'materia-dashboard', change the base below.
// If using a custom domain, change base to '/'
export default defineConfig({
  plugins: [react()],
  base: '/materia-dashboard/',
})
