import { defineConfig } from '@playwright/test'
import process from 'node:process'
import path from 'node:path'
const python = process.env.PYTHON || path.resolve(process.platform === 'win32' ? '../.venv/Scripts/python.exe' : '../.venv/bin/python')
export default defineConfig({
  globalTeardown: './tests/global-teardown.js',
  testDir: './tests', timeout: 180000, expect: { timeout: 20000 }, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5174', headless: true, trace: 'retain-on-failure', channel: 'chrome' },
  webServer: [
    { command: `"${python}" "../backend/tests/serve_e2e.py"`, url: 'http://127.0.0.1:8001/api/health', timeout: 120000 },
    { command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort', url: 'http://127.0.0.1:5174', env: { API_PROXY_TARGET: 'http://127.0.0.1:8001' }, timeout: 120000 },
  ],
})
