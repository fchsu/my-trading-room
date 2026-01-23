
/**
 * @file vitest.config.mts
 * @description Configuration for Vitest unit testing framework.
 * Sets up React environment and path aliases.
 */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.ts',
    reporters: ['default', 'junit'],
    outputFile: './test-report/junit.xml',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './test-report/coverage',
      exclude: ['node_modules/', 'src/__tests__/', 'src/__mocks__/']
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
