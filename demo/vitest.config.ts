import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ["vitestSetup.ts"],
  },
})