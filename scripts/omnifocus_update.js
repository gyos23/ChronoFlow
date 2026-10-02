// OmniFocus JXA Updater for ChronoFlow
// Accepts JSON input with task updates: [{ id: "...", deferDate: "...", duration: 60 }]
function run(argv) {
  try {
    const of = Application("OmniFocus");
    if (!of.running()) {
      return JSON.stringify({ error: "OmniFocus is not running" });
    }

    const doc = of.defaultDocument;
    if (!argv || argv.length === 0) {
      return JSON.stringify({ error: "No update payload provided" });
    }

    const payload = JSON.parse(argv[0]);
    const updates = payload.updates || [];
    const results = [];

    for (let i = 0; i < updates.length; i++) {
      const item = updates[i];
      try {
        const task = doc.flattenedTasks.byId(item.id);
        if (task) {
          if (item.deferDate) {
            task.deferDate = new Date(item.deferDate);
          }
          if (item.dueDate) {
            task.dueDate = new Date(item.dueDate);
          }
          if (item.duration) {
            task.estimatedMinutes = item.duration;
          }
          if (item.completed !== undefined) {
            task.completed = item.completed;
          }
          results.push({ id: item.id, status: "updated" });
        } else {
          results.push({ id: item.id, status: "not_found" });
        }
      } catch (err) {
        results.push({ id: item.id, status: "error", message: err.toString() });
      }
    }

    return JSON.stringify({ success: true, updatedCount: results.filter(r => r.status === "updated").length, results: results });
  } catch (err) {
    return JSON.stringify({ error: err.toString() });
  }
}
