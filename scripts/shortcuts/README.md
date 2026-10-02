# Apple Health & Apple Watch Integration for ChronoFlow

This guide explains how ChronoFlow automatically pulls your daily stats ("sats", sleep, wake time, HRV, resting HR, and workouts) from your Apple Watch and Apple Health.

---

## 🌟 What Gets Auto-Pulled Every Morning

1. **Wake Time & Sleep Duration**:
   - Pulled from Apple Health's Sleep Analysis.
   - Automatically recalibrates the entire ChronoFlow ultradian architecture (shifts all cycles, sets the 90m adenosine delay before caffeine, marks your Golden Peak, and projects your post-lunch nadir).
2. **Blood Oxygen Saturation ("Sats" / SpO2)**:
   - e.g., 98% or 99% measured overnight and in the morning by Apple Watch.
3. **Heart Rate Variability (HRV - SDNN)**:
   - The primary autonomic biomarker reflecting nervous system recovery.
4. **Resting Heart Rate (RHR)**:
   - Lower baseline confirms complete cardiovascular recovery.
5. **Morning Workout & Activity**:
   - Detects if you logged a morning workout (e.g., Gym from 7:00 AM – 8:00 AM) and marks the "Morning Foundation" as complete!

---

## ⚡ Setup Option 1: Automatic iCloud Drive Sync (Recommended & Zero Config)

Because ChronoFlow watches `~/Library/Mobile Documents/com~apple~CloudDocs/ChronoFlow/health_today.json`, any shortcut that writes to this folder in iCloud Drive instantly updates ChronoFlow on your Mac without requiring you to configure IP addresses or port forwarding!

### Creating the 3-minute Apple Shortcut:
1. Open the **Shortcuts app** on your iPhone or Mac.
2. Tap **+** to create a new shortcut named **"ChronoFlow Health Sync"**.
3. Add these actions:
   - **Find Health Samples where**:
     - *Type* is **Sleep Analysis**
     - *Start Date* is in the last 1 day
     - *Sort by* End Date (Latest first), *Limit* to 1 sample
     - Get *End Date* (Formatted as `HH:mm`) ➔ Variable `WakeTime`
     - Get *Duration* in Hours ➔ Variable `SleepHours`
   - **Find Health Samples where**:
     - *Type* is **Oxygen Saturation**
     - *Sort by* Date (Latest first), *Limit* to 1 sample
     - Multiply by 100 (if decimal) ➔ Variable `Sats`
   - **Find Health Samples where**:
     - *Type* is **Heart Rate Variability**
     - *Sort by* Date (Latest first), *Limit* to 1 sample ➔ Variable `HRV`
   - **Find Health Samples where**:
     - *Type* is **Resting Heart Rate**
     - *Sort by* Date (Latest first), *Limit* to 1 sample ➔ Variable `RestingHR`
   - **Find Workouts where**:
     - *Start Date* is Today
     - *Sort by* Start Date, *Limit* to 1 ➔ Variable `Workout`
   - **Dictionary**:
     ```json
     {
       "wakeTime": WakeTime,
       "sleepDurationHours": SleepHours,
       "sats": Sats,
       "hrv": HRV,
       "restingHeartRate": RestingHR,
       "source": "Apple Watch",
       "date": CurrentDate
     }
     ```
   - **Save File**:
     - Save the Dictionary (as JSON) to `iCloud Drive/ChronoFlow/health_today.json` (overwrite if exists: True).
4. *(Optional Automation)*: In Shortcuts on iPhone, go to **Automation** tab:
   - Choose **"When Waking Up"** (or **"When Sleep Focus Turns Off"**).
   - Set it to run **"ChronoFlow Health Sync"** automatically without asking!

---

## 🌐 Setup Option 2: Direct Local Webhook

If you prefer sending a direct HTTP POST from your local network:
- Add a **Get Contents of URL** action in Shortcuts:
  - URL: `http://<your-mac-local-ip-or-localhost>:3333/api/health/sync`
  - Method: `POST`
  - Request Body: JSON with the dictionary above.

---

## 📲 Setup Option 3: Health Auto Export (App Store)

If you already use the popular app [Health Auto Export](https://www.healthexportapp.com):
1. Open Health Auto Export on iOS or Mac.
2. Under Automations, add **REST API** or **iCloud Drive export**.
3. Choose metrics: Blood Oxygen, Sleep, Heart Rate Variability, Resting Heart Rate, Workouts.
4. Point to `http://localhost:3333/api/health/sync` or iCloud Drive `ChronoFlow/`.

---

## 🧪 Testing in ChronoFlow

You can test this right now in ChronoFlow without any setup:
- Click the **"Apple Health / Watch"** button in the top header.
- Tap **"Simulate Watch Sync (Today 6:00a + 98% Sats)"** or **"Yesterday (7:22a Wake)"**.
- ChronoFlow will update biometrics, recalculate readiness, and shift all ultradian cycles immediately!
