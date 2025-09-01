/// <reference types="vitest" />
import eslintPlugin from '@nabla/vite-plugin-eslint'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'
import { vitePluginVersionMark } from 'vite-plugin-version-mark'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  server: {
    port: 8080,
  },
  plugins: [
    react(),
    eslintPlugin(),
    tsconfigPaths(),
    tailwindcss(),
    vitePluginVersionMark({
      name: 'sec-o-simple',
      version: process.env.BUILD_VERSION || undefined,
      command: process.env.BUILD_VERSION
        ? undefined
        : 'git describe --tags --match "v[0-9]*" --dirty --always',
      ifGlobal: true,
      ifMeta: true,
      ifLog: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportOnFailure: true,
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      thresholds: {
        global: {
          lines: 95,
          statements: 95,
        },
      },
    },
  },
})
