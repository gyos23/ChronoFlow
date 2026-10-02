// ChronoFlow Companion Server (Zero-Dependency Node.js)
// Provides native macOS bridges to OmniFocus 4 and Apple Health / Apple Watch

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile, exec } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 3333;
const DATA_DIR = path.join(__dirname, 'data');
const HEALTH_FILE = path.join(DATA_DIR, 'health_today.json');
const OMNI_CACHE_FILE = path.join(DATA_DIR, 'omnifocus_cache.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// iCloud Drive ChronoFlow Folder
const ICLOUD_DIR = path.join(os.homedir(), 'Library/Mobile Documents/com~apple~CloudDocs/ChronoFlow');
const ICLOUD_HEALTH_FILE = path.join(ICLOUD_DIR, 'health_today.json');
try {
  if (fs.existsSync(path.dirname(ICLOUD_DIR)) && !fs.existsSync(ICLOUD_DIR)) {
    fs.mkdirSync(ICLOUD_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('iCloud Drive ChronoFlow directory init skipped:', e.message);
}

// In-memory SSE clients for real-time push
const sseClients = new Set();

function broadcastEvent(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Default baseline health stats
const DEFAULT_HEALTH = {
  date: new Date().toISOString().split('T')[0],
  wakeTime: "06:00",
  bedTime: "22:30",
  sleepDurationHours: 7.5,
  sats: 98, // Blood oxygen saturation %
  restingHeartRate: 52, // bpm
  hrv: 68, // ms
  respiratoryRate: 14.5,
  wristTemperatureVariance: "+0.2°F",
  readinessScore: 92, // Computed readiness
  workout: {
    logged: true,
    title: "Morning Strength & Conditioning",
    startTime: "07:00",
    endTime: "08:00",
    durationMins: 60,
    activeCalories: 435,
    avgHeartRate: 138
  },
  source: "Apple Watch (Simulated / Initial)",
  lastSynced: new Date().toISOString()
};

// Initialize health data if missing
if (!fs.existsSync(HEALTH_FILE)) {
  fs.writeFileSync(HEALTH_FILE, JSON.stringify(DEFAULT_HEALTH, null, 2));
}

// Watch iCloud file for incoming syncs from iOS Shortcuts / Apple Watch
if (fs.existsSync(ICLOUD_DIR)) {
  try {
    fs.watch(ICLOUD_DIR, (eventType, filename) => {
      if (filename === 'health_today.json' && fs.existsSync(ICLOUD_HEALTH_FILE)) {
        try {
          const raw = fs.readFileSync(ICLOUD_HEALTH_FILE, 'utf8');
          const parsed = JSON.parse(raw);
          parsed.lastSynced = new Date().toISOString();
          parsed.source = parsed.source || 'Apple Watch (via iCloud Sync)';
          fs.writeFileSync(HEALTH_FILE, JSON.stringify(parsed, null, 2));
          console.log('⚡ Received Health update from iCloud:', parsed.wakeTime, `Sats: ${parsed.sats}%`);
          broadcastEvent('health_updated', parsed);
        } catch (err) {
          console.error('Error reading iCloud health update:', err);
        }
      }
    });
    console.log(`📁 Watching iCloud directory: ${ICLOUD_DIR}`);
  } catch (err) {
    console.warn('Could not attach file watcher to iCloud folder:', err.message);
  }
}

// MIME types map
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Request dispatcher
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3333'}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // --- API Endpoints ---

  // SSE Live Feed
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write('retry: 10000\n\n');
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // Status check
  if (pathname === '/api/status' && req.method === 'GET') {
    return jsonResponse(res, 200, {
      status: 'online',
      version: '1.0.0',
      system: os.platform(),
      iCloudSyncAvailable: fs.existsSync(ICLOUD_DIR),
      iCloudPath: ICLOUD_DIR,
      time: new Date().toISOString()
    });
  }

  // Apple Health: Get Today's Stats
  if (pathname === '/api/health/today' && req.method === 'GET') {
    try {
      // Check iCloud first if more recent
      let data = DEFAULT_HEALTH;
      if (fs.existsSync(ICLOUD_HEALTH_FILE)) {
        try {
          data = JSON.parse(fs.readFileSync(ICLOUD_HEALTH_FILE, 'utf8'));
        } catch (e) {}
      } else if (fs.existsSync(HEALTH_FILE)) {
        data = JSON.parse(fs.readFileSync(HEALTH_FILE, 'utf8'));
      }
      return jsonResponse(res, 200, data);
    } catch (err) {
      return jsonResponse(res, 500, { error: err.toString() });
    }
  }

  // Apple Health: Webhook / Sync Endpoint (called by iOS Shortcut or web app)
  if (pathname === '/api/health/sync' && req.method === 'POST') {
    readJsonBody(req, (err, body) => {
      if (err || !body) {
        return jsonResponse(res, 400, { error: 'Invalid JSON payload' });
      }

      try {
        const existing = fs.existsSync(HEALTH_FILE) ? JSON.parse(fs.readFileSync(HEALTH_FILE, 'utf8')) : DEFAULT_HEALTH;
        const updated = {
          ...existing,
          ...body,
          date: body.date || new Date().toISOString().split('T')[0],
          sats: body.sats !== undefined ? Number(body.sats) : existing.sats,
          wakeTime: body.wakeTime || existing.wakeTime,
          bedTime: body.bedTime || existing.bedTime,
          restingHeartRate: body.restingHeartRate || existing.restingHeartRate,
          hrv: body.hrv || existing.hrv,
          source: body.source || "Apple Watch Sync",
          lastSynced: new Date().toISOString()
        };

        // Recompute readiness score
        const hrvScore = Math.min(100, Math.max(40, (updated.hrv / 70) * 80));
        const satsScore = updated.sats >= 97 ? 100 : (updated.sats >= 95 ? 85 : 70);
        const sleepScore = Math.min(100, (updated.sleepDurationHours / 8) * 100);
        updated.readinessScore = Math.round((hrvScore * 0.4) + (satsScore * 0.3) + (sleepScore * 0.3));

        fs.writeFileSync(HEALTH_FILE, JSON.stringify(updated, null, 2));

        // Mirror to iCloud folder if available
        if (fs.existsSync(ICLOUD_DIR)) {
          try {
            fs.writeFileSync(ICLOUD_HEALTH_FILE, JSON.stringify(updated, null, 2));
          } catch (e) {}
        }

        console.log(`[Health Sync] Updated: Wake=${updated.wakeTime}, Sats=${updated.sats}%, HRV=${updated.hrv}ms, Readiness=${updated.readinessScore}%`);
        broadcastEvent('health_updated', updated);

        return jsonResponse(res, 200, {
          success: true,
          message: 'Apple Health stats recorded successfully',
          data: updated
        });
      } catch (saveErr) {
        return jsonResponse(res, 500, { error: saveErr.toString() });
      }
    });
    return;
  }

  // Trigger Apple Shortcut locally if installed
  if (pathname === '/api/health/trigger-shortcut' && req.method === 'POST') {
    exec('shortcuts run "ChronoFlow Health Export"', (err, stdout, stderr) => {
      if (err) {
        return jsonResponse(res, 200, {
          success: false,
          message: 'Shortcut not installed or errored. You can sync via iCloud or paste JSON.',
          details: stderr || err.message
        });
      }
      return jsonResponse(res, 200, {
        success: true,
        message: 'Shortcut executed successfully',
        output: stdout
      });
    });
    return;
  }

  // OmniFocus: Fetch Tasks
  if (pathname === '/api/omnifocus/tasks' && req.method === 'GET') {
    const scriptPath = path.join(__dirname, 'scripts', 'omnifocus_export.applescript');

    execFile('osascript', [scriptPath], { timeout: 10000 }, (error, stdout, stderr) => {
      let cached = [];
      if (fs.existsSync(OMNI_CACHE_FILE)) {
        try {
          cached = JSON.parse(fs.readFileSync(OMNI_CACHE_FILE, 'utf8'));
        } catch (e) {}
      }

      if (error || !stdout) {
        return jsonResponse(res, 200, {
          success: false,
          live: false,
          message: 'OmniFocus is currently closed or in standby. Serving baseline tasks.',
          tasks: cached.length > 0 ? cached : null
        });
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        if (parsed.success && parsed.tasks && parsed.tasks.length > 0) {
          fs.writeFileSync(OMNI_CACHE_FILE, JSON.stringify(parsed.tasks, null, 2));
          return jsonResponse(res, 200, {
            success: true,
            live: true,
            count: parsed.tasks.length,
            dueCount: parsed.dueCount,
            plannedCount: parsed.plannedCount,
            tasks: parsed.tasks
          });
        }

        return jsonResponse(res, 200, {
          success: false,
          live: false,
          message: parsed.message || 'OmniFocus is in standby. Open OmniFocus to sync live tasks.',
          tasks: cached.length > 0 ? cached : null
        });
      } catch (parseErr) {
        return jsonResponse(res, 200, {
          success: false,
          live: false,
          message: 'OmniFocus standby.',
          tasks: cached.length > 0 ? cached : null
        });
      }
    });
    return;
  }

  // OmniFocus: Launch App
  if (pathname === '/api/omnifocus/launch' && req.method === 'POST') {
    exec('open -a OmniFocus', (err, stdout, stderr) => {
      return jsonResponse(res, 200, {
        success: !err,
        message: err ? 'Please open OmniFocus from your Applications or Dock.' : 'OmniFocus launched.'
      });
    });
    return;
  }

  // OmniFocus: Cloud & Daemon Sync Endpoint
  if ((pathname === '/api/omnifocus/sync' || pathname === '/api/omnifocus/tasks') && req.method === 'POST') {
    readJsonBody(req, (err, body) => {
      if (err || !body) {
        return jsonResponse(res, 400, { error: 'Invalid JSON payload' });
      }
      const tasks = body.tasks || (Array.isArray(body) ? body : []);
      if (tasks.length === 0) {
        return jsonResponse(res, 400, { error: 'No tasks provided in payload' });
      }
      fs.writeFileSync(OMNI_CACHE_FILE, JSON.stringify(tasks, null, 2));
      broadcastEvent('omnifocus_updated', { count: tasks.length });
      return jsonResponse(res, 200, {
        success: true,
        live: true,
        count: tasks.length,
        dueCount: tasks.filter(t => t.isDueToday).length,
        plannedCount: tasks.filter(t => t.isPlannedToday && !t.isDueToday).length,
        message: `Successfully synchronized ${tasks.length} tasks`
      });
    });
    return;
  }

  // OmniFocus: Batch Update Tasks
  if (pathname === '/api/omnifocus/batch-update' && req.method === 'POST') {
    readJsonBody(req, (err, body) => {
      if (err || !body || !body.updates) {
        return jsonResponse(res, 400, { error: 'Invalid update payload. Expected { updates: [...] }' });
      }

      const scriptPath = path.join(__dirname, 'scripts', 'omnifocus_update.applescript');
      const payloadString = JSON.stringify(body);

      execFile('osascript', [scriptPath, payloadString], { timeout: 15000 }, (error, stdout, stderr) => {
        if (error) {
          return jsonResponse(res, 200, {
            success: false,
            live: false,
            message: 'OmniFocus update could not execute natively. You can copy the generated AppleScript/batch script.',
            details: stderr || error.message
          });
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          broadcastEvent('omnifocus_updated', parsed);
          return jsonResponse(res, 200, parsed);
        } catch (e) {
          return jsonResponse(res, 200, { success: true, raw: stdout });
        }
      });
    });
    return;
  }

  // --- Static Files Serving ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA-style routing if needed
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        return res.end('Error loading file');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

function jsonResponse(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=UTF-8' });
  res.end(JSON.stringify(data, null, 2));
}

function readJsonBody(req, callback) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return callback(null, JSON.parse(req.body));
      } catch (err) {
        return callback(err, null);
      }
    }
    return callback(null, req.body);
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
    if (body.length > 1e6) {
      req.connection.destroy();
    }
  });
  req.on('end', () => {
    try {
      const parsed = body.trim() ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (err) {
      callback(err, null);
    }
  });
}

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                      CHRONOFLOW STUDIO                            ║
║     Ultradian Energy Architecture • OmniFocus • Apple Health      ║
╚═══════════════════════════════════════════════════════════════════╝

🚀 Studio running at: http://localhost:${PORT}
🍏 OmniFocus Integration: Ready (osascript JXA Bridge)
⌚ Apple Health / Watch Sync: Ready
   • Webhook: POST http://localhost:${PORT}/api/health/sync
   • iCloud Sync folder: ${ICLOUD_DIR}
`);
});
