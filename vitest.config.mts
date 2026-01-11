
/**
 * @file vitest.config.mts
 * @description Configuration for Vitest unit testing framework.
 * Sets up React environment and path aliases.
 */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: 'jsdom',
        globals: true,
    },
})
