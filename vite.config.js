import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";
import { fileURLToPath } from 'node:url'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@js': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
