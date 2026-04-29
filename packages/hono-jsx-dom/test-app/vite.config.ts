import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@inertiajs/core': fileURLToPath(new URL('../../core/src/index.ts', import.meta.url)),
      '@inertiajs/hono-jsx-dom': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
  build: {
    manifest: true,
  },
})
