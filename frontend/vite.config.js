import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // If VITE_API_URL is not set, keep the previous default.
  // Note: this is only the dev proxy target; the app's runtime API base
  // is controlled by import.meta.env.VITE_API_URL in src/api.js.
  const raw = (env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

  let proxyTarget = 'http://localhost:8000'
  try {
    proxyTarget = new URL(raw).origin
  } catch {
    proxyTarget = 'http://localhost:8000'
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          // use 'localhost' so dev server and backend share same hostname for cookies
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
