import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium' },
  webServer: {
    command: 'npm run build && node scripts/serve-built.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})
