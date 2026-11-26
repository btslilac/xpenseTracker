import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, '.tmp-test-out')

function cleanup() {
  fs.rmSync(outDir, { recursive: true, force: true })
}

cleanup()

const tscPath = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc')
const compile = spawnSync(
  process.execPath,
  [
    tscPath,
    '--ignoreConfig',
    '--ignoreDeprecations',
    '6.0',
    '--module',
    'commonjs',
    '--moduleResolution',
    'node',
    '--target',
    'es2022',
    '--esModuleInterop',
    '--skipLibCheck',
    '--outDir',
    outDir,
    path.join('tests', 'complianceAndSms.test.ts'),
    path.join('tests', 'env.d.ts'),
  ],
  { stdio: 'inherit', cwd: root }
)

if (compile.status !== 0) {
  cleanup()
  process.exit(compile.status ?? 1)
}

const compiledTestFile = path.join(outDir, 'tests', 'complianceAndSms.test.js')
const run = spawnSync(process.execPath, ['--test', compiledTestFile], {
  stdio: 'inherit',
  cwd: root,
})

cleanup()
process.exit(run.status ?? 1)
