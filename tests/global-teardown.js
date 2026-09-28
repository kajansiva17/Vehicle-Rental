import { execFileSync } from 'node:child_process'
import process from 'node:process'
import path from 'node:path'
export default function teardown() {
  const python = process.env.PYTHON || path.resolve(process.platform === 'win32' ? '../.venv/Scripts/python.exe' : '../.venv/bin/python')
  execFileSync(python, ['../backend/tests/cleanup_e2e.py'], { stdio: 'inherit', windowsHide: true })
}
