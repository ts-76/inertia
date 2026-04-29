#!/usr/bin/env node
import { spawn } from 'child_process'

// Parse arguments
const args = process.argv.slice(2)
const webkitIndex = args.indexOf('--webkit')
const firefoxIndex = args.indexOf('--firefox')

// Replace --webkit or --firefox with --project <browser>
if (webkitIndex !== -1) {
  args.splice(webkitIndex, 1)
  args.push('--project', 'webkit')
} else if (firefoxIndex !== -1) {
  args.splice(firefoxIndex, 1)
  args.push('--project', 'firefox')
} else {
  // Default to chromium if no browser flag
  args.push('--project', 'chromium')
}

// Run playwright with modified args
const command = process.platform === 'win32' ? 'pnpm.cmd' : 'npx'
const commandArgs =
  process.platform === 'win32' ? ['exec', 'playwright', 'test', ...args] : ['playwright', 'test', ...args]
const quote = (arg) => (/\s/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg)

const playwright =
  process.platform === 'win32'
    ? spawn([command, ...commandArgs].map(quote).join(' '), {
        env: process.env,
        stdio: 'inherit',
        shell: true,
      })
    : spawn(command, commandArgs, {
        env: process.env,
        stdio: 'inherit',
      })

playwright.on('close', (code) => {
  process.exit(code)
})
