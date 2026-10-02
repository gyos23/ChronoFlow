// ChronoFlow Cloud Store Adapter
// Supports Upstash Redis / Vercel KV REST API, with resilient fallback to ephemeral storage / pre-seeded cache

const fs = require('fs');
const path = require('path');

const TMP_HEALTH_FILE = '/tmp/chronoflow_health.json';
const TMP_TASKS_FILE = '/tmp/chronoflow_tasks.json';

// Pre-seeded baseline health
const DEFAULT_HEALTH = {
  date: new Date().toISOString().split('T')[0],
  wakeTime: "06:00",
  bedTime: "22:30",
  sleepDurationHours: 7.5,
  sats: 98,
  restingHeartRate: 52,
  hrv: 68,
  respiratoryRate: 14.5,
  wristTemperatureVariance: "+0.2°F",
  readinessScore: 92,
  workout: {
    logged: true,
    title: "Morning Strength & Conditioning",
    startTime: "07:00",
    endTime: "08:00",
    durationMins: 60,
    activeCalories: 435,
    avgHeartRate: 138
  },
  source: "Apple Watch (Initial Baseline)",
  lastSynced: new Date().toISOString()
};

// Pre-seeded curated tasks (Today's 13 OmniFocus tasks)
const DEFAULT_TASKS = [
  {
    id: "g1j3ilOSnv8",
    title: "Study",
    project: "📆 Day 2 Day",
    tags: ["PB. High"],
    duration: 60,
    slot: "c1",
    type: "deep",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "9:00 AM"
  },
  {
    id: "pqFa4eeU2Y6",
    title: "Update portfolio - in progress as of 8/19",
    project: "⚪️2. Land Next Role ▶️",
    tags: ["P4. Forward", "PA. Top", "T3. High"],
    duration: 60,
    slot: "c1",
    type: "deep",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "9:15 AM"
  },
  {
    id: "jhkjtpBlgb_",
    title: "Apply to work",
    project: "⚪️2. Land Next Role ▶️",
    tags: ["P4. Forward", "PA. Top", "T3. High"],
    duration: 75,
    slot: "c2",
    type: "deep",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "3:15 PM"
  },
  {
    id: "nJLEA5wxNBA",
    title: "upload photos for Arthur and Marcus",
    project: "📆 Day 2 Day",
    tags: ["PC. Normal", "P2. Family"],
    duration: 20,
    slot: "c3",
    type: "admin",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "5:00 PM"
  },
  {
    id: "a8cCGWbr44W",
    title: "Clear eyes are MRI safe",
    project: "📆 Day 2 Day",
    tags: ["PB. High"],
    duration: 25,
    slot: "c3",
    type: "admin",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "5:00 PM"
  },
  {
    id: "mrnHJC6Vtoa",
    title: "Nidhca form",
    project: "📆 Day 2 Day",
    tags: ["PA. Top", "P3. Finance"],
    duration: 30,
    slot: "c3",
    type: "admin",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "5:00 PM"
  },
  {
    id: "m5Sur6ZgUjs",
    title: "Study Learning Techniques",
    project: "📆 Day 2 Day",
    tags: ["P1. Fortitude"],
    duration: 30,
    slot: "c4",
    type: "habit",
    status: "pending",
    isDueToday: false,
    isPlannedToday: true,
    omniTime: ""
  },
  {
    id: "n52EFrMy8S2",
    title: "Post mortem of time in aer Lingus ",
    project: "📆 Day 2 Day",
    tags: ["P4. Forward"],
    duration: 30,
    slot: "c4",
    type: "admin",
    status: "pending",
    isDueToday: false,
    isPlannedToday: true,
    omniTime: ""
  },
  {
    id: "i4FgSBIPm3m",
    title: "Time box",
    project: "📆 Day 2 Day",
    tags: ["PB. High", "P1. Fortitude", "T2. Manageable"],
    duration: 20,
    slot: "shutdown",
    type: "habit",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "5:00 PM"
  },
  {
    id: "aaAhMNh8HpY",
    title: "Draft & schedule \"Why I built this\" origin post / Reel (script + shot list needed)",
    project: "🔴 1. Sell 300 Planners 📖",
    tags: ["PA. Top", "P5. Freedom", "T3. High"],
    duration: 60,
    slot: "thu",
    type: "deep",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "5:00 PM"
  },
  {
    id: "gSJe1tSsKCY",
    title: "Synthesize pmi events for post",
    project: "📆 Day 2 Day",
    tags: ["P4. Forward", "PB. High", "T2. Manageable"],
    duration: 45,
    slot: "thu",
    type: "admin",
    status: "pending",
    isDueToday: false,
    isPlannedToday: true,
    omniTime: ""
  },
  {
    id: "ieb6qJDeADF",
    title: "🔁 Publish From the Ground Up newsletter + 500-sub target check-in",
    project: "🔴 1. Sell 300 Planners 📖",
    tags: ["PB. High", "P5. Freedom", "T3. High"],
    duration: 90,
    slot: "thu",
    type: "deep",
    status: "pending",
    isDueToday: true,
    isPlannedToday: false,
    omniTime: "5:00 PM"
  },
  {
    id: "celrrIQIQlu",
    title: "Continue exploring videos that may be business related - I left off January 2025",
    project: "📆 Day 2 Day",
    tags: ["PC. Normal", "E1. Low", "P5. Freedom"],
    duration: 60,
    slot: "fri",
    type: "deep",
    status: "pending",
    isDueToday: false,
    isPlannedToday: true,
    omniTime: ""
  }
];

// Check if Upstash or Vercel KV REST API is configured
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvCommand(cmd, ...args) {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const url = `${KV_URL}/${cmd}/${args.map(encodeURIComponent).join('/')}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result;
  } catch (err) {
    console.warn('KV command error:', err.message);
    return null;
  }
}

async function getHealth() {
  if (KV_URL && KV_TOKEN) {
    const val = await kvCommand('get', 'health_today');
    if (val) {
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch (e) {}
    }
  }

  // Check /tmp file fallback
  try {
    if (fs.existsSync(TMP_HEALTH_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_HEALTH_FILE, 'utf8'));
    }
  } catch (e) {}

  return DEFAULT_HEALTH;
}

async function saveHealth(data) {
  if (KV_URL && KV_TOKEN) {
    await kvCommand('set', 'health_today', JSON.stringify(data));
  }

  try {
    fs.writeFileSync(TMP_HEALTH_FILE, JSON.stringify(data, null, 2));
  } catch (e) {}
}

async function getTasks() {
  if (KV_URL && KV_TOKEN) {
    const val = await kvCommand('get', 'omnifocus_tasks');
    if (val) {
      try { return typeof val === 'string' ? JSON.parse(val) : val; } catch (e) {}
    }
  }

  // Check /tmp file fallback
  try {
    if (fs.existsSync(TMP_TASKS_FILE)) {
      return JSON.parse(fs.readFileSync(TMP_TASKS_FILE, 'utf8'));
    }
  } catch (e) {}

  // Check data directory if running locally
  try {
    const localCache = path.join(process.cwd(), 'data', 'omnifocus_cache.json');
    if (fs.existsSync(localCache)) {
      return JSON.parse(fs.readFileSync(localCache, 'utf8'));
    }
  } catch (e) {}

  return DEFAULT_TASKS;
}

async function saveTasks(tasks) {
  if (KV_URL && KV_TOKEN) {
    await kvCommand('set', 'omnifocus_tasks', JSON.stringify(tasks));
  }

  try {
    fs.writeFileSync(TMP_TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (e) {}
}

module.exports = {
  getHealth,
  saveHealth,
  getTasks,
  saveTasks,
  DEFAULT_HEALTH,
  DEFAULT_TASKS
};
