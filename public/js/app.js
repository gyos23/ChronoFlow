// ChronoFlow Core Client Application
// Ultradian Energy Architecture with Apple Health/Watch & OmniFocus Live Bridges

// Audio synthesizer with Tone.js for elegant focus cues
let chimeSynth = null;
function playChime(freq = "C5", dur = "8n") {
  try {
    if (!chimeSynth && window.Tone) {
      chimeSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.1, release: 1.2 }
      }).toDestination();
      chimeSynth.volume.value = -10;
    }
    if (Tone && Tone.context && Tone.context.state !== 'running') {
      Tone.start();
    }
    if (chimeSynth) {
      chimeSynth.triggerAttackRelease(freq, dur);
    }
  } catch (err) {
    console.debug("Audio note playback bypassed", err);
  }
}

// Time Calculation Utilities
function timeStringToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return (parts[0] * 60) + (parts[1] || 0);
}

function minutesToTimeStr(mins) {
  const normalized = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Dynamic Upcoming Calendar Days (Tomorrow + 4 days forward)
function getUpcomingDays() {
  const days = [];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let offset = 1; offset <= 4; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dayOfWeek = d.getDay();
    const key = `day_${offset}`;
    const shortDay = dayNamesShort[dayOfWeek];
    const fullDay = dayNamesFull[dayOfWeek];
    const dateNum = d.getDate();
    const month = monthNames[d.getMonth()];
    
    days.push({
      key: key,
      offset: offset,
      shortLabel: shortDay,
      fullTitle: `${fullDay}, ${month} ${dateNum} Staging`,
      dateDisplay: `${fullDay}, ${month} ${dateNum}`,
      desc: offset === 1 
        ? `Upcoming priority execution day (${fullDay}).`
        : `Capacity headroom & secondary staging (${fullDay}).`,
      rationale: offset === 1
        ? `Staging non-critical loops into ${fullDay} keeps today's cognitive bandwidth protected.`
        : `Safely deferred to ${fullDay} so your working memory stays focused on today.`
    });
  }
  return days;
}

// Dynamic Ultradian Slots Generator tailored to biological wake time
function generateUltradianSlots(wakeTimeStr = '06:00', sleepTimeStr = '22:30') {
  const wakeM = timeStringToMinutes(wakeTimeStr);

  const getWindow = (startOffset, duration) => {
    const start = wakeM + startOffset;
    const end = start + duration;
    return `${minutesToTimeStr(start)} – ${minutesToTimeStr(end)}`;
  };

  const isEarlyKickoff = wakeTimeStr === '06:00';
  const startOffsetC1 = isEarlyKickoff ? 285 : 150; 
  const c1Dur = 90;
  const t1Dur = 25;
  const c2Dur = 80;
  const nadirDur = 45;
  const c3Dur = 75;
  const t2Dur = 20;
  const c4Dur = 70;
  const shutdownDur = 30;

  const c1Start = startOffsetC1;
  const t1Start = c1Start + c1Dur;
  const c2Start = t1Start + t1Dur;
  const nadirStart = c2Start + c2Dur;
  const c3Start = nadirStart + nadirDur;
  const t2Start = c3Start + c3Dur;
  const c4Start = t2Start + t2Dur;
  const shutdownStart = c4Start + c4Dur;

  return [
    {
      id: 'foundation',
      title: 'Morning Foundation & Priming',
      timeRange: getWindow(0, startOffsetC1),
      durationMins: startOffsetC1,
      startOffset: 0,
      type: 'habit',
      phaseName: 'Physiological Priming (Gym & Adenosine Clearance)',
      color: 'from-emerald-500/20 to-teal-500/10',
      borderColor: 'border-emerald-500/40',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
      description: 'Morning physical training, sunlight exposure, hydration, and clean adenosine clearance before deep work kickoff.'
    },
    {
      id: 'c1',
      title: 'Cycle 1: The Golden Midday Peak',
      timeRange: getWindow(c1Start, c1Dur),
      durationMins: c1Dur,
      startOffset: c1Start,
      type: 'deep',
      phaseName: 'Peak Alertness & Flow',
      color: 'from-amber-500/25 to-indigo-500/15',
      borderColor: 'border-amber-500/50',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      description: 'Premier cognitive window after exercise, protein fuel, and shower. 100% focus on Product Breakdown Clips.'
    },
    {
      id: 't1',
      title: 'Trough 1: Neurological Decompression',
      timeRange: getWindow(t1Start, t1Dur),
      durationMins: t1Dur,
      startOffset: t1Start,
      type: 'trough',
      phaseName: 'Ultradian Trough',
      color: 'from-sky-500/15 to-transparent',
      borderColor: 'border-sky-500/40',
      badgeColor: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
      description: 'Step away from screens. Hydrate, stretch, replenish acetylcholine.'
    },
    {
      id: 'c2',
      title: 'Cycle 2: High Execution Peak',
      timeRange: getWindow(c2Start, c2Dur),
      durationMins: c2Dur,
      startOffset: c2Start,
      type: 'deep',
      phaseName: 'Analytical & Creative Execution',
      color: 'from-emerald-500/25 to-indigo-500/15',
      borderColor: 'border-emerald-500/50',
      badgeColor: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
      description: 'Record clips or run high-conviction job application sprint.'
    },
    {
      id: 'nadir',
      title: 'Circadian Nadir & NSDR Recovery',
      timeRange: getWindow(nadirStart, nadirDur),
      durationMins: nadirDur,
      startOffset: nadirStart,
      type: 'trough',
      phaseName: 'Post-Prandial Dip (~8h post-wake)',
      color: 'from-blue-600/20 to-transparent',
      borderColor: 'border-blue-500/40',
      badgeColor: 'text-blue-300 bg-blue-500/25 border-blue-500/40',
      description: 'Natural core temperature dip. 20m Non-Sleep Deep Rest (NSDR) or eyes-closed breathing.'
    },
    {
      id: 'c3',
      title: 'Cycle 3: Customer & Communication Blitz',
      timeRange: getWindow(c3Start, c3Dur),
      durationMins: c3Dur,
      startOffset: c3Start,
      type: 'admin',
      phaseName: 'Low-Friction Execution',
      color: 'from-cyan-500/25 to-slate-800/20',
      borderColor: 'border-cyan-500/50',
      badgeColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
      description: 'Direct outreach: DM 5 past buyers, upload photos for Arthur/Marcus, and clear quick messages.'
    },
    {
      id: 't2',
      title: 'Trough 2: Outdoor Walk & Air',
      timeRange: getWindow(t2Start, t2Dur),
      durationMins: t2Dur,
      startOffset: t2Start,
      type: 'trough',
      phaseName: 'Ultradian Trough',
      color: 'from-sky-500/15 to-transparent',
      borderColor: 'border-sky-500/40',
      badgeColor: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
      description: 'Quick sunlight exposure and physical shakeout before late afternoon rebound.'
    },
    {
      id: 'c4',
      title: 'Cycle 4: Rebound Intake & Synthesis',
      timeRange: getWindow(c4Start, c4Dur),
      durationMins: c4Dur,
      startOffset: c4Start,
      type: 'admin',
      phaseName: 'Circadian Rebound',
      color: 'from-purple-500/25 to-slate-800/20',
      borderColor: 'border-purple-500/50',
      badgeColor: 'text-purple-300 bg-purple-500/20 border-purple-500/40',
      description: 'Review notes, lesson takeaways, or light LinkedIn Learning.'
    },
    {
      id: 'shutdown',
      title: 'Workday Shutdown Ritual',
      timeRange: getWindow(shutdownStart, shutdownDur),
      durationMins: shutdownDur,
      startOffset: shutdownStart,
      type: 'habit',
      phaseName: 'Workday Closure',
      color: 'from-slate-800/60 to-slate-900/60',
      borderColor: 'border-slate-700',
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
      description: 'Time-box tomorrow, update OmniFocus, and transition into evening rest.'
    }
  ];
}

// Initial Slot Setup
let ULTRADIAN_SLOTS = generateUltradianSlots('06:00', '22:30');

// Initial Curated Tasks (from OmniFocus 4 Live Database)
const INITIAL_TASKS = [
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
    slot: "day_1",
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
    slot: "day_1",
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
    slot: "day_1",
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
    slot: "day_2",
    type: "deep",
    status: "pending",
    isDueToday: false,
    isPlannedToday: true,
    omniTime: ""
  }
];

// App State
let state = {
  wakeTime: '07:14',
  sleepTime: '22:30',
  viewMode: 'today', // 'today' | 'tomorrow'
  tomorrowWakeTime: '07:14',
  tomorrowSleepTime: '22:30',
  tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
  activeDayTab: 'day_1',
  showTroughs: true,
  omniLive: false,
  health: {
    sats: 97,
    hrv: 38,
    rhr: 52,
    sleepDuration: "7:01",
    readiness: 88,
    source: "Apple Watch Sync",
    workoutLogged: true,
    lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  timer: {
    active: false,
    slotId: 'c1',
    remainingSeconds: 90 * 60,
    totalSeconds: 90 * 60,
    intervalId: null
  }
};

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  // Load saved tomorrow plan if available
  try {
    const savedTomorrow = localStorage.getItem('chronoflow_tomorrow_plan');
    if (savedTomorrow) {
      const parsed = JSON.parse(savedTomorrow);
      if (parsed.tomorrowWakeTime) state.tomorrowWakeTime = parsed.tomorrowWakeTime;
      if (parsed.tomorrowSleepTime) state.tomorrowSleepTime = parsed.tomorrowSleepTime;
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        parsed.tasks.forEach(pt => {
          const existing = state.tasks.find(t => t.id === pt.id);
          if (existing) {
            existing.slot = pt.slot;
          }
        });
      }
    }
  } catch (e) {}

  setupSSE();
  fetchHealthStats();
  fetchOmniTasks();
  setupEventListeners();
  updateClock();
  renderApp();
  setInterval(updateClock, 30000);
});

// Setup Server-Sent Events (SSE) for Real-Time Background Sync
function setupSSE() {
  try {
    const eventSource = new EventSource('/api/events');
    eventSource.addEventListener('health_updated', (e) => {
      const data = JSON.parse(e.data);
      applyHealthData(data);
      showToast(`⌚ Apple Watch stats auto-updated! Sats: ${data.sats}% • Wake: ${data.wakeTime}`);
    });
    eventSource.addEventListener('omnifocus_updated', (e) => {
      showToast('🍏 OmniFocus changes synced to desktop database!');
    });
  } catch (err) {
    console.debug('SSE initialization skipped', err);
  }
}

// Fetch Apple Health from API with localStorage fallback & self-healing
async function fetchHealthStats() {
  // 1. Immediately hydrate from localStorage if user previously received a watch sync
  try {
    const cached = localStorage.getItem('chronoflow_health_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      applyHealthData(parsed, false);
    }
  } catch (e) {}

  try {
    const res = await fetch('/api/health/today');
    if (res.ok) {
      const serverData = await res.json();
      
      let clientCache = null;
      try {
        const c = localStorage.getItem('chronoflow_health_cache');
        if (c) clientCache = JSON.parse(c);
      } catch (e) {}

      const isServerInitial = serverData.source && serverData.source.includes('Initial');
      const isClientWatch = clientCache && clientCache.source && clientCache.source.includes('Apple Watch Sync');

      if (isServerInitial && isClientWatch) {
        // Heal serverless container with client's confirmed watch sync
        fetch('/api/health/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientCache)
        }).catch(() => {});
        applyHealthData(clientCache, false);
      } else {
        applyHealthData(serverData);
      }
    }
  } catch (err) {
    console.debug('Health API unreachable, using cached baseline', err);
  }
}

function applyHealthData(data, saveToStorage = true) {
  if (!data) return;
  state.health.sats = data.sats !== undefined ? data.sats : state.health.sats;
  state.health.hrv = data.hrv !== undefined ? Math.round(data.hrv) : state.health.hrv;
  state.health.rhr = data.restingHeartRate !== undefined ? Math.round(data.restingHeartRate) : state.health.rhr;
  state.health.sleepDuration = data.sleepDurationHours !== undefined ? data.sleepDurationHours : state.health.sleepDuration;
  state.health.readiness = (data.readinessScore !== undefined && data.readinessScore !== null && !isNaN(data.readinessScore)) ? data.readinessScore : (state.health.readiness || 88);
  state.health.source = data.source || "Apple Watch Sync";
  state.health.lastSynced = data.lastSynced ? new Date(data.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const incomingWake = data.wakeTime || data.wake || data.wake_time;
  if (incomingWake) {
    let clean = String(incomingWake).trim();
    if (clean.includes('T')) {
      const d = new Date(clean);
      if (!isNaN(d.getTime())) {
        clean = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
    }
    const match12 = clean.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?/i);
    if (match12) {
      let h = parseInt(match12[1], 10);
      const m = match12[2];
      const ampm = match12[3] ? match12[3].toLowerCase() : null;
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      clean = `${String(h).padStart(2, '0')}:${m}`;
    }

    if (clean !== state.wakeTime) {
      state.wakeTime = clean;
      if (data.bedTime) state.sleepTime = data.bedTime;
      ULTRADIAN_SLOTS = generateUltradianSlots(state.wakeTime, state.sleepTime);
    }
  }

  // Update source badge if present
  const sourcePill = document.getElementById('healthSourcePill');
  if (sourcePill) {
    sourcePill.textContent = state.health.source;
  }

  if (saveToStorage) {
    try {
      localStorage.setItem('chronoflow_health_cache', JSON.stringify({
        ...data,
        wakeTime: state.wakeTime,
        sleepTime: state.sleepTime,
        sats: state.health.sats,
        hrv: state.health.hrv,
        restingHeartRate: state.health.rhr,
        sleepDurationHours: state.health.sleepDuration,
        readinessScore: state.health.readiness,
        source: state.health.source,
        savedAt: Date.now()
      }));
    } catch (e) {}
  }

  renderApp();
}

// Intelligent Ingestion & Distribution of OmniFocus Tasks
function ingestOmniFocusTasks(incomingTasks) {
  if (!incomingTasks || incomingTasks.length === 0) return;

  const existingSlotMap = new Map();
  state.tasks.forEach(t => {
    if (t.id && t.slot) existingSlotMap.set(t.id, t.slot);
    if (t.title && t.slot) existingSlotMap.set(t.title, t.slot);
  });

  // Track slot capacities in minutes
  const slotMinutes = { c1: 0, c2: 0, c3: 0, c4: 0, shutdown: 0 };
  const slotLimits = { c1: 90, c2: 80, c3: 75, c4: 70, shutdown: 30 };

  const processed = incomingTasks.map(t => {
    const existingSlot = existingSlotMap.get(t.id) || existingSlotMap.get(t.title);
    let dur = t.duration || 30;
    
    // Cap open-ended marathons (like 4h "Apply to work") into an ultradian sprint
    if (/apply to work/i.test(t.title) && dur > 80) {
      dur = 75;
    }

    return {
      ...t,
      duration: dur,
      slot: existingSlot || t.slot || 'unassigned',
      status: t.status || 'pending'
    };
  });

  // Known preferred slots for today's curated OmniFocus tasks
  const preferredSlotAssignments = {
    'g1j3ilOSnv8': 'c1', // Study
    'pqFa4eeU2Y6': 'c1', // Update portfolio
    'jhkjtpBlgb_': 'c2', // Apply to work
    'nJLEA5wxNBA': 'c3', // upload photos
    'a8cCGWbr44W': 'c3', // Clear eyes are MRI safe
    'mrnHJC6Vtoa': 'c3', // Nidhca form
    'm5Sur6ZgUjs': 'c4', // Study Learning Techniques
    'n52EFrMy8S2': 'c4', // Post mortem
    'i4FgSBIPm3m': 'shutdown', // Time box
    'aaAhMNh8HpY': 'day_1', // Draft & schedule origin post
    'gSJe1tSsKCY': 'day_1', // Synthesize pmi
    'ieb6qJDeADF': 'day_1', // Publish newsletter
    'celrrIQIQlu': 'day_2'  // Continue exploring videos
  };

  processed.forEach(t => {
    if (t.slot === 'unassigned' && preferredSlotAssignments[t.id]) {
      t.slot = preferredSlotAssignments[t.id];
    }
  });

  // Count existing allocated minutes
  processed.forEach(t => {
    if (slotMinutes[t.slot] !== undefined) {
      slotMinutes[t.slot] += (t.duration || 30);
    }
  });

  // Remaining unassigned tasks allocation
  const unassigned = processed.filter(t => t.slot === 'unassigned');
  unassigned.forEach(t => {
    const dur = t.duration || 30;
    const isDeep = t.type === 'deep' || dur >= 60 || (t.tags && t.tags.some(tag => /top|p1|deep|high/i.test(tag)));
    const isHabit = t.type === 'habit' || dur <= 20 || (t.tags && t.tags.some(tag => /habit|routine|daily/i.test(tag)));

    if (isDeep) {
      if (slotMinutes.c1 + dur <= slotLimits.c1 + 15) {
        t.slot = 'c1';
        slotMinutes.c1 += dur;
      } else if (slotMinutes.c2 + dur <= slotLimits.c2 + 15) {
        t.slot = 'c2';
        slotMinutes.c2 += dur;
      } else {
        t.slot = 'unscheduled';
      }
    } else if (isHabit) {
      if (slotMinutes.shutdown + dur <= slotLimits.shutdown + 10) {
        t.slot = 'shutdown';
        slotMinutes.shutdown += dur;
      } else if (slotMinutes.c4 + dur <= slotLimits.c4 + 15) {
        t.slot = 'c4';
        slotMinutes.c4 += dur;
      } else {
        t.slot = 'unscheduled';
      }
    } else {
      if (slotMinutes.c3 + dur <= slotLimits.c3 + 15) {
        t.slot = 'c3';
        slotMinutes.c3 += dur;
      } else if (slotMinutes.c4 + dur <= slotLimits.c4 + 15) {
        t.slot = 'c4';
        slotMinutes.c4 += dur;
      } else {
        t.slot = 'unscheduled';
      }
    }
  });

  state.tasks = processed;
  renderApp();
}

// Fetch OmniFocus Tasks from API
async function fetchOmniTasks(isManualClick = false) {
  const syncBtnText = document.getElementById('omniSyncBtnText');
  const badge = document.getElementById('omniLiveBadge');
  try {
    if (syncBtnText && isManualClick) syncBtnText.textContent = "Checking...";
    const res = await fetch('/api/omnifocus/tasks');
    if (res.ok) {
      const data = await res.json();
      if (data.live && data.tasks && data.tasks.length > 0) {
        state.omniLive = true;
        if (badge) {
          badge.textContent = `Live (${data.tasks.length})`;
          badge.className = "text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40";
        }
        if (syncBtnText) syncBtnText.textContent = "OmniFocus";
        ingestOmniFocusTasks(data.tasks);
        if (isManualClick) {
          showToast(`✓ Synced ${data.tasks.length} live tasks (${data.dueCount || 0} due • ${data.plannedCount || 0} planned) from OmniFocus!`);
        }
      } else if (data.tasks && data.tasks.length > 0) {
        // Cached tasks available
        ingestOmniFocusTasks(data.tasks);
        if (badge) {
          badge.textContent = `Live (${data.tasks.length})`;
          badge.className = "text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40";
        }
        if (syncBtnText) syncBtnText.textContent = "OmniFocus";
      } else {
        state.omniLive = false;
        if (badge) {
          badge.textContent = "Standby";
          badge.className = "text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700";
        }
        if (syncBtnText) syncBtnText.textContent = "OmniFocus";
        if (isManualClick) {
          showToast("Opening OmniFocus...");
          fetch('/api/omnifocus/launch', { method: 'POST' }).catch(() => {});
          try {
            window.location.href = "omnifocus:///perspective/Forecast";
          } catch(e) {}
          setTimeout(() => fetchOmniTasks(false), 2500);
        }
      }
    }
  } catch (err) {
    if (syncBtnText) syncBtnText.textContent = "OmniFocus";
  }
}

// Push Batch Actions Live to OmniFocus
async function pushOmniFocusUpdates() {
  const stagingKeys = ['day_1', 'day_2', 'day_3', 'day_4', 'thu', 'fri', 'sat', 'sun'];
  const offloaded = state.tasks.filter(t => stagingKeys.includes(t.slot));
  if (offloaded.length === 0) {
    showToast("No rescheduled tasks to push.");
    return;
  }

  const updates = offloaded.map(t => {
    let deferDate = new Date();
    let offset = 1;
    if (t.slot === 'day_1' || t.slot === 'thu') offset = 1;
    else if (t.slot === 'day_2' || t.slot === 'fri') offset = 2;
    else if (t.slot === 'day_3' || t.slot === 'sat') offset = 3;
    else if (t.slot === 'day_4' || t.slot === 'sun') offset = 4;
    
    deferDate.setDate(deferDate.getDate() + offset);
    deferDate.setHours(9, 0, 0, 0);

    return {
      id: t.id,
      deferDate: deferDate.toISOString(),
      duration: t.duration
    };
  });

  try {
    showToast("Pushing updates to OmniFocus 4...");
    const res = await fetch('/api/omnifocus/batch-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });
    const result = await res.json();
    if (result.success) {
      playChime("A5", "8n");
      showToast(`✓ Updated ${result.updatedCount || updates.length} tasks in OmniFocus 4!`);
      const modal = document.getElementById('omniModal');
      if (modal) modal.classList.add('hidden');
    } else {
      showToast("OmniFocus update bridged via copy script.");
    }
  } catch (e) {
    showToast("Could not reach native bridge. Use Copy Plan Text.");
  }
}

// Simulate Apple Health profile for instant testing
function simulateHealthProfile(profile) {
  let simulated = {};
  if (profile === 'today-6am') {
    simulated = {
      wakeTime: "06:00",
      bedTime: "22:30",
      sleepDurationHours: 7.5,
      sats: 98,
      hrv: 68,
      restingHeartRate: 52,
      source: "Apple Watch Ultra (Simulated Today)",
      readinessScore: 92
    };
  } else if (profile === 'yesterday-722am') {
    simulated = {
      wakeTime: "07:22",
      bedTime: "23:00",
      sleepDurationHours: 7.2,
      sats: 97,
      hrv: 58,
      restingHeartRate: 55,
      source: "Apple Watch (Simulated Yesterday)",
      readinessScore: 84
    };
  }

  fetch('/api/health/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(simulated)
  }).then(res => res.json()).then(data => {
    applyHealthData(simulated);
    closeHealthModal();
    playChime("E5", "8n");
    showToast(`Calibrated to ${simulated.wakeTime} wake with ${simulated.sats}% Sats!`);
  }).catch(() => {
    applyHealthData(simulated);
    closeHealthModal();
    showToast(`Calibrated to ${simulated.wakeTime} wake!`);
  });
}

function copyShortcutConfig() {
  const recipe = `CHRONOFLOW APPLE SHORTCUT SETUP:
1. Open Shortcuts on iPhone/Mac -> New Shortcut "ChronoFlow Health Sync"
2. Action: "Find Health Samples" (Sleep Analysis, Oxygen Saturation, HRV, Resting Heart Rate)
3. Action: "Dictionary" -> Map { "wakeTime": EndDate, "sats": OxygenSaturation * 100, "hrv": HRV, "restingHeartRate": RHR }
4. Action: "Save File" -> Save to iCloud Drive/ChronoFlow/health_today.json
5. (Optional) Run automatically when Wake-Up Alarm goes off!`;

  navigator.clipboard.writeText(recipe);
  showToast("✓ Copied Shortcut instructions to clipboard!");
}

// --- RENDERING PIPELINE ---
function renderApp() {
  renderHealthTelemetry();
  renderDiagnostics();
  renderTimeline();
  renderStaging();
  renderOmniModal();
  drawUltradianWave();
  updatePhaseBadge();
  updateIntakeBadge();
}

function renderHealthTelemetry() {
  const wakeM = timeStringToMinutes(state.wakeTime);
  const wakeStr = minutesToTimeStr(wakeM);
  const caffeineM = wakeM + 90; // Delay caffeine 90m post wake
  const caffeineStr = minutesToTimeStr(caffeineM);

  // Update header pill
  const headerSummary = document.getElementById('headerWatchSummary');
  if (headerSummary) {
    headerSummary.textContent = `Watch: Sats ${state.health.sats}% • Wake ${wakeStr}`;
  }

  // Update gauges
  const gaugeSats = document.getElementById('gaugeSats');
  if (gaugeSats) gaugeSats.textContent = `${state.health.sats}%`;

  const gaugeHrv = document.getElementById('gaugeHrv');
  if (gaugeHrv) gaugeHrv.textContent = `${state.health.hrv} ms`;

  const gaugeRhr = document.getElementById('gaugeRhr');
  if (gaugeRhr) gaugeRhr.textContent = `${state.health.rhr} bpm`;

  const gaugeSleep = document.getElementById('gaugeSleep');
  if (gaugeSleep) gaugeSleep.textContent = `${state.health.sleepDuration} hrs`;

  const gaugeReadiness = document.getElementById('gaugeReadiness');
  if (gaugeReadiness) gaugeReadiness.textContent = `${state.health.readiness}%`;

  // Update text summaries
  const textSats = document.getElementById('textSatsSummary');
  if (textSats) textSats.textContent = `${state.health.sats}%`;

  const textHrv = document.getElementById('textHrvSummary');
  if (textHrv) textHrv.textContent = `${state.health.hrv} ms`;

  const textRhr = document.getElementById('textRhrSummary');
  if (textRhr) textRhr.textContent = `${state.health.rhr} bpm`;

  const caffeinePill = document.getElementById('caffeineNoticePill');
  if (caffeinePill) {
    const now = new Date();
    const currentM = now.getHours() * 60 + now.getMinutes();
    if (currentM < caffeineM) {
      caffeinePill.textContent = `☕ Delay caffeine until ${caffeineStr} (Adenosine clearance)`;
      caffeinePill.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40";
    } else {
      caffeinePill.textContent = `☕ Caffeine Window Open (cleared at ${caffeineStr})`;
      caffeinePill.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40";
    }
  }

  const modalSats = document.getElementById('modalHealthSats');
  if (modalSats) modalSats.textContent = `${state.health.sats}%`;
  const modalHrv = document.getElementById('modalHealthHrv');
  if (modalHrv) modalHealthHrv.textContent = `${state.health.hrv} ms`;
  const modalRhr = document.getElementById('modalHealthRhr');
  if (modalRhr) modalHealthRhr.textContent = `${state.health.rhr} bpm`;
  const modalWake = document.getElementById('modalHealthWake');
  if (modalWake) modalHealthWake.textContent = `${wakeStr} (${state.health.sleepDuration}h)`;

  // Wake & Sleep calibration header
  const wakeSleepSummary = document.getElementById('wakeSleepSummary');
  if (wakeSleepSummary) wakeSleepSummary.textContent = `Wake: ${wakeStr}`;

  const waveHeader = document.getElementById('circadianWaveHeader');
  if (waveHeader) {
    const sleepStr = minutesToTimeStr(timeStringToMinutes(state.sleepTime));
    waveHeader.textContent = `Circadian Waveform & Ultradian Cycles (${wakeStr} – ${sleepStr})`;
  }

  const waveSubtext = document.getElementById('circadianWaveSubtext');
  if (waveSubtext) {
    waveSubtext.textContent = `Calibrated to ${wakeStr} wake via Apple Watch. Click any cycle block to jump to its focus session.`;
  }
}

function updatePhaseBadge() {
  const now = new Date();
  const currentMinOfDay = now.getHours() * 60 + now.getMinutes();
  const wakeM = timeStringToMinutes(state.wakeTime);
  const elapsedSinceWake = currentMinOfDay - wakeM;

  const badge = document.getElementById('currentPhaseBadge');
  if (!badge) return;

  if (elapsedSinceWake < 0) {
    badge.textContent = `Pre-Wake Rest (Wake set for ${minutesToTimeStr(wakeM)})`;
    badge.className = "text-slate-400 font-semibold";
    return;
  }

  let currentSlot = ULTRADIAN_SLOTS.find(s => {
    return elapsedSinceWake >= s.startOffset && elapsedSinceWake < (s.startOffset + s.durationMins);
  });

  if (currentSlot) {
    if (currentSlot.id === 'foundation') {
      badge.textContent = `Morning Foundation (Kickoff at ${minutesToTimeStr(wakeM + currentSlot.durationMins)})`;
      badge.className = "text-emerald-300 font-bold";
    } else {
      badge.textContent = `${currentSlot.title} (${currentSlot.phaseName})`;
      badge.className = currentSlot.type === 'deep' ? "text-amber-300 font-bold" : "text-sky-300 font-bold";
    }
  } else {
    badge.textContent = "Evening Wind-Down & Restoration";
    badge.className = "text-indigo-300 font-bold";
  }
}

function renderDiagnostics() {
  const stagingKeys = ['day_1', 'day_2', 'day_3', 'day_4', 'thu', 'fri', 'sat', 'sun'];
  const todayTasks = state.tasks.filter(t => !stagingKeys.includes(t.slot) && t.slot !== 'unscheduled');
  const offloadedTasks = state.tasks.filter(t => stagingKeys.includes(t.slot));
  const dueCount = state.tasks.filter(t => t.isDueToday).length;
  const plannedCount = state.tasks.filter(t => t.isPlannedToday).length;

  const deepMins = todayTasks.filter(t => t.type === 'deep' || t.type === 'physical').reduce((acc, t) => acc + t.duration, 0);
  const shallowMins = todayTasks.filter(t => t.type === 'admin' || t.type === 'habit').reduce((acc, t) => acc + t.duration, 0);
  const totalHours = ((deepMins + shallowMins) / 60).toFixed(1);

  const metricDeep = document.getElementById('metricDeepHours');
  if (metricDeep) metricDeep.textContent = `${(deepMins / 60).toFixed(1)} hrs`;

  const metricShallow = document.getElementById('metricShallowHours');
  if (metricShallow) metricShallow.textContent = `${(shallowMins / 60).toFixed(1)} hrs`;

  const metricOffloaded = document.getElementById('metricOffloadedCount');
  if (metricOffloaded) metricOffloaded.textContent = `${offloadedTasks.length} tasks`;

  const bar = document.getElementById('capacityProgressBar');
  const pill = document.getElementById('capacityStatusPill');
  const desc = document.getElementById('capacityStatusText');

  const percent = Math.min(100, (parseFloat(totalHours) / 8.0) * 100);
  if (bar) bar.style.width = `${percent}%`;

  const ofStatusSuffix = (dueCount > 0 || plannedCount > 0) ? ` (${dueCount} Due • ${plannedCount} Planned)` : '';

  if (totalHours > 7.0) {
    if (pill) {
      pill.textContent = `High Cognitive Load: ${todayTasks.length} Tasks${ofStatusSuffix} • ${totalHours}h`;
      pill.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/40";
    }
    if (desc) desc.innerHTML = `OmniFocus synced: <strong>${todayTasks.length} tasks today</strong> (${dueCount} due, ${plannedCount} planned). Exceeds 6h target threshold. Tap <strong>Auto-Triage Today</strong> to protect flow.`;
  } else if (totalHours > 5.5) {
    if (pill) {
      pill.textContent = `Balanced Focus: ${todayTasks.length} Tasks${ofStatusSuffix} • ${totalHours}h`;
      pill.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40";
    }
    if (desc) desc.innerHTML = `OmniFocus synced: <strong>${todayTasks.length} tasks</strong> (${dueCount} due, ${plannedCount} planned). High output day mapped to your <strong>${minutesToTimeStr(timeStringToMinutes(state.wakeTime))}</strong> biological wake cycle.`;
  } else {
    if (pill) {
      pill.textContent = `Optimal Ultradian Balance: ${todayTasks.length} Tasks${ofStatusSuffix} • ${totalHours}h`;
      pill.className = "text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/40";
    }
    if (desc) desc.innerHTML = `OmniFocus synced: <strong>${todayTasks.length} tasks</strong> (${dueCount} due, ${plannedCount} planned). High-leverage blocks aligned with natural neurochemistry.`;
  }

  renderDaySelectorTabs();
}

function renderDaySelectorTabs() {
  const container = document.getElementById('daySelectorTabs');
  if (!container) return;

  const upcoming = getUpcomingDays();
  const daysList = [
    ...upcoming.map(d => ({ key: d.key, label: d.shortLabel, isInbox: false })),
    { key: 'unscheduled', label: 'Inbox', isInbox: true }
  ];

  const subtextEl = document.getElementById('stagingUpcomingSubtext');
  if (subtextEl && upcoming.length >= 2) {
    subtextEl.textContent = `Upcoming capacity headroom (${upcoming[0].shortLabel} – ${upcoming[upcoming.length - 1].shortLabel}).`;
  }

  const modalOptGroup = document.getElementById('taskEditDaysGroup');
  if (modalOptGroup) {
    modalOptGroup.innerHTML = `
      ${upcoming.map(d => `<option value="${d.key}">${d.dateDisplay}</option>`).join('')}
      <option value="unscheduled">Inbox / Unassigned</option>
    `;
  }

  container.innerHTML = '';
  daysList.forEach(item => {
    const isActive = state.activeDayTab === item.key || (item.key === 'day_1' && ['thu'].includes(state.activeDayTab)) || (item.key === 'day_2' && ['fri'].includes(state.activeDayTab));
    let count = 0;
    if (item.isInbox) {
      count = state.tasks.filter(t => t.slot === 'unscheduled').length;
    } else {
      count = state.tasks.filter(t => {
        if (t.slot === item.key) return true;
        if (item.key === 'day_1' && t.slot === 'thu') return true;
        if (item.key === 'day_2' && t.slot === 'fri') return true;
        if (item.key === 'day_3' && t.slot === 'sat') return true;
        if (item.key === 'day_4' && t.slot === 'sun') return true;
        return false;
      }).length;
    }

    const btn = document.createElement('button');
    btn.dataset.day = item.key;
    btn.className = isActive
      ? "day-tab active py-2 rounded-lg text-center transition bg-brand-600 text-white shadow"
      : "day-tab py-2 rounded-lg text-center transition text-slate-300 hover:text-white";

    btn.innerHTML = `
      ${item.label}
      <span class="block text-[11px] font-normal ${isActive ? 'text-slate-200' : 'text-slate-400'}">
        ${count} ${count === 1 ? 'item' : 'items'}
      </span>
    `;

    btn.addEventListener('click', () => {
      state.activeDayTab = item.key;
      renderApp();
    });

    container.appendChild(btn);
  });
}

function getTomorrowSlots() {
  const wake = state.tomorrowWakeTime || state.wakeTime || '07:14';
  const sleep = state.tomorrowSleepTime || state.sleepTime || '22:30';
  const baseSlots = generateUltradianSlots(wake, sleep);
  return baseSlots.map(s => ({
    ...s,
    id: `tomorrow_${s.id}`,
    baseId: s.id,
    title: s.title.replace('Today', 'Tomorrow')
  }));
}

function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;
  container.innerHTML = '';

  const isTomorrow = state.viewMode === 'tomorrow';
  const titleEl = document.getElementById('timelineTitleText');
  const subtextEl = document.getElementById('timelineSubtext');
  const iconEl = document.getElementById('timelineIcon');
  const badgeTomorrowCount = document.getElementById('badgeTomorrowCount');

  // Count tasks assigned to tomorrow
  const tomorrowTasks = state.tasks.filter(t => (t.slot && t.slot.startsWith('tomorrow_')) || t.slot === 'day_1');
  if (badgeTomorrowCount) {
    badgeTomorrowCount.textContent = tomorrowTasks.length;
  }

  // Update segmented control buttons styling
  const btnToday = document.getElementById('btnViewToday');
  const btnTomorrow = document.getElementById('btnViewTomorrow');
  if (btnToday && btnTomorrow) {
    if (isTomorrow) {
      btnToday.className = "px-3 py-1 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-1.5";
      btnTomorrow.className = "px-3 py-1 rounded-lg bg-purple-600 text-white shadow transition flex items-center gap-1.5";
    } else {
      btnToday.className = "px-3 py-1 rounded-lg bg-brand-600 text-white shadow transition flex items-center gap-1.5";
      btnTomorrow.className = "px-3 py-1 rounded-lg text-slate-300 hover:text-white transition flex items-center gap-1.5";
    }
  }

  const upcoming = getUpcomingDays();
  const tomorrowDayObj = upcoming[0];
  const tomorrowName = tomorrowDayObj ? tomorrowDayObj.dateDisplay : 'Tomorrow';

  if (isTomorrow) {
    if (titleEl) titleEl.textContent = `Tomorrow's Chrono-Slots (${tomorrowName})`;
    if (subtextEl) subtextEl.textContent = `Pre-calibrated for ${minutesToTimeStr(timeStringToMinutes(state.tomorrowWakeTime || '07:14'))} wake • Ready for tomorrow's execution.`;
    if (iconEl) iconEl.className = "fa-solid fa-moon text-purple-400";
  } else {
    if (titleEl) titleEl.textContent = "Today's Chrono-Slots";
    if (subtextEl) subtextEl.textContent = `Sequenced from ${minutesToTimeStr(timeStringToMinutes(state.wakeTime))} wake through evening shutdown.`;
    if (iconEl) iconEl.className = "fa-solid fa-list-check text-indigo-400";
  }

  const activeSlots = isTomorrow ? getTomorrowSlots() : ULTRADIAN_SLOTS;

  activeSlots.forEach(slot => {
    if (!state.showTroughs && slot.type === 'trough') {
      return;
    }

    const slotTasks = state.tasks.filter(t => t.slot === slot.id);
    const slotMinutesUsed = slotTasks.reduce((acc, t) => acc + t.duration, 0);

    const card = document.createElement('div');
    card.className = `glass-panel rounded-2xl p-4 lg:p-5 border transition-all ${slot.borderColor} relative overflow-hidden`;

    let html = `
      <div class="flex items-start justify-between gap-3 mb-3.5">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${slot.badgeColor} shadow-sm">
              ${slot.timeRange}
            </span>
            <span class="text-xs uppercase tracking-wider font-extrabold text-slate-300">
              ${slot.phaseName}
            </span>
            ${isTomorrow ? `<span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Tomorrow Plan</span>` : ''}
          </div>
          <h4 class="text-base font-bold text-white mt-1.5 tracking-tight">${slot.title}</h4>
          <p class="text-xs text-slate-300 mt-0.5 leading-relaxed">${slot.description}</p>
        </div>

        <div class="text-right shrink-0">
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 ${slotMinutesUsed > slot.durationMins ? 'text-rose-400 border-rose-500/50' : 'text-slate-200'}">
            ${slotMinutesUsed} / ${slot.durationMins}m
          </span>
          ${slot.type === 'deep' && !isTomorrow ? `
            <button onclick="startFocusTimerForSlot('${slot.id}')" class="block mt-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition">
              <i class="fa-solid fa-play text-[10px] mr-1"></i> Start Focus
            </button>
          ` : ''}
        </div>
      </div>
    `;

    if (slotTasks.length === 0) {
      html += `
        <div class="py-4 px-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700/80 text-center text-xs font-medium text-slate-400 flex items-center justify-between gap-2">
          <span>${slot.type === 'trough' ? 'Protected rest window • Screen-free decompression' : 'Unallocated slot • Ready for intake'}</span>
          <button onclick="promptSlotTask('${slot.id}')" class="text-xs text-brand-300 hover:text-brand-200 font-bold px-2.5 py-1 rounded bg-slate-800 border border-slate-700 transition">
            <i class="fa-solid fa-plus mr-1"></i> Add Task
          </button>
        </div>
      `;
    } else {
      html += `<div class="space-y-2.5">`;
      slotTasks.forEach(task => {
        const isDeep = task.type === 'deep' || task.type === 'physical';
        html += `
          <div class="glass-card rounded-xl p-3.5 flex items-center justify-between gap-3 border-l-4 ${isDeep ? 'border-l-amber-400' : 'border-l-cyan-400'}">
            <div class="space-y-1.5 flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-semibold text-white leading-snug">${task.title}</span>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 border border-amber-500/30">
                  ${task.duration}m
                </span>
                ${task.isDueToday ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40"><i class="fa-solid fa-clock-rotate-left mr-0.5"></i> Due Today</span>` : ''}
                ${task.isPlannedToday && !task.isDueToday ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/25 text-sky-300 border border-sky-500/40"><i class="fa-regular fa-calendar-check mr-0.5"></i> Planned Today</span>` : ''}
                ${task.flagged ? `<span class="text-amber-400 text-xs" title="Flagged in OmniFocus"><i class="fa-solid fa-flag"></i></span>` : ''}
                ${task.omniTime ? `<span class="text-xs font-mono text-cyan-300 font-medium"><i class="fa-regular fa-clock text-[10px] mr-0.5"></i> ${task.omniTime}</span>` : ''}
              </div>
              
              <div class="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                <span class="text-indigo-300 font-bold">${task.project}</span>
                ${task.tags.map(tag => `<span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-200 border border-slate-700">${tag}</span>`).join('')}
              </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <button onclick="openEditTaskModal('${task.id}')" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs" title="Edit Task">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              ${isTomorrow ? `
                <button onclick="pullBackToToday('${task.id}')" class="p-2 rounded-lg bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 transition text-xs" title="Pull Back to Today">
                  <i class="fa-solid fa-arrow-left"></i>
                </button>
              ` : `
                <button onclick="quickReschedule('${task.id}', 'tomorrow_c1')" class="p-2 rounded-lg bg-slate-800 hover:bg-brand-900/60 text-slate-300 hover:text-brand-300 transition text-xs" title="Move to Tomorrow's Flow">
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              `}
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    card.innerHTML = html;
    container.appendChild(card);
  });
}

function renderStaging() {
  const day = state.activeDayTab;
  const listEl = document.getElementById('stagingList');
  const titleEl = document.getElementById('stagingTitle');
  const descEl = document.getElementById('stagingDesc');
  const rationaleEl = document.getElementById('stagingRationaleText');
  const countEl = document.getElementById('stagingItemCount');

  const upcoming = getUpcomingDays();
  const dayConfigMap = {};
  upcoming.forEach(d => {
    dayConfigMap[d.key] = {
      title: d.fullTitle,
      desc: d.desc,
      rationale: d.rationale
    };
  });
  dayConfigMap['unscheduled'] = {
    title: 'OmniFocus Backlog / Inbox',
    desc: 'Tasks awaiting triage slot assignment.',
    rationale: 'Assign to a specific peak or defer out to avoid keeping open loops in active working memory.'
  };

  // Support legacy keys if selected
  if (day === 'thu') state.activeDayTab = 'day_1';
  if (day === 'fri') state.activeDayTab = 'day_2';
  if (day === 'sat') state.activeDayTab = 'day_3';
  if (day === 'sun') state.activeDayTab = 'day_4';

  const activeKey = state.activeDayTab;
  const config = dayConfigMap[activeKey] || dayConfigMap['day_1'] || dayConfigMap['unscheduled'];

  if (titleEl) titleEl.textContent = config.title;
  if (descEl) descEl.textContent = config.desc;
  if (rationaleEl) rationaleEl.textContent = config.rationale;

  const items = state.tasks.filter(t => {
    if (t.slot === activeKey) return true;
    if (activeKey === 'day_1' && t.slot === 'thu') return true;
    if (activeKey === 'day_2' && t.slot === 'fri') return true;
    if (activeKey === 'day_3' && t.slot === 'sat') return true;
    if (activeKey === 'day_4' && t.slot === 'sun') return true;
    return false;
  });

  if (countEl) countEl.textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;

  if (!listEl) return;
  listEl.innerHTML = '';
  if (items.length === 0) {
    listEl.innerHTML = `
      <div class="py-12 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-700/80 rounded-xl bg-slate-900/40">
        <i class="fa-solid fa-seedling text-2xl text-slate-500 mb-2 block"></i>
        No tasks deferred here.<br>Headroom available for high-impact focus.
      </div>
    `;
    return;
  }

  items.forEach(task => {
    const card = document.createElement('div');
    card.className = "glass-card rounded-xl p-3.5 space-y-2 border border-slate-700";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2.5">
        <div>
          <h5 class="text-sm font-semibold text-white leading-snug">${task.title}</h5>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span class="text-xs font-mono text-brand-300 font-bold">${task.duration}m</span>
            ${task.isDueToday ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40"><i class="fa-solid fa-clock-rotate-left mr-0.5"></i> Due Today</span>` : ''}
            ${task.isPlannedToday && !task.isDueToday ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/25 text-sky-300 border border-sky-500/40"><i class="fa-regular fa-calendar-check mr-0.5"></i> Planned Today</span>` : ''}
            ${task.flagged ? `<span class="text-amber-400 text-xs" title="Flagged in OmniFocus"><i class="fa-solid fa-flag"></i></span>` : ''}
            <span class="text-xs text-slate-300 font-semibold">• ${task.project}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="pullBackToToday('${task.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 transition shadow-sm" title="Move into today flow">
            <i class="fa-solid fa-arrow-left"></i> Today
          </button>
          <button onclick="openEditTaskModal('${task.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition">
            <i class="fa-solid fa-pen"></i>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
        ${task.tags.map(tg => `<span class="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700">${tg}</span>`).join('')}
      </div>
    `;
    listEl.appendChild(card);
  });
}

function renderOmniModal() {
  const listEl = document.getElementById('omniActionList');
  if (!listEl) return;

  const stagingKeys = ['day_1', 'day_2', 'day_3', 'day_4', 'thu', 'fri', 'sat', 'sun'];
  const offloaded = state.tasks.filter(t => stagingKeys.includes(t.slot));
  const upcoming = getUpcomingDays();
  const dayNames = {
    day_1: upcoming[0]?.dateDisplay || 'Tomorrow',
    day_2: upcoming[1]?.dateDisplay || 'In 2 days',
    day_3: upcoming[2]?.dateDisplay || 'In 3 days',
    day_4: upcoming[3]?.dateDisplay || 'In 4 days',
    thu: upcoming[0]?.dateDisplay || 'Upcoming Day',
    fri: upcoming[1]?.dateDisplay || 'Upcoming Day',
    sat: upcoming[2]?.dateDisplay || 'Upcoming Day',
    sun: upcoming[3]?.dateDisplay || 'Upcoming Day'
  };

  listEl.innerHTML = '';
  if (offloaded.length === 0) {
    listEl.innerHTML = `<div class="p-3.5 text-slate-400 text-xs font-medium">All tasks currently scheduled for today. Run Auto-Triage first.</div>`;
    return;
  }

  offloaded.forEach(task => {
    const item = document.createElement('div');
    item.className = "p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs";
    item.innerHTML = `
      <div class="space-y-1">
        <span class="text-white font-bold text-sm">${task.title}</span>
        <div class="text-slate-300 font-medium text-xs">Project: <span class="text-indigo-300 font-semibold">${task.project}</span> • Duration: ${task.duration}m</div>
      </div>
      <div class="text-right">
        <span class="text-amber-300 font-bold bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">Defer to ${dayNames[task.slot] || task.slot}</span>
      </div>
    `;
    listEl.appendChild(item);
  });
}

// Draw Interactive Circadian & Ultradian Waveform with High Contrast
function drawUltradianWave() {
  const canvas = document.getElementById('ultradianCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.clientWidth;
  const height = canvas.height = 150;

  ctx.clearRect(0, 0, width, height);

  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.6)');
  bgGrad.addColorStop(1, 'rgba(11, 17, 32, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let y = 30; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const wakeMinutes = timeStringToMinutes(state.wakeTime);
  let sleepMinutes = timeStringToMinutes(state.sleepTime);
  if (sleepMinutes <= wakeMinutes) sleepMinutes += 1440;
  
  const totalMinutes = sleepMinutes - wakeMinutes;

  // Key Time Points
  const timePoints = [
    { label: `Wake (${minutesToTimeStr(wakeMinutes)})`, min: 0 },
    { label: `Gym (7-8a)`, min: 60 },
    { label: `Work Start`, min: 285 },
    { label: `Nadir/NSDR`, min: 480 },
    { label: `Rebound`, min: 620 },
    { label: `Shutdown`, min: 690 },
    { label: `Sleep (${minutesToTimeStr(sleepMinutes)})`, min: totalMinutes }
  ];

  ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  timePoints.forEach(pt => {
    const x = (pt.min / totalMinutes) * width;
    ctx.fillText(pt.label, Math.min(x + 4, width - 90), height - 10);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height - 25);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();
  });

  // Calculate curve
  ctx.beginPath();
  const points = [];
  const steps = 180;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const currentMin = t * totalMinutes;

    const dipCenter = 480; 
    const reboundCenter = 620;

    const circadian = Math.sin((currentMin / totalMinutes) * Math.PI) * 0.44 
                      - 0.28 * Math.exp(-Math.pow((currentMin - dipCenter) / 75, 2))
                      + 0.20 * Math.exp(-Math.pow((currentMin - reboundCenter) / 85, 2));

    const ultradianPeriod = 95;
    const ultradian = Math.sin((currentMin / ultradianPeriod) * Math.PI * 2) * 0.22;

    const combinedEnergy = Math.max(0.1, Math.min(1.0, 0.42 + circadian + ultradian));
    const x = t * width;
    const y = (height - 35) - (combinedEnergy * (height - 55));
    points.push({ x, y, energy: combinedEnergy, min: currentMin });
  }

  // Draw Wave Fill
  const waveGrad = ctx.createLinearGradient(0, 0, 0, height);
  waveGrad.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
  waveGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.25)');
  waveGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.lineTo(width, height - 25);
  ctx.lineTo(0, height - 25);
  ctx.closePath();
  ctx.fillStyle = waveGrad;
  ctx.fill();

  // Wave Stroke
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.strokeStyle = '#a5b4fc';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Render Slots as distinct vertical highlight bands with readable labels
  ULTRADIAN_SLOTS.forEach(slot => {
    if (!slot.startOffset) return;
    const x1 = (slot.startOffset / totalMinutes) * width;
    const x2 = ((slot.startOffset + slot.durationMins) / totalMinutes) * width;
    const bandWidth = Math.max(x2 - x1, 6);
    
    let color = '#6366f1';
    let textColor = '#ffffff';
    let badgeBg = '#4f46e5';
    if (slot.id === 'c1') { color = '#f59e0b'; badgeBg = '#d97706'; }
    if (slot.id === 'c2') { color = '#10b981'; badgeBg = '#059669'; }
    if (slot.id === 'nadir') { color = '#38bdf8'; badgeBg = '#0284c7'; }
    if (slot.id === 'c4') { color = '#c084fc'; badgeBg = '#9333ea'; }

    ctx.fillStyle = color + '22';
    ctx.fillRect(x1, 10, bandWidth, height - 40);

    ctx.strokeStyle = color + '90';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x1, 10, bandWidth, height - 40);

    // Readable Pill Badge for Slot Name
    const slotCode = slot.title.split(':')[0];
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    const textMetrics = ctx.measureText(slotCode);
    const pillWidth = textMetrics.width + 8;
    
    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    ctx.roundRect(x1 + 3, 14, pillWidth, 16, 4);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.fillText(slotCode, x1 + 7, 26);
  });

  // Current Time Indicator on Canvas
  const now = new Date();
  const currentMinOfDay = now.getHours() * 60 + now.getMinutes();
  const elapsedFromWake = currentMinOfDay - wakeMinutes;
  if (elapsedFromWake >= 0 && elapsedFromWake <= totalMinutes) {
    const curX = (elapsedFromWake / totalMinutes) * width;
    ctx.beginPath();
    ctx.moveTo(curX, 0);
    ctx.lineTo(curX, height - 25);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Indicator head
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(curX, 10, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#fecdd3';
    ctx.fillText('NOW', Math.min(curX + 5, width - 30), 20);
  }
}

window.addEventListener('resize', drawUltradianWave);

// --- EVENT LISTENERS & MODAL MANAGEMENT ---
function setupEventListeners() {
  // Day Staging Tabs
  document.querySelectorAll('.day-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.day-tab').forEach(t => {
        t.className = "day-tab py-2 rounded-lg text-center transition text-slate-300 hover:text-white";
        const badge = t.querySelector('span');
        if (badge) badge.className = "block text-[11px] font-normal text-slate-400";
      });
      const current = e.currentTarget;
      current.className = "day-tab active py-2 rounded-lg text-center transition bg-brand-600 text-white shadow";
      const currentBadge = current.querySelector('span');
      if (currentBadge) currentBadge.className = "block text-[11px] font-normal text-slate-200";
      state.activeDayTab = current.dataset.day;
      renderStaging();
    });
  });

  // Auto-Triage Action
  const btnAutoTriage = document.getElementById('btnAutoTriage');
  if (btnAutoTriage) {
    btnAutoTriage.addEventListener('click', () => {
      playChime("E5", "8n");
      
      const slotMinutes = { c1: 0, c2: 0, c3: 0, c4: 0, shutdown: 0 };
      const slotLimits = { c1: 90, c2: 80, c3: 75, c4: 70, shutdown: 30 };

      // Curated energy-aligned mapping for today's 13 OmniFocus tasks
      const preferred = {
        'g1j3ilOSnv8': 'c1', // Study
        'pqFa4eeU2Y6': 'c1', // Update portfolio
        'jhkjtpBlgb_': 'c2', // Apply to work (capped sprint)
        'nJLEA5wxNBA': 'c3', // upload photos
        'a8cCGWbr44W': 'c3', // Clear eyes are MRI safe
        'mrnHJC6Vtoa': 'c3', // Nidhca form
        'm5Sur6ZgUjs': 'c4', // Study Learning Techniques
        'n52EFrMy8S2': 'c4', // Post mortem
        'i4FgSBIPm3m': 'shutdown', // Time box
        'aaAhMNh8HpY': 'day_1', // Draft & schedule origin post
        'gSJe1tSsKCY': 'day_1', // Synthesize pmi
        'ieb6qJDeADF': 'day_1', // Publish newsletter
        'celrrIQIQlu': 'day_2'  // Continue exploring videos
      };

      state.tasks.forEach(t => {
        if (/apply to work/i.test(t.title)) {
          t.duration = 75; // Cap 4h marathon into focused 75m sprint
        }
        if (preferred[t.id]) {
          t.slot = preferred[t.id];
          if (slotMinutes[t.slot] !== undefined) slotMinutes[t.slot] += (t.duration || 30);
        } else if (t.isDueToday || t.isPlannedToday) {
          const dur = t.duration || 30;
          if (t.type === 'deep' && slotMinutes.c1 + dur <= slotLimits.c1 + 15) {
            t.slot = 'c1';
            slotMinutes.c1 += dur;
          } else if (t.type === 'deep' && slotMinutes.c2 + dur <= slotLimits.c2 + 15) {
            t.slot = 'c2';
            slotMinutes.c2 += dur;
          } else if (t.type === 'admin' && slotMinutes.c3 + dur <= slotLimits.c3 + 15) {
            t.slot = 'c3';
            slotMinutes.c3 += dur;
          } else if (slotMinutes.c4 + dur <= slotLimits.c4 + 15) {
            t.slot = 'c4';
            slotMinutes.c4 += dur;
          } else {
            t.slot = 'day_1';
          }
        } else {
          t.slot = 'unscheduled';
        }
      });

      renderApp();
      showToast("✨ Applied Energy-Aligned Triage to all 13 OmniFocus tasks!");
    });
  }

  // Reset Button
  const btnReset = document.getElementById('btnResetAll');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
      renderApp();
      showToast("Reset day to baseline.");
    });
  }

  // Toggle Troughs
  const btnToggleTroughs = document.getElementById('btnCollapseTroughs');
  if (btnToggleTroughs) {
    btnToggleTroughs.addEventListener('click', () => {
      state.showTroughs = !state.showTroughs;
      renderTimeline();
    });
  }

  // Health Modal
  const btnHealthModalTrigger = document.getElementById('btnHealthModalTrigger');
  if (btnHealthModalTrigger) {
    btnHealthModalTrigger.addEventListener('click', openHealthModal);
  }
  const btnCloseHealth = document.getElementById('btnCloseHealthModal');
  if (btnCloseHealth) btnCloseHealth.addEventListener('click', closeHealthModal);
  const btnCloseHealthBtm = document.getElementById('btnCloseHealthModalBottom');
  if (btnCloseHealthBtm) btnCloseHealthBtm.addEventListener('click', closeHealthModal);

  // Sleep / Wake Calibration Modal
  const btnSleepWakeConfig = document.getElementById('btnSleepWakeConfig');
  if (btnSleepWakeConfig) {
    btnSleepWakeConfig.addEventListener('click', openSleepWakeModal);
  }
  const btnCloseSleepWake = document.getElementById('btnCloseSleepWakeModal');
  if (btnCloseSleepWake) btnCloseSleepWake.addEventListener('click', closeSleepWakeModal);
  const btnCancelSleepWake = document.getElementById('btnCancelSleepWake');
  if (btnCancelSleepWake) btnCancelSleepWake.addEventListener('click', closeSleepWakeModal);

  const btnApplySleepWake = document.getElementById('btnApplySleepWake');
  if (btnApplySleepWake) {
    btnApplySleepWake.addEventListener('click', () => {
      const wake = document.getElementById('inputWakeTime').value || '06:00';
      const sleep = document.getElementById('inputSleepTime').value || '22:30';
      executeChronoUpdate(wake, sleep);
      closeSleepWakeModal();
    });
  }

  // OmniFocus Sync & Actions
  const btnSyncOmni = document.getElementById('btnSyncOmni');
  if (btnSyncOmni) {
    btnSyncOmni.addEventListener('click', () => {
      fetchOmniTasks(true);
    });
  }

  const btnExportOmni = document.getElementById('btnExportOmni');
  if (btnExportOmni) {
    btnExportOmni.addEventListener('click', () => {
      renderOmniModal();
      document.getElementById('omniModal').classList.remove('hidden');
    });
  }

  const btnCloseOmni = document.getElementById('btnCloseOmni');
  if (btnCloseOmni) {
    btnCloseOmni.addEventListener('click', () => document.getElementById('omniModal').classList.add('hidden'));
  }
  const btnCloseOmniBtm = document.getElementById('btnCloseOmniBottom');
  if (btnCloseOmniBtm) {
    btnCloseOmniBtm.addEventListener('click', () => document.getElementById('omniModal').classList.add('hidden'));
  }

  const btnPushOmni = document.getElementById('btnPushToOmni');
  if (btnPushOmni) {
    btnPushOmni.addEventListener('click', pushOmniFocusUpdates);
  }

  const btnCopyOmni = document.getElementById('btnCopyOmniText');
  if (btnCopyOmni) {
    btnCopyOmni.addEventListener('click', copyOmniPlanText);
  }

  // Focus Timer Controls
  const btnOpenTimer = document.getElementById('btnOpenTimer');
  if (btnOpenTimer) {
    btnOpenTimer.addEventListener('click', () => startFocusTimerForSlot('c1'));
  }
  const btnCloseTimer = document.getElementById('btnCloseTimer');
  if (btnCloseTimer) {
    btnCloseTimer.addEventListener('click', () => document.getElementById('timerModal').classList.add('hidden'));
  }

  const btnTimerToggle = document.getElementById('btnTimerToggle');
  if (btnTimerToggle) btnTimerToggle.addEventListener('click', toggleTimer);

  const btnTimerReset = document.getElementById('btnTimerReset');
  if (btnTimerReset) btnTimerReset.addEventListener('click', resetTimer);

  const btnSoundTest = document.getElementById('btnSoundTest');
  if (btnSoundTest) {
    btnSoundTest.addEventListener('click', () => {
      playChime("F5", "2n");
      showToast("Chime sound tested.");
    });
  }

  // Task Modal Form
  const taskForm = document.getElementById('taskForm');
  if (taskForm) taskForm.addEventListener('submit', handleTaskFormSubmit);

  const btnAddNew = document.getElementById('btnAddNewTaskModal');
  if (btnAddNew) btnAddNew.addEventListener('click', openNewTaskModal);

  const btnCloseTask = document.getElementById('btnCloseTaskModal');
  if (btnCloseTask) btnCloseTask.addEventListener('click', () => document.getElementById('taskModal').classList.add('hidden'));

  const btnCancelTask = document.getElementById('btnCancelTask');
  if (btnCancelTask) btnCancelTask.addEventListener('click', () => document.getElementById('taskModal').classList.add('hidden'));

  const btnDeleteTask = document.getElementById('btnDeleteTask');
  if (btnDeleteTask) btnDeleteTask.addEventListener('click', handleDeleteTask);

  // Day View Switcher (Today vs. Tomorrow)
  const btnViewToday = document.getElementById('btnViewToday');
  if (btnViewToday) {
    btnViewToday.addEventListener('click', () => switchViewMode('today'));
  }
  const btnViewTomorrow = document.getElementById('btnViewTomorrow');
  if (btnViewTomorrow) {
    btnViewTomorrow.addEventListener('click', () => switchViewMode('tomorrow'));
  }

  // Plan Tomorrow Wizard Triggers
  const btnPlanTomorrowHeader = document.getElementById('btnPlanTomorrowHeader');
  if (btnPlanTomorrowHeader) {
    btnPlanTomorrowHeader.addEventListener('click', openPlanTomorrowWizard);
  }
  const btnOpenPlanFromTimeline = document.getElementById('btnOpenPlanTomorrowFromTimeline');
  if (btnOpenPlanFromTimeline) {
    btnOpenPlanFromTimeline.addEventListener('click', openPlanTomorrowWizard);
  }
  const btnClosePlanTomorrow = document.getElementById('btnClosePlanTomorrow');
  if (btnClosePlanTomorrow) {
    btnClosePlanTomorrow.addEventListener('click', closePlanTomorrowWizard);
  }

  // Wizard Navigation
  const btnWizardPrev = document.getElementById('btnWizardPrev');
  if (btnWizardPrev) {
    btnWizardPrev.addEventListener('click', () => {
      if (currentWizardStep > 1) setWizardStep(currentWizardStep - 1);
    });
  }
  const btnWizardNext = document.getElementById('btnWizardNext');
  if (btnWizardNext) {
    btnWizardNext.addEventListener('click', () => {
      if (currentWizardStep < 3) setWizardStep(currentWizardStep + 1);
    });
  }
  const btnLockInTomorrow = document.getElementById('btnLockInTomorrow');
  if (btnLockInTomorrow) {
    btnLockInTomorrow.addEventListener('click', lockInTomorrowPlan);
  }
  const btnRolloverAll = document.getElementById('btnRolloverAllToTomorrow');
  if (btnRolloverAll) {
    btnRolloverAll.addEventListener('click', rolloverAllIncompleteToTomorrow);
  }

  // Today's Master Intake & Chrono Advisory Modal Triggers
  const btnTodayIntake = document.getElementById('btnTodayIntake');
  if (btnTodayIntake) {
    btnTodayIntake.addEventListener('click', openTodayIntakeModal);
  }
  const btnOpenTodayIntakeFromTimeline = document.getElementById('btnOpenTodayIntakeFromTimeline');
  if (btnOpenTodayIntakeFromTimeline) {
    btnOpenTodayIntakeFromTimeline.addEventListener('click', openTodayIntakeModal);
  }
  const btnCloseTodayIntake = document.getElementById('btnCloseTodayIntake');
  if (btnCloseTodayIntake) {
    btnCloseTodayIntake.addEventListener('click', closeTodayIntakeModal);
  }
  const btnCloseTodayIntakeBottom = document.getElementById('btnCloseTodayIntakeBottom');
  if (btnCloseTodayIntakeBottom) {
    btnCloseTodayIntakeBottom.addEventListener('click', closeTodayIntakeModal);
  }
  const modalTodayIntake = document.getElementById('modalTodayIntake');
  if (modalTodayIntake) {
    modalTodayIntake.addEventListener('click', (e) => {
      if (e.target === modalTodayIntake) closeTodayIntakeModal();
    });
  }
  const btnAcceptAllRecs = document.getElementById('btnAcceptAllRecs');
  if (btnAcceptAllRecs) {
    btnAcceptAllRecs.addEventListener('click', acceptAllRecommendations);
  }
  const btnDeferOverflow = document.getElementById('btnDeferOverflowToTomorrow');
  if (btnDeferOverflow) {
    btnDeferOverflow.addEventListener('click', deferOverflowToTomorrow);
  }
  const filterBtnAll = document.getElementById('filterBtnAll');
  if (filterBtnAll) {
    filterBtnAll.addEventListener('click', () => filterIntakeList('all'));
  }
  const filterBtnToday = document.getElementById('filterBtnToday');
  if (filterBtnToday) {
    filterBtnToday.addEventListener('click', () => filterIntakeList('today'));
  }
  const filterBtnDefer = document.getElementById('filterBtnDefer');
  if (filterBtnDefer) {
    filterBtnDefer.addEventListener('click', () => filterIntakeList('defer'));
  }
}

// Plan Tomorrow Wizard State & Logic
let currentWizardStep = 1;

function openPlanTomorrowWizard() {
  currentWizardStep = 1;
  const modal = document.getElementById('modalPlanTomorrow');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderWizardStep(1);
}

function closePlanTomorrowWizard() {
  const modal = document.getElementById('modalPlanTomorrow');
  if (modal) modal.classList.add('hidden');
}

function setWizardStep(stepNum) {
  currentWizardStep = stepNum;
  renderWizardStep(stepNum);
}

function renderWizardStep(stepNum) {
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`tabWizardStep${i}`);
    const content = document.getElementById(`wizardStepContent${i}`);
    if (tab && content) {
      if (i === stepNum) {
        tab.className = "wizard-tab py-2 rounded-lg text-center transition bg-purple-600 text-white shadow font-bold";
        content.classList.remove('hidden');
      } else {
        tab.className = "wizard-tab py-2 rounded-lg text-center transition text-slate-300 hover:text-white font-bold";
        content.classList.add('hidden');
      }
    }
  }

  const btnPrev = document.getElementById('btnWizardPrev');
  const btnNext = document.getElementById('btnWizardNext');
  if (btnPrev) {
    if (stepNum === 1) {
      btnPrev.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      btnPrev.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
  if (btnNext) {
    if (stepNum === 3) {
      btnNext.classList.add('hidden');
    } else {
      btnNext.classList.remove('hidden');
      btnNext.textContent = stepNum === 1 ? 'Next: Tomorrow Slots' : 'Next: Wake Target';
    }
  }

  if (stepNum === 1) renderWizardStep1();
  if (stepNum === 2) renderWizardStep2();
  if (stepNum === 3) renderWizardStep3();
}

function renderWizardStep1() {
  const listEl = document.getElementById('wizardIncompleteTasksList');
  const summaryEl = document.getElementById('wizardTodayRemainingSummary');
  if (!listEl) return;

  const todayIncomplete = state.tasks.filter(t => 
    ['c1', 'c2', 'c3', 'c4', 'shutdown', 'foundation'].includes(t.slot) && t.status !== 'completed'
  );

  if (summaryEl) {
    summaryEl.textContent = todayIncomplete.length > 0
      ? `Found ${todayIncomplete.length} unfinished task${todayIncomplete.length > 1 ? 's' : ''} in today's slots. Rollover to tomorrow or clear to avoid cognitive residue.`
      : "All of today's tasks are complete or already rolled over! You have a clean slate.";
  }

  if (todayIncomplete.length === 0) {
    listEl.innerHTML = `
      <div class="py-6 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-center text-xs text-slate-300 space-y-1">
        <i class="fa-solid fa-circle-check text-emerald-400 text-lg mb-1 block"></i>
        <strong class="text-white block text-sm">Today is 100% Cleared</strong>
        <span>No open tasks remaining in today's slots. Click "Next Step" to allocate tomorrow's priorities.</span>
      </div>
    `;
    return;
  }

  let html = '';
  todayIncomplete.forEach(task => {
    html += `
      <div class="bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div class="space-y-1 flex-1 min-w-[200px]">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-white font-semibold text-xs">${task.title}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-amber-500/30">${task.duration}m</span>
            <span class="text-[10px] text-slate-400 font-medium">${task.project}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <button type="button" onclick="moveTaskToTomorrowSlot('${task.id}', 'tomorrow_c1')" class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition" title="Move to Tomorrow Cycle 1">
            → Cycle 1
          </button>
          <button type="button" onclick="moveTaskToTomorrowSlot('${task.id}', 'tomorrow_c2')" class="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition" title="Move to Tomorrow Cycle 2">
            → Cycle 2
          </button>
          <button type="button" onclick="moveTaskToTomorrowSlot('${task.id}', 'tomorrow_c3')" class="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition" title="Move to Tomorrow Cycle 3">
            → Cycle 3
          </button>
          <button type="button" onclick="quickReschedule('${task.id}', 'unscheduled'); renderWizardStep1();" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition" title="Stash into Backlog">
            Backlog
          </button>
          <button type="button" onclick="markTaskDone('${task.id}'); renderWizardStep1();" class="px-2.5 py-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-[11px] font-bold transition" title="Mark Done">
            ✓ Done
          </button>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
}

function renderWizardStep2() {
  const listEl = document.getElementById('wizardTomorrowAllocatedList');
  const capC1 = document.getElementById('wizardCapC1');
  const capC2 = document.getElementById('wizardCapC2');
  const capC3 = document.getElementById('wizardCapC3');

  const tomorrowTasks = state.tasks.filter(t => 
    (t.slot && t.slot.startsWith('tomorrow_')) || t.slot === 'day_1'
  );

  const minsC1 = state.tasks.filter(t => t.slot === 'tomorrow_c1').reduce((sum, t) => sum + t.duration, 0);
  const minsC2 = state.tasks.filter(t => t.slot === 'tomorrow_c2').reduce((sum, t) => sum + t.duration, 0);
  const minsC3 = state.tasks.filter(t => t.slot === 'tomorrow_c3').reduce((sum, t) => sum + t.duration, 0);

  if (capC1) {
    capC1.textContent = `${minsC1} / 90m`;
    capC1.className = `font-mono text-sm font-bold ${minsC1 > 90 ? 'text-rose-400' : 'text-amber-300'}`;
  }
  if (capC2) {
    capC2.textContent = `${minsC2} / 80m`;
    capC2.className = `font-mono text-sm font-bold ${minsC2 > 80 ? 'text-rose-400' : 'text-emerald-300'}`;
  }
  if (capC3) {
    capC3.textContent = `${minsC3} / 75m`;
    capC3.className = `font-mono text-sm font-bold ${minsC3 > 75 ? 'text-rose-400' : 'text-cyan-300'}`;
  }

  if (!listEl) return;

  if (tomorrowTasks.length === 0) {
    listEl.innerHTML = `
      <div class="py-6 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-center text-xs text-slate-300 space-y-2">
        <i class="fa-solid fa-inbox text-purple-400 text-lg mb-1 block"></i>
        <strong class="text-white block text-sm">No Tasks Slotted for Tomorrow Yet</strong>
        <span>Tasks from Weekly Staging or Backlog will appear here once allocated.</span>
      </div>
    `;
    return;
  }

  let html = '';
  tomorrowTasks.forEach(task => {
    html += `
      <div class="bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <div class="space-y-1 flex-1 min-w-[200px]">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-white font-semibold text-xs">${task.title}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-amber-500/30">${task.duration}m</span>
            <span class="text-[10px] text-slate-400 font-medium">${task.project}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <select onchange="moveTaskToTomorrowSlot('${task.id}', this.value); renderWizardStep2();" class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-purple-400">
            <option value="tomorrow_c1" ${task.slot === 'tomorrow_c1' ? 'selected' : ''}>Cycle 1 (Golden Peak)</option>
            <option value="tomorrow_c2" ${task.slot === 'tomorrow_c2' ? 'selected' : ''}>Cycle 2 (Execution)</option>
            <option value="tomorrow_c3" ${task.slot === 'tomorrow_c3' ? 'selected' : ''}>Cycle 3 (Admin Blitz)</option>
            <option value="tomorrow_c4" ${task.slot === 'tomorrow_c4' ? 'selected' : ''}>Cycle 4 (Rebound)</option>
            <option value="day_1" ${task.slot === 'day_1' ? 'selected' : ''}>Staging Buffer</option>
            <option value="unscheduled">Move to Backlog</option>
          </select>
        </div>
      </div>
    `;
  });

  listEl.innerHTML = html;
}

function renderWizardStep3() {
  const wakeInput = document.getElementById('wizardInputWake');
  const bedtimeInput = document.getElementById('wizardInputBedtime');
  if (wakeInput && !wakeInput.value) wakeInput.value = state.tomorrowWakeTime || state.wakeTime || '07:14';
  if (bedtimeInput && !bedtimeInput.value) bedtimeInput.value = state.tomorrowSleepTime || state.sleepTime || '22:30';

  updateWizardProjection();

  wakeInput?.addEventListener('input', updateWizardProjection);
  bedtimeInput?.addEventListener('input', updateWizardProjection);
}

function updateWizardProjection() {
  const wakeVal = document.getElementById('wizardInputWake')?.value || '07:14';
  const bedtimeVal = document.getElementById('wizardInputBedtime')?.value || '22:30';
  const detailsEl = document.getElementById('wizardProjectionDetails');

  const wakeM = timeStringToMinutes(wakeVal);
  const foundationEnd = wakeM + 210;
  const c1Start = foundationEnd;
  const c1End = c1Start + 90;

  if (detailsEl) {
    detailsEl.innerHTML = `
      <div class="p-2.5 rounded-lg bg-slate-850 border border-slate-750 space-y-0.5">
        <strong class="text-emerald-300 block text-xs font-mono">${minutesToTimeStr(wakeM)} – ${minutesToTimeStr(foundationEnd)}</strong>
        <span class="text-[11px] text-slate-300">Morning Foundation: Sunlight, Hydration & Gym Workout.</span>
      </div>
      <div class="p-2.5 rounded-lg bg-slate-850 border border-slate-750 space-y-0.5">
        <strong class="text-amber-300 block text-xs font-mono">${minutesToTimeStr(c1Start)} – ${minutesToTimeStr(c1End)}</strong>
        <span class="text-[11px] text-slate-300">Cycle 1 (Golden Peak): High-Leverage Deep Focus Sprint.</span>
      </div>
    `;
  }
}

function moveTaskToTomorrowSlot(taskId, slotId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.slot = slotId;
    playChime("C5", "16n");
    renderApp();
    renderWizardStep1();
    renderWizardStep2();
    showToast(`Assigned "${task.title.slice(0, 22)}..." to Tomorrow.`);
  }
}

function markTaskDone(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'completed';
    playChime("G5", "16n");
    renderApp();
    showToast(`✓ Marked "${task.title.slice(0, 22)}..." complete!`);
  }
}

function rolloverAllIncompleteToTomorrow() {
  const todayIncomplete = state.tasks.filter(t => 
    ['c1', 'c2', 'c3', 'c4', 'shutdown', 'foundation'].includes(t.slot) && t.status !== 'completed'
  );
  
  if (todayIncomplete.length === 0) {
    showToast("No open tasks to rollover!");
    return;
  }

  todayIncomplete.forEach((task, idx) => {
    if (task.type === 'deep') {
      task.slot = idx % 2 === 0 ? 'tomorrow_c1' : 'tomorrow_c2';
    } else {
      task.slot = 'tomorrow_c3';
    }
  });

  playChime("E5", "8n");
  renderApp();
  renderWizardStep1();
  renderWizardStep2();
  showToast(`Rolled over ${todayIncomplete.length} tasks to Tomorrow's slots!`);
}

function switchViewMode(mode) {
  state.viewMode = mode;
  playChime(mode === 'tomorrow' ? "A4" : "C5", "16n");
  renderApp();
  showToast(mode === 'tomorrow' ? "Viewing Tomorrow's Chrono-Slots" : "Viewing Today's Chrono-Slots");
}

function promptSlotTask(slotId) {
  openNewTaskModal();
  const select = document.getElementById('taskEditTarget');
  if (select) select.value = slotId;
}

function lockInTomorrowPlan() {
  const wakeVal = document.getElementById('wizardInputWake')?.value || '07:14';
  const bedtimeVal = document.getElementById('wizardInputBedtime')?.value || '22:30';

  state.tomorrowWakeTime = wakeVal;
  state.tomorrowSleepTime = bedtimeVal;
  state.viewMode = 'tomorrow';

  try {
    localStorage.setItem('chronoflow_tomorrow_plan', JSON.stringify({
      tomorrowWakeTime: state.tomorrowWakeTime,
      tomorrowSleepTime: state.tomorrowSleepTime,
      tasks: state.tasks.filter(t => (t.slot && t.slot.startsWith('tomorrow_')) || t.slot === 'day_1'),
      savedAt: Date.now()
    }));
  } catch (e) {}

  closePlanTomorrowWizard();
  playChime("E5", "8n");
  renderApp();
  showToast(`🌙 Tomorrow's blueprint locked in! Viewing Tomorrow's Chrono-Slots.`);
}

// Modal open/close helpers
function openHealthModal() {
  document.getElementById('healthModal').classList.remove('hidden');
}
function closeHealthModal() {
  document.getElementById('healthModal').classList.add('hidden');
}

function openSleepWakeModal() {
  document.getElementById('inputWakeTime').value = state.wakeTime;
  document.getElementById('inputSleepTime').value = state.sleepTime;
  document.getElementById('sleepWakeModal').classList.remove('hidden');
}
function closeSleepWakeModal() {
  document.getElementById('sleepWakeModal').classList.add('hidden');
}

function applyChronoPreset(wake, sleep) {
  document.getElementById('inputWakeTime').value = wake;
  document.getElementById('inputSleepTime').value = sleep;
  executeChronoUpdate(wake, sleep);
  closeSleepWakeModal();
}

function executeChronoUpdate(wake, sleep) {
  state.wakeTime = wake;
  state.sleepTime = sleep;
  ULTRADIAN_SLOTS = generateUltradianSlots(wake, sleep);

  const wakeStr = minutesToTimeStr(timeStringToMinutes(wake));
  playChime("E5", "8n");
  renderApp();
  showToast(`Chrono calibrated to ${wakeStr} wake!`);
}

function quickReschedule(taskId, targetSlot) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.slot = targetSlot;
    playChime("C5", "16n");
    renderApp();
    const upcoming = getUpcomingDays();
    const targetDayObj = upcoming.find(d => d.key === targetSlot);
    const label = targetDayObj ? targetDayObj.shortLabel : targetSlot.toUpperCase();
    showToast(`Deferred "${task.title.slice(0, 24)}..." to ${label}`);
  }
}

function pullBackToToday(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.slot = task.type === 'deep' ? 'c2' : 'c3';
    playChime("G4", "16n");
    renderApp();
    showToast(`Restored "${task.title.slice(0, 22)}..." to Today's flow.`);
  }
}

// Task Edit & Form Logic
function openEditTaskModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('taskModalTitle').textContent = "Edit Task Assignment";
  document.getElementById('taskEditId').value = task.id;
  document.getElementById('taskEditTitle').value = task.title;
  document.getElementById('taskEditProject').value = task.project;
  document.getElementById('taskEditDuration').value = task.duration;
  document.getElementById('taskEditTarget').value = task.slot;
  document.getElementById('taskEditType').value = task.type;
  document.getElementById('taskEditTags').value = task.tags.join(', ');

  document.getElementById('taskModal').classList.remove('hidden');
}

function openNewTaskModal() {
  document.getElementById('taskModalTitle').textContent = "Create New Ultradian Task";
  document.getElementById('taskEditId').value = 't-' + Date.now();
  document.getElementById('taskEditTitle').value = '';
  document.getElementById('taskEditProject').value = 'Day 2 Day';
  document.getElementById('taskEditDuration').value = '30';
  document.getElementById('taskEditTarget').value = 'c2';
  document.getElementById('taskEditType').value = 'deep';
  document.getElementById('taskEditTags').value = '';

  document.getElementById('taskModal').classList.remove('hidden');
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('taskEditId').value;
  const title = document.getElementById('taskEditTitle').value.trim();
  const project = document.getElementById('taskEditProject').value.trim();
  const duration = parseInt(document.getElementById('taskEditDuration').value, 10);
  const slot = document.getElementById('taskEditTarget').value;
  const type = document.getElementById('taskEditType').value;
  const tags = document.getElementById('taskEditTags').value.split(',').map(s => s.trim()).filter(Boolean);

  const existingIndex = state.tasks.findIndex(t => t.id === id);
  if (existingIndex >= 0) {
    state.tasks[existingIndex] = { ...state.tasks[existingIndex], title, project, duration, slot, type, tags };
  } else {
    state.tasks.push({ id, title, project, duration, slot, type, tags, status: 'pending' });
  }

  document.getElementById('taskModal').classList.add('hidden');
  renderApp();
  showToast("Task saved successfully!");
}

function handleDeleteTask() {
  const id = document.getElementById('taskEditId').value;
  state.tasks = state.tasks.filter(t => t.id !== id);
  document.getElementById('taskModal').classList.add('hidden');
  renderApp();
  showToast("Task removed.");
}

// Timer Controls
function startFocusTimerForSlot(slotId) {
  const slot = ULTRADIAN_SLOTS.find(s => s.id === slotId);
  if (!slot) return;

  const slotTasks = state.tasks.filter(t => t.slot === slotId);
  state.timer.slotId = slotId;
  state.timer.totalSeconds = slot.durationMins * 60;
  state.timer.remainingSeconds = slot.durationMins * 60;

  document.getElementById('timerPhaseBadge').textContent = slot.title;
  document.getElementById('timerTaskTitle').textContent = slotTasks.length > 0 ? slotTasks[0].title : slot.phaseName;
  updateTimerDisplay();

  document.getElementById('timerModal').classList.remove('hidden');
}

function updateTimerDisplay() {
  const mins = Math.floor(state.timer.remainingSeconds / 60);
  const secs = state.timer.remainingSeconds % 60;
  document.getElementById('timerCountdown').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  const pct = (1 - (state.timer.remainingSeconds / state.timer.totalSeconds)) * 100;
  const ring = document.getElementById('timerRingFill');
  if (ring) ring.style.height = `${pct}%`;
}

function toggleTimer() {
  const icon = document.getElementById('timerIconPlay');
  const text = document.getElementById('timerBtnText');

  if (state.timer.active) {
    clearInterval(state.timer.intervalId);
    state.timer.active = false;
    if (icon) icon.className = "fa-solid fa-play";
    if (text) text.textContent = "Resume";
  } else {
    playChime("G5", "4n");
    state.timer.active = true;
    if (icon) icon.className = "fa-solid fa-pause";
    if (text) text.textContent = "Pause";

    state.timer.intervalId = setInterval(() => {
      if (state.timer.remainingSeconds > 0) {
        state.timer.remainingSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(state.timer.intervalId);
        state.timer.active = false;
        playChime("C6", "1n");
        showToast("🔔 Ultradian cycle finished! Time for restorative decompression.");
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(state.timer.intervalId);
  state.timer.active = false;
  state.timer.remainingSeconds = state.timer.totalSeconds;
  const icon = document.getElementById('timerIconPlay');
  const text = document.getElementById('timerBtnText');
  if (icon) icon.className = "fa-solid fa-play";
  if (text) text.textContent = "Start Cycle";
  updateTimerDisplay();
}

function copyOmniPlanText() {
  const stagingKeys = ['day_1', 'day_2', 'day_3', 'day_4', 'thu', 'fri', 'sat', 'sun'];
  const offloaded = state.tasks.filter(t => stagingKeys.includes(t.slot));
  const upcoming = getUpcomingDays();
  const dayNames = {
    day_1: upcoming[0]?.dateDisplay || 'Tomorrow',
    day_2: upcoming[1]?.dateDisplay || 'In 2 days',
    day_3: upcoming[2]?.dateDisplay || 'In 3 days',
    day_4: upcoming[3]?.dateDisplay || 'In 4 days',
    thu: upcoming[0]?.dateDisplay || 'Upcoming Day',
    fri: upcoming[1]?.dateDisplay || 'Upcoming Day',
    sat: upcoming[2]?.dateDisplay || 'Upcoming Day',
    sun: upcoming[3]?.dateDisplay || 'Upcoming Day'
  };

  let text = `CHRONOFLOW OMNIFOCUS TRIAGE ACTIONS (${state.wakeTime} Wake Calibration):\n\n`;
  text += `1. TASKS DEFERRED OUT OF TODAY:\n`;
  offloaded.forEach(t => {
    text += `• "${t.title}" -> Defer to ${dayNames[t.slot] || t.slot} (Project: ${t.project})\n`;
  });
  text += `\n2. TODAY'S SPRINT FOCUS SESSIONS:\n`;
  text += `• Cycle 1 (10:45 AM – 12:15 PM): Product breakdown clips sprint\n`;
  text += `• Cycle 2 (12:40 PM – 2:00 PM): Targeted job applications sprint\n`;
  text += `• Cycle 3 (2:45 PM – 4:00 PM): Buyer outreach and admin blitz\n`;

  navigator.clipboard.writeText(text);
  const toastEl = document.getElementById('copyToast');
  if (toastEl) {
    toastEl.style.opacity = '1';
    setTimeout(() => { toastEl.style.opacity = '0'; }, 2000);
  }
}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const clockEl = document.getElementById('headerTimeClock');
  if (clockEl) clockEl.textContent = timeStr;

  const dateEl = document.getElementById('headerDateDisplay');
  if (dateEl) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, options);
  }

  updatePhaseBadge();
}

function showToast(msg) {
  const toast = document.getElementById('appToast');
  const text = document.getElementById('appToastText');
  if (!toast || !text) return;
  text.textContent = msg;
  toast.classList.remove('opacity-0', 'translate-y-20', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-20', 'pointer-events-none');
  }, 3200);
}

// --- TODAY'S MASTER INTAKE & CHRONO ADVISORY ENGINE ---
let currentIntakeFilter = 'all';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function computeTodayIntakeUniverse() {
  if (!state.tasks || !Array.isArray(state.tasks)) return [];
  const todayCycleSlots = ['foundation', 'c1', 'c2', 'c3', 'c4', 'shutdown'];
  const map = new Map();
  state.tasks.forEach(t => {
    // Universe includes all tasks that are due today, planned today, or assigned to today's cycles/staging
    if (t.isDueToday || t.isPlannedToday || todayCycleSlots.includes(t.slot)) {
      map.set(t.id, t);
    }
  });
  return Array.from(map.values());
}

function updateIntakeBadge() {
  const universe = computeTodayIntakeUniverse();
  const count = universe.length;
  const badge = document.getElementById('badgeTodayIntakeCount');
  if (badge) badge.textContent = count;
  const headerBadge = document.getElementById('intakeModalHeaderBadge');
  if (headerBadge) headerBadge.textContent = `${count} Tasks Due / Planned`;
}

function getIntakeUniverseWithRecommendations() {
  const universe = computeTodayIntakeUniverse();

  const slotMinutes = { c1: 0, c2: 0, c3: 0, c4: 0, shutdown: 0 };
  const slotLimits = { c1: 90, c2: 80, c3: 75, c4: 70, shutdown: 30 };

  const preferredMap = {
    'g1j3ilOSnv8': { slot: 'c1', phase: 'Cycle 1: Golden Peak', rationale: 'Premier morning alertness window for foundational study.' },
    'pqFa4eeU2Y6': { slot: 'c1', phase: 'Cycle 1: Golden Peak', rationale: 'High-cognitive-demand portfolio creative work scheduled during maximum focus.' },
    'jhkjtpBlgb_': { slot: 'c2', phase: 'Cycle 2: Execution Peak', rationale: 'High-velocity job applications sprint timed for peak execution alertness.' },
    'nJLEA5wxNBA': { slot: 'c3', phase: 'Cycle 3: Admin Blitz', rationale: 'Post-nadir communication & photo upload sprint.' },
    'a8cCGWbr44W': { slot: 'c3', phase: 'Cycle 3: Admin Blitz', rationale: 'Medical clearance & admin coordination in afternoon blitz.' },
    'mrnHJC6Vtoa': { slot: 'c3', phase: 'Cycle 3: Admin Blitz', rationale: 'Nidhca financial admin form in dedicated low-cognitive-friction window.' },
    'm5Sur6ZgUjs': { slot: 'c4', phase: 'Cycle 4: Rebound Intake', rationale: 'Learning techniques review timed during late-day circadian rebound.' },
    'n52EFrMy8S2': { slot: 'c4', phase: 'Cycle 4: Rebound Intake', rationale: 'Reflective post-mortem synthesis in late afternoon review window.' },
    'i4FgSBIPm3m': { slot: 'shutdown', phase: 'Workday Shutdown Ritual', rationale: 'Final time-boxing ritual to close open loops before evening rest.' },
    'aaAhMNh8HpY': { slot: 'day_1', phase: 'Tomorrow (Day 1)', rationale: 'Video scripting & shot list exceeds today\'s deep work budget; staged for tomorrow.', isOverflow: true },
    'gSJe1tSsKCY': { slot: 'day_1', phase: 'Tomorrow (Day 1)', rationale: 'Event post synthesis staged for tomorrow morning to defend focus today.', isOverflow: true },
    'ieb6qJDeADF': { slot: 'day_1', phase: 'Tomorrow (Day 1)', rationale: 'Newsletter creation deferred to tomorrow to protect evening recovery.', isOverflow: true },
    'celrrIQIQlu': { slot: 'day_2', phase: 'In 2 Days (Day 2)', rationale: 'Exploratory video research staged into Day 2 capacity headroom.', isOverflow: true }
  };

  return universe.map(task => {
    let rec = null;
    if (preferredMap[task.id]) {
      const p = preferredMap[task.id];
      rec = {
        recommendedSlot: p.slot,
        label: p.phase,
        rationale: p.rationale,
        isOverflow: !!p.isOverflow
      };
      if (slotMinutes[p.slot] !== undefined) {
        slotMinutes[p.slot] += (task.duration || 30);
      }
    } else {
      const dur = task.duration || 30;
      const isShutdown = task.type === 'habit' && (dur <= 20 || /time box|shutdown|ritual/i.test(task.title));
      const isDeep = task.type === 'deep' || dur >= 50 || (task.tags && task.tags.some(t => /top|p1|deep|high/i.test(t)));
      const isHabit = task.type === 'habit' || (task.tags && task.tags.some(t => /habit|routine|daily/i.test(t)));

      if (isShutdown) {
        rec = {
          recommendedSlot: 'shutdown',
          label: 'Workday Shutdown Ritual',
          rationale: 'Daily closure routine to disconnect and preserve evening recovery.',
          isOverflow: false
        };
        slotMinutes.shutdown += dur;
      } else if (isDeep) {
        if (slotMinutes.c1 + dur <= slotLimits.c1 + 15) {
          rec = {
            recommendedSlot: 'c1',
            label: 'Cycle 1: Golden Peak',
            rationale: 'High cognitive demand task matched to premier midday alertness.',
            isOverflow: false
          };
          slotMinutes.c1 += dur;
        } else if (slotMinutes.c2 + dur <= slotLimits.c2 + 15) {
          rec = {
            recommendedSlot: 'c2',
            label: 'Cycle 2: Execution Peak',
            rationale: 'Deep work sprint assigned to secondary execution peak.',
            isOverflow: false
          };
          slotMinutes.c2 += dur;
        } else {
          rec = {
            recommendedSlot: 'day_1',
            label: '⏸ Defer to Tomorrow',
            rationale: 'Exceeds today\'s 4h 15m deep work capacity. Defer to protect circadian rhythm.',
            isOverflow: true
          };
        }
      } else if (isHabit) {
        if (slotMinutes.c4 + dur <= slotLimits.c4 + 15) {
          rec = {
            recommendedSlot: 'c4',
            label: 'Cycle 4: Rebound Intake',
            rationale: 'Light synthesis and habit consolidation in circadian rebound.',
            isOverflow: false
          };
          slotMinutes.c4 += dur;
        } else {
          rec = {
            recommendedSlot: 'day_1',
            label: '⏸ Defer to Tomorrow',
            rationale: 'Habit intake window full for today. Deferred to preserve recovery.',
            isOverflow: true
          };
        }
      } else {
        if (slotMinutes.c3 + dur <= slotLimits.c3 + 15) {
          rec = {
            recommendedSlot: 'c3',
            label: 'Cycle 3: Admin Blitz',
            rationale: 'Post-nadir administrative coordination and quick outreach.',
            isOverflow: false
          };
          slotMinutes.c3 += dur;
        } else if (slotMinutes.c4 + dur <= slotLimits.c4 + 15) {
          rec = {
            recommendedSlot: 'c4',
            label: 'Cycle 4: Rebound Intake',
            rationale: 'Low cognitive friction tasks slotted in late-day window.',
            isOverflow: false
          };
          slotMinutes.c4 += dur;
        } else {
          rec = {
            recommendedSlot: 'day_1',
            label: '⏸ Defer to Tomorrow',
            rationale: 'Daily administrative bandwidth exceeded. Staging for tomorrow.',
            isOverflow: true
          };
        }
      }
    }
    return { task, rec };
  });
}

function openTodayIntakeModal() {
  const modal = document.getElementById('modalTodayIntake');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderIntakeDiagnostic();
  renderIntakeTasks(currentIntakeFilter);
}

function closeTodayIntakeModal() {
  const modal = document.getElementById('modalTodayIntake');
  if (modal) modal.classList.add('hidden');
}

function renderIntakeDiagnostic() {
  const items = getIntakeUniverseWithRecommendations();
  const totalDemandMins = items.reduce((sum, item) => sum + (item.task.duration || 30), 0);
  const totalTasks = items.length;

  const todayItems = items.filter(i => !i.rec.isOverflow);
  const deferItems = items.filter(i => i.rec.isOverflow);
  const slottedMins = todayItems.reduce((sum, i) => sum + (i.task.duration || 30), 0);

  const bioCapMins = 255; // 4h 15m core focus

  const demandEl = document.getElementById('intakeTotalDemand');
  if (demandEl) {
    const dh = Math.floor(totalDemandMins / 60);
    const dm = totalDemandMins % 60;
    demandEl.textContent = `${totalTasks} Tasks • ${dh}h ${dm > 0 ? dm + 'm' : ''}`;
  }

  const statusEl = document.getElementById('intakeCapacityStatus');
  if (statusEl) {
    if (totalDemandMins > bioCapMins) {
      const overM = totalDemandMins - bioCapMins;
      const oh = Math.floor(overM / 60);
      const om = overM % 60;
      statusEl.textContent = `+${oh > 0 ? oh + 'h ' : ''}${om}m Overload`;
      statusEl.className = 'font-mono text-sm font-bold text-amber-300';
    } else {
      statusEl.textContent = 'Balanced Capacity';
      statusEl.className = 'font-mono text-sm font-bold text-emerald-300';
    }
  }

  // Progress Bar
  const barSlotted = document.getElementById('intakeBarSlotted');
  const barOverflow = document.getElementById('intakeBarOverflow');
  if (barSlotted && barOverflow) {
    const slottedPct = totalDemandMins > 0 ? Math.round((slottedMins / totalDemandMins) * 100) : 60;
    const overflowPct = 100 - slottedPct;
    barSlotted.style.width = `${slottedPct}%`;
    barSlotted.setAttribute('title', `Slotted Today: ${slottedMins}m (${slottedPct}%)`);
    barOverflow.style.width = `${overflowPct}%`;
    barOverflow.setAttribute('title', `Recommended Deferrals: ${totalDemandMins - slottedMins}m (${overflowPct}%)`);
  }

  // Filter Counts
  const countAll = document.getElementById('intakeFilterCountAll');
  if (countAll) countAll.textContent = totalTasks;
  const countToday = document.getElementById('intakeFilterCountToday');
  if (countToday) countToday.textContent = todayItems.length;
  const countDefer = document.getElementById('intakeFilterCountDefer');
  if (countDefer) countDefer.textContent = deferItems.length;
}

function filterIntakeList(mode) {
  currentIntakeFilter = mode;
  ['All', 'Today', 'Defer'].forEach(f => {
    const btn = document.getElementById(`filterBtn${f}`);
    if (btn) {
      if (f.toLowerCase() === mode) {
        btn.className = 'intake-filter-btn px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold';
      } else {
        btn.className = 'intake-filter-btn px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-transparent font-semibold';
      }
    }
  });
  renderIntakeTasks(mode);
}

function renderIntakeTasks(filterMode = 'all') {
  const container = document.getElementById('intakeTasksContainer');
  if (!container) return;

  const items = getIntakeUniverseWithRecommendations();
  const filtered = items.filter(({ task, rec }) => {
    if (filterMode === 'today') return !rec.isOverflow;
    if (filterMode === 'defer') return rec.isOverflow;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-2xl">
        <i class="fa-solid fa-check-circle text-emerald-400 text-2xl mb-2 block"></i>
        No tasks matching this filter.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(({ task, rec }) => {
    const isAligned = task.slot === rec.recommendedSlot;

    let statusBadges = '';
    if (task.isDueToday) {
      statusBadges += `<span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">Due Today</span>`;
    }
    if (task.isPlannedToday) {
      statusBadges += `<span class="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">Planned Today</span>`;
    }

    const recBadge = rec.isOverflow
      ? `<span class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold inline-flex items-center gap-1.5"><i class="fa-solid fa-moon text-[10px]"></i> ${rec.label}</span>`
      : `<span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold inline-flex items-center gap-1.5"><i class="fa-solid fa-bolt text-[10px]"></i> ${rec.label}</span>`;

    const quickAction = !isAligned
      ? `<button type="button" class="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[11px] font-bold transition flex items-center gap-1 shadow-sm" onclick="assignTaskSlot('${task.id}', '${rec.recommendedSlot}')" title="Apply ChronoFlow recommendation"><i class="fa-solid fa-wand-magic-sparkles text-[10px]"></i> Apply Rec</button>`
      : `<span class="px-2.5 py-1 text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"><i class="fa-solid fa-check"></i> Slotted</span>`;

    return `
      <div class="p-3.5 rounded-2xl bg-slate-900/80 border ${rec.isOverflow ? 'border-amber-500/30' : 'border-slate-700/70'} hover:border-slate-600 transition flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div class="space-y-1.5 flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[200px]">${escapeHtml(task.project || 'General')}</span>
            ${statusBadges}
            <span class="text-[11px] font-mono text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${task.duration || 30}m</span>
            ${task.omniTime ? `<span class="text-[11px] font-mono text-slate-400"><i class="fa-regular fa-bell mr-1"></i>${task.omniTime}</span>` : ''}
          </div>
          <div class="text-xs font-semibold text-white tracking-wide leading-snug">
            ${escapeHtml(task.title)}
          </div>
          <div class="flex items-start gap-2 pt-0.5 flex-wrap sm:flex-nowrap">
            <div class="shrink-0">${recBadge}</div>
            <p class="text-[11px] text-slate-400 leading-tight">${escapeHtml(rec.rationale)}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end md:self-center shrink-0">
          <div class="flex flex-col items-end gap-1">
            <div class="text-[10px] uppercase font-bold text-slate-400">Target Phase / Staging</div>
            <div class="flex items-center gap-1.5">
              <select class="bg-slate-950 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:border-amber-400 focus:outline-none" onchange="assignTaskSlot('${task.id}', this.value)">
                <optgroup label="Today's Ultradian Cycles">
                  <option value="c1" ${task.slot === 'c1' ? 'selected' : ''}>Cycle 1: Golden Peak (10:45 AM)</option>
                  <option value="c2" ${task.slot === 'c2' ? 'selected' : ''}>Cycle 2: Execution Peak (12:40 PM)</option>
                  <option value="c3" ${task.slot === 'c3' ? 'selected' : ''}>Cycle 3: Admin Blitz (2:45 PM)</option>
                  <option value="c4" ${task.slot === 'c4' ? 'selected' : ''}>Cycle 4: Rebound Intake (4:25 PM)</option>
                  <option value="shutdown" ${task.slot === 'shutdown' ? 'selected' : ''}>Workday Shutdown Ritual</option>
                  <option value="foundation" ${task.slot === 'foundation' ? 'selected' : ''}>Morning Foundation</option>
                </optgroup>
                <optgroup label="Defend & Defer (Staging)">
                  <option value="day_1" ${task.slot === 'day_1' ? 'selected' : ''}>Tomorrow (Day 1 Staging)</option>
                  <option value="day_2" ${task.slot === 'day_2' ? 'selected' : ''}>In 2 Days (Day 2 Staging)</option>
                  <option value="day_3" ${task.slot === 'day_3' ? 'selected' : ''}>In 3 Days (Day 3 Staging)</option>
                  <option value="unscheduled" ${task.slot === 'unscheduled' ? 'selected' : ''}>Unscheduled / Backlog</option>
                </optgroup>
              </select>
              ${quickAction}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function assignTaskSlot(taskId, targetSlot) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.slot = targetSlot;
  renderApp();
  renderIntakeDiagnostic();
  renderIntakeTasks(currentIntakeFilter);
  showToast(`Updated "${task.title.substring(0, 24)}..." -> ${targetSlot}`);
}
window.assignTaskSlot = assignTaskSlot;

function acceptAllRecommendations() {
  const items = getIntakeUniverseWithRecommendations();
  let count = 0;
  items.forEach(({ task, rec }) => {
    if (task.slot !== rec.recommendedSlot) {
      task.slot = rec.recommendedSlot;
      count++;
    }
  });
  renderApp();
  renderIntakeDiagnostic();
  renderIntakeTasks(currentIntakeFilter);
  showToast(`✨ Applied ChronoFlow recommendations to ${count} tasks!`);
}

function deferOverflowToTomorrow() {
  const items = getIntakeUniverseWithRecommendations();
  let count = 0;
  items.forEach(({ task, rec }) => {
    if (rec.isOverflow && task.slot !== 'day_1') {
      task.slot = 'day_1';
      count++;
    }
  });
  renderApp();
  renderIntakeDiagnostic();
  renderIntakeTasks(currentIntakeFilter);
  showToast(`🌙 Staged ${count} overflow tasks to Tomorrow (Day 1 staging) to defend cognitive recovery!`);
}

