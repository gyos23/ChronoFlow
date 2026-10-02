#!/usr/bin/env node
// ChronoFlow macOS Background Sync Daemon
// Automatically pulls live OmniFocus 4 tasks and pushes them to your local or Vercel cloud dashboard

const { execFile } = require('child_process');
const path = require('path');
const http = require('http');
const https = require('https');

// Target URL: Default from environment variable or command-line args or localhost
const args = process.argv.slice(2);
let targetUrl = process.env.CHRONOFLOW_CLOUD_URL || 'http://localhost:3333';
let runOnce = args.includes('--once');
let intervalMinutes = 5;

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    targetUrl = args[i + 1];
  }
  if (args[i] === '--interval' && args[i + 1]) {
    intervalMinutes = parseInt(args[i + 1], 10) || 5;
  }
}

const scriptPath = path.join(__dirname, 'omnifocus_export.applescript');

function syncTasks() {
  const timestamp = new Date().toLocaleTimeString();
  process.stdout.write(`[${timestamp}] 🍏 Extracting OmniFocus 4 tasks... `);

  execFile('osascript', [scriptPath], { timeout: 10000 }, (err, stdout, stderr) => {
    if (err || !stdout) {
      console.log(`❌ Failed: OmniFocus closed or AppleScript error.`);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(stdout.trim());
    } catch (parseErr) {
      console.log(`❌ Could not parse JSON from OmniFocus.`);
      return;
    }

    if (!parsed.success || !parsed.tasks || parsed.tasks.length === 0) {
      console.log(`⚠️ OmniFocus returned 0 active tasks.`);
      return;
    }

    const payload = JSON.stringify({
      source: 'macOS OmniFocus 4 Daemon',
      timestamp: new Date().toISOString(),
      tasks: parsed.tasks
    });

    const parsedTarget = new URL(`${targetUrl.replace(/\/$/, '')}/api/omnifocus/sync`);
    const isHttps = parsedTarget.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request(parsedTarget, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✓ Pushed ${parsed.tasks.length} tasks to ${parsedTarget.origin} (${parsed.dueCount} Due • ${parsed.plannedCount} Planned)`);
        } else {
          console.log(`⚠️ Server returned HTTP ${res.statusCode}: ${resBody}`);
        }
      });
    });

    req.on('error', (reqErr) => {
      console.log(`❌ Network error pushing to ${parsedTarget.origin}: ${reqErr.message}`);
    });

    req.write(payload);
    req.end();
  });
}

console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║             CHRONOFLOW MACOS BACKGROUND SYNC RELAY                ║
║           OmniFocus 4 ──► ChronoFlow Vercel Cloud Store           ║
╚═══════════════════════════════════════════════════════════════════╝
Target Endpoint: ${targetUrl}/api/omnifocus/sync
Interval: ${runOnce ? 'One-time run' : `Every ${intervalMinutes} minutes`}
`);

syncTasks();

if (!runOnce) {
  setInterval(syncTasks, intervalMinutes * 60 * 1000);
}
