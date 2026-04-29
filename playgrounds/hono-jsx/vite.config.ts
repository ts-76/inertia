import { defineConfig } from 'vite'
import { inertiaPages } from '@hono/inertia/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    inertiaPages({
      pagesDir: 'src/Pages',
      outFile: 'src/pages.gen.ts',
      serverModule: './index',
    }),
  ],
  resolve: {
    alias: {
      '@inertiajs/core': fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url)),
      '@inertiajs/hono-jsx': fileURLToPath(new URL('../../packages/hono-jsx/src/index.ts', import.meta.url)),
    },
  },
})
