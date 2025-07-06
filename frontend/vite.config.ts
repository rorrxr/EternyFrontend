import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: true, // 포트가 사용 중이어도 다른 포트로 변경하지 않음
  },
  build: {
    outDir: 'dist',
  },
})