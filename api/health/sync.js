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

    const updated = {
      ...existing,
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      sats: rawSats !== undefined ? rawSats : existing.sats,
      wakeTime: body.wakeTime || existing.wakeTime,
      bedTime: body.bedTime || existing.bedTime,
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
