# ChronoFlow — Ultradian Energy & Task Triage Studio

> **"Synchronize your highest-leverage deep work with your biology."**  
> An executive daily operating system integrating **OmniFocus 4** and **Apple Health / Apple Watch** to protect your cognitive bandwidth, auto-calibrate your daily schedule around your real sleep and wake vitals, and align deep work into focused 90-minute ultradian peaks.

---

## 🧭 Core Philosophy: Cognitive Bandwidth Protection

ChronoFlow is built on a single non-negotiable standard: **Cognitive Bandwidth Protection**.

Traditional task managers and calendar tools act as passive, bottomless dumping grounds. They present an overwhelming wall of 50–100 tasks, forcing your prefrontal cortex into continuous micro-decision fatigue, open-loop anxiety, and context-switching before your day even begins. 

ChronoFlow flips this model entirely:

### 1. The Gated Working Memory Doctrine
* **Never Dump the Entire Backlog onto Today**: If OmniFocus contains 65 active tasks, your conscious working memory should only ever hold **3 to 4 high-leverage execution blocks** at any given moment.
* **Intelligent Buffer Staging**: Non-essential tasks are safely insulated in the **Weekly Staging & Backlog Deck** (`[Inbox]`, rolling day buffers), eliminating subconscious guilt and preserving executive attention.

### 2. Biological Synchrony Over Arbitrary Clocks
* **Rhythm Over Rigidity**: Time management fails when it fights human biology. 
* **The 90-Minute Basic Rest-Activity Cycle (BRAC)**: High-conviction deep work is sequenced into 90-minute Golden Peaks, followed by mandatory 20-minute restorative troughs (screen-free decompression, hydration, NSDR).
* **Vitals-Anchored Calibration**: Apple Watch biometrics (real wake time, SpO₂ sats, HRV, sleep duration) automatically calibrate your entire schedule every morning. If you wake up at 7:14 AM, your peak kicks off at 10:45 AM, protecting your 90-minute adenosine clearance window and workout priming.

### 3. Evening Shutdown & Tomorrow's Blueprint
* **Zero Cognitive Residue at Bedtime**: The Evening Planning Wizard rolls over, reschedules, or concludes today's open loops before you sleep.
* **Wake Up Primed**: When you wake up, tomorrow's schedule is already locked into place. You start your morning foundation with zero friction, zero panic, and total clarity.

### 4. Autonomous Background Relays
* **No Manual Journaling**: OmniFocus 4 tasks sync silently in the background from your Mac daemon; Apple Watch vitals push automatically from your iPhone Shortcuts. The tools serve the human, never the other way around.

---

## ⚡ Key Highlights & Architecture

- **🧬 Ultradian Rhythm Engine (BRAC Science)**:
  - Dynamically calculates high-capacity **90-minute Golden Peaks** and **20-minute restorative troughs** (NSDR, walk, hydration).
  - Automatically calculates the **90-minute adenosine clearance window** post-wake to prevent afternoon caffeine crashes.
  - Anticipates the natural **circadian nadir** (~8 hours post-wake) for restorative non-sleep deep rest.
- **⌚ Apple Watch & Health Auto-Pull ("Sats & Vitals")**:
  - Auto-pulls **Oxygen Saturation ("Sats" / SpO2)**, **HRV (SDNN)**, **Resting Heart Rate**, and **Sleep Duration**.
  - Auto-detects your **actual morning wake time** and shifts every single ultradian peak, trough, and cutoff time automatically.
  - Detects logged morning workouts (e.g. 7:00 AM – 8:00 AM Gym) and marks your "Morning Foundation" as complete.
- **🍏 OmniFocus 4 Native macOS Bridge**:
  - Reads active forecast, inbox, and tagged tasks directly from OmniFocus via native JXA / AppleScript (`osascript`).
  - **1-Click Live Triage**: Pushes deferred tasks (to Thursday, Friday, Saturday, etc.) and time caps straight back into OmniFocus without manual copy-pasting.
  - Full fallback copy modal for review.
- **🌙 Evening Shutdown & "Plan Tomorrow" Blueprinting**:
  - Segmented **`[ Today ]` | `[ Tomorrow ]`** timeline view switcher allows reviewing and staging tomorrow's cycles anytime.
  - Guided **Evening Planning Wizard**: Rollovers unfinished loops, manages minute budgets across Cycles 1, 2, and 3, and pre-locks tomorrow's wake target.
- **🎨 Glassmorphic Interface & Tone.js Timer**:
  - Interactive Circadian Alertness & Ultradian Wave canvas with live time-markers.
  - Focus Timer for 90-minute execution blocks and 20-minute restorative decompression with soothing synthesized chimes.

---

## 🚀 Quick Launch

ChronoFlow has **zero external npm dependencies** (uses Node.js standard libraries).

1. In Terminal:
   ```bash
   cd "/Users/tlf/Documents/5. Freedom/GitHub/ChronoFlow"
   ./start.sh
   # or: node server.js
   ```
2. Your browser will automatically open to `http://localhost:3333`.

---

## ⌚ Apple Watch / Health Auto-Sync Setup

### Option 1: Zero-Config iCloud Drive Sync (Recommended)
ChronoFlow automatically monitors:
```
~/Library/Mobile Documents/com~apple~CloudDocs/ChronoFlow/health_today.json
```
Create a 2-minute Shortcut on your iPhone or Mac named **"ChronoFlow Health Sync"**:
1. **Find Health Samples**:
   - Sleep Analysis (End Date of latest sample ➔ `wakeTime`, Duration ➔ `sleepDurationHours`)
   - Oxygen Saturation (Latest sample * 100 ➔ `sats`)
   - Heart Rate Variability (Latest sample ➔ `hrv`)
   - Resting Heart Rate (Latest sample ➔ `restingHeartRate`)
2. **Dictionary**: Format the fields into JSON.
3. **Save File**: Save to `iCloud Drive/ChronoFlow/health_today.json` (overwrite: True).
4. **Automation**: In Shortcuts on iOS, set an automation: **"When Waking Up"** ➔ Run "ChronoFlow Health Sync".

### Option 2: Local Webhook
In your Shortcut, use **Get Contents of URL**:
- URL: `http://localhost:3333/api/health/sync`
- Method: `POST`
- Body: JSON Dictionary

### Option 3: Instant Simulation / Test Mode
You can test Apple Watch sync immediately right in the UI:
- Click the **"Watch: Sats 98% • Wake 6:00a"** button in the header.
- Tap **"Today (6:00a Wake)"** or **"Yesterday (7:22a Wake)"**.
- ChronoFlow will update all biometrics, recalibrate the readiness index, and shift all ultradian waves immediately.

---

## 🍏 OmniFocus 4 Integration

- **Pull Tasks**: Click **"OmniFocus"** in the top bar. ChronoFlow connects to OmniFocus via native AppleScript.
- **Auto-Triage**: Click **"Auto-Triage Today"** to balance cognitive load, cap monster deep-work blocks into 90-minute laser sprints, and distribute backlog across Thursday, Friday, and Saturday.
- **Push Live**: Click **"Omni Actions"** ➔ **"Push Live to OmniFocus"** to update defer dates and duration estimates in OmniFocus automatically.

---

## 🌐 Cloud Deployment (Vercel) & Mobile App (PWA)

ChronoFlow supports a **dual-option workflow**:
- **On Web**: Access from any browser (desktop, tablet, laptop) hosted on Vercel.
- **On Phone**: Install as an iOS standalone app (PWA) on your iPhone Home Screen today, or run as a native SwiftUI companion app.

### 1. Deploy to Vercel

1. Install the Vercel CLI (or connect this repo on [vercel.com](https://vercel.com)):
   ```bash
   npm i -g vercel
   vercel
   ```
2. (Optional) Add a persistent key-value store in your Vercel Dashboard (**Storage ➔ KV / Upstash Redis**). ChronoFlow automatically detects `KV_REST_API_URL` and `KV_REST_API_TOKEN` to synchronize data across devices with zero config.

### 2. Install on iPhone as a Home Screen App (PWA)

1. Open your Vercel URL (or `http://localhost:3333`) in **Safari** on your iPhone.
2. Tap the **Share** button (box with upward arrow).
3. Tap **"Add to Home Screen"**.
4. ChronoFlow will launch with its custom dark icon, notch-safe viewport, and full standalone app experience!

### 3. macOS Background Sync Relay (OmniFocus ➔ Vercel)

Keep your cloud dashboard updated automatically from your Mac:
```bash
# One-time sync
node scripts/mac_sync_daemon.js --url https://your-chronoflow.vercel.app --once

# Continuous background sync (every 5 minutes)
node scripts/mac_sync_daemon.js --url https://your-chronoflow.vercel.app --interval 5
```

To run silently at startup on macOS:
```bash
cp scripts/com.chronoflow.sync.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.chronoflow.sync.plist
```

---

## 📁 Repository Structure

```
ChronoFlow/
├── vercel.json                         # Vercel serverless routing
├── api/                                # Serverless Cloud API routes
│   ├── _store.js                       # Cloud KV & in-memory store adapter
│   ├── status.js                       # Cloud health check
│   ├── health/today.js                 # Health biometrics getter
│   ├── health/sync.js                  # iOS shortcut & watch webhook
│   └── omnifocus/                      # Cloud OmniFocus endpoints (tasks, sync, launch)
├── public/                             # Client Web Application & PWA
│   ├── index.html                      # Studio Web Interface
│   ├── manifest.json                   # Mobile PWA Manifest
│   ├── sw.js                           # Service worker for offline & mobile caching
│   ├── icons/                          # PWA icons (192x192, 512x512, SVG)
│   ├── css/style.css                   # Glassmorphism dark UI
│   └── js/app.js                       # Energy wave canvas, Tone.js, triage engine
├── scripts/
│   ├── mac_sync_daemon.js              # Mac to Vercel automatic sync relay
│   ├── com.chronoflow.sync.plist       # macOS launchd background service
│   ├── omnifocus_export.applescript    # Sub-second OmniJS query
│   └── omnifocus_update.applescript    # Batch update script
├── server.js                           # Local zero-dependency Node.js companion
└── data/                               # Local cache & logs
```
