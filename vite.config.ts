import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // Mirage and MUI are bundled in the entry chunk on purpose (it is a demo): silence the size warning.
  build: { chunkSizeWarningLimit: 1000 },
  // Same alias idea as the real project: `app/*` points to the source root.
  resolve: { alias: { app: fileURLToPath(new URL('./src', import.meta.url)) } },
  // Views are loaded lazily, so in dev Vite only meets MUI when the first view is imported, and it
  // then re-runs dependency optimization and reloads the page mid-load. Listing the heavy deps here
  // gets them pre-bundled at startup instead. Standard practice for apps with lazy routes.
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/material/styles',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'react-router',
      'zustand',
      'zustand/middleware',
      'zustand/shallow',
      'miragejs',
    ],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    restoreMocks: true,
    setupFiles: ['./src/vitest-setup.ts'],
  },
})
