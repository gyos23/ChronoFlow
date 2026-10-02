const { getTasks, saveTasks } = require('../_store');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const updates = body.updates || [];

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Invalid update payload. Expected { updates: [...] }' });
    }

    const currentTasks = await getTasks();
    const updateMap = new Map();
    updates.forEach(u => updateMap.set(u.id, u));

    const updatedTasks = currentTasks.map(t => {
      if (updateMap.has(t.id)) {
        const u = updateMap.get(t.id);
        return {
          ...t,
          deferDate: u.deferDate !== undefined ? u.deferDate : t.deferDate,
          dueDate: u.dueDate !== undefined ? u.dueDate : t.dueDate,
          duration: u.duration !== undefined ? u.duration : t.duration
        };
      }
      return t;
    });

    await saveTasks(updatedTasks);

    return res.status(200).json({
      success: true,
      live: true,
      updatedCount: updates.length,
      message: `Updated ${updates.length} tasks in cloud schedule. Mac daemon will sync next pass.`
    });
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
};
