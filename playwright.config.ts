// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:5173';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  
  // CI 환경(Netlify 빌드)에서는 실패 시 1번만 재시도합니다.
  retries: process.env.CI ? 1 : 0,

  // webServer 설정은 그대로 유지합니다.
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
  },

  // CI 환경에서는 Chromium만 사용하고, 로컬에서는 3개 모두 사용합니다.
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
      ],
});