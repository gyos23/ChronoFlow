const { getTasks, saveTasks } = require('../_store');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // POST: Sync tasks from Mac Local Relay or iOS App
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const tasks = body.tasks || (Array.isArray(body) ? body : []);

      if (tasks.length === 0) {
        return res.status(400).json({ error: 'No tasks provided in payload' });
      }

      await saveTasks(tasks);

      return res.status(200).json({
        success: true,
        live: true,
        count: tasks.length,
        dueCount: tasks.filter(t => t.isDueToday).length,
        plannedCount: tasks.filter(t => t.isPlannedToday && !t.isDueToday).length,
        message: `Successfully synchronized ${tasks.length} OmniFocus tasks to cloud store`
      });
    } catch (err) {
      return res.status(500).json({ error: err.toString() });
    }
  }

  // GET: Fetch current tasks
  try {
    const tasks = await getTasks();
    const dueCount = tasks.filter(t => t.isDueToday).length;
    const plannedCount = tasks.filter(t => t.isPlannedToday && !t.isDueToday).length;

    return res.status(200).json({
      success: true,
      live: true,
      count: tasks.length,
      dueCount: dueCount,
      plannedCount: plannedCount,
      tasks: tasks
    });
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
};
