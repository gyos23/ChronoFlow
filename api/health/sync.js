const { getHealth, saveHealth } = require('../_store');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    const existing = await getHealth();
    let rawSats = body.sats ?? body.oxygen ?? body.spo2 ?? body.bloodOxygen ?? existing.sats;
    if (rawSats !== undefined && rawSats !== null) {
      let num = Number(rawSats);
      // If shortcut sends decimal e.g. 0.98 instead of 98%, convert it to percentage
      if (num > 0 && num <= 1) {
        num = Math.round(num * 100);
      }
      rawSats = Math.round(num);
    }

    function normalizeTime(val) {
      if (!val) return null;
      let s = String(val).trim();
      // If ISO timestamp like "2026-10-04T07:15:00.000Z"
      if (s.includes('T')) {
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
          return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
      }
      // If 12-hour format like "7:15 AM" or "07:15 AM"
      const match12 = s.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?/i);
      if (match12) {
        let h = parseInt(match12[1], 10);
        const m = match12[2];
        const ampm = match12[3] ? match12[3].toLowerCase() : null;
        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}:${m}`;
      }
      return s;
    }

    const rawWake = body.wakeTime ?? body.wake ?? body.wake_time ?? body.wakingTime;
    const rawBed = body.bedTime ?? body.sleepTime ?? body.bed_time ?? body.bed;
    const cleanWake = normalizeTime(rawWake) || existing.wakeTime;
    const cleanBed = normalizeTime(rawBed) || existing.bedTime;

    const updated = {
      ...existing,
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      sats: rawSats !== undefined ? rawSats : existing.sats,
      wakeTime: cleanWake,
      bedTime: cleanBed,
      restingHeartRate: (body.restingHeartRate ?? body.rhr) !== undefined ? Number(body.restingHeartRate ?? body.rhr) : existing.restingHeartRate,
      hrv: body.hrv !== undefined ? Number(body.hrv) : existing.hrv,
      source: body.source || "Apple Watch Sync",
      lastSynced: new Date().toISOString()
    };

    // Recompute readiness score
    const hrvScore = Math.min(100, Math.max(40, (updated.hrv / 70) * 80));
    const satsScore = updated.sats >= 97 ? 100 : (updated.sats >= 95 ? 85 : 70);
    const sleepScore = Math.min(100, (updated.sleepDurationHours / 8) * 100);
    updated.readinessScore = Math.round((hrvScore * 0.4) + (satsScore * 0.3) + (sleepScore * 0.3));

    await saveHealth(updated);

    return res.status(200).json({
      success: true,
      message: 'Apple Health stats recorded successfully',
      data: updated
    });
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
};
