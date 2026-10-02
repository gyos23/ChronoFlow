// OmniFocus JXA Exporter for ChronoFlow
// Accurately pulls all tasks planned and due today from OmniFocus 4

function run() {
  try {
    const of = Application("OmniFocus");
    
    // Check if OmniFocus is running
    try {
      if (!of.running()) {
        return JSON.stringify({ success: false, live: false, message: "OmniFocus is not running", tasks: [] });
      }
    } catch (e) {
      return JSON.stringify({ success: false, live: false, message: "OmniFocus is closed", tasks: [] });
    }

    // Try accessing default document
    let doc = null;
    try {
      doc = of.defaultDocument;
      if (!doc || !doc.name) {
        return JSON.stringify({ success: false, live: false, message: "No open database in OmniFocus", tasks: [] });
      }
    } catch (docErr) {
      return JSON.stringify({ success: false, live: false, message: "OmniFocus database not ready", tasks: [] });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Helper to safely get dates with fallback to effective (inherited) dates
    function getTaskDate(t, prop) {
      try {
        const effProp = "effective" + prop.charAt(0).toUpperCase() + prop.slice(1);
        if (typeof t[effProp] === 'function') {
          const val = t[effProp]();
          if (val) return val;
        }
      } catch (e) {}
      try {
        if (typeof t[prop] === 'function') {
          return t[prop]();
        }
      } catch (e) {}
      return null;
    }

    let allTasks = [];
    try {
      // Query all uncompleted tasks
      allTasks = doc.flattenedTasks.whose({ completed: false })();
    } catch (queryErr) {
      return JSON.stringify({ success: false, live: false, message: "Could not query tasks: " + queryErr.toString(), tasks: [] });
    }

    const todayMatches = [];
    const otherTasks = [];

    for (let i = 0; i < allTasks.length; i++) {
      const t = allTasks[i];
      try {
        const dueDate = getTaskDate(t, "dueDate");
        const deferDate = getTaskDate(t, "deferDate");
        const isFlagged = typeof t.flagged === 'function' ? t.flagged() : false;
        const name = typeof t.name === 'function' ? t.name() : "Untitled Task";
        const id = typeof t.id === 'function' ? t.id() : ("of-" + i);

        let projName = "Inbox";
        try {
          const proj = t.containingProject();
          if (proj) projName = proj.name();
        } catch (pe) {}

        let tagNames = [];
        try {
          const tags = t.tags();
          if (tags) tagNames = tags.map(tag => tag.name());
        } catch (te) {}

        const estMinutes = (typeof t.estimatedMinutes === 'function' ? t.estimatedMinutes() : 0) || 30;

        // Determine if due today or planned today
        let isDueToday = false;
        let isPlannedToday = false;

        if (dueDate && dueDate <= endOfToday) {
          isDueToday = true;
        }

        if (deferDate && deferDate <= endOfToday) {
          // Deferred for today, or deferred in past and currently active
          isPlannedToday = true;
        }

        // Check tags for today/focus markers (e.g. PA. Top, Today, Forecast)
        const hasTodayTag = tagNames.some(tg => /today|forecast|top|focus/i.test(tg));

        let timingLabel = "";
        if (dueDate) {
          const h = dueDate.getHours();
          const m = String(dueDate.getMinutes()).padStart(2, '0');
          const ampm = h >= 12 ? 'PM' : 'AM';
          const displayH = (h % 12) || 12;
          timingLabel = `${displayH}:${m} ${ampm}`;
        }

        const taskRecord = {
          id: id,
          title: name,
          project: projName,
          tags: tagNames,
          duration: estMinutes,
          dueDate: dueDate ? dueDate.toISOString() : null,
          deferDate: deferDate ? deferDate.toISOString() : null,
          flagged: isFlagged,
          isDueToday: isDueToday,
          isPlannedToday: isPlannedToday,
          omniTime: timingLabel,
          type: estMinutes >= 60 ? 'deep' : (estMinutes <= 20 ? 'habit' : 'admin')
        };

        if (isDueToday || isPlannedToday || isFlagged || hasTodayTag) {
          todayMatches.push(taskRecord);
        } else {
          otherTasks.push(taskRecord);
        }
      } catch (err) {
        // Skip inaccessible item
      }
    }

    // Combine matches: today's items first, then top inbox items if total is under 15
    let finalTasks = todayMatches;
    if (finalTasks.length === 0 && otherTasks.length > 0) {
      finalTasks = otherTasks.slice(0, 15);
    }

    return JSON.stringify({
      success: true,
      live: true,
      count: finalTasks.length,
      dueCount: finalTasks.filter(t => t.isDueToday).length,
      plannedCount: finalTasks.filter(t => t.isPlannedToday).length,
      tasks: finalTasks
    });
  } catch (globalErr) {
    return JSON.stringify({ success: false, live: false, message: globalErr.toString(), tasks: [] });
  }
}
