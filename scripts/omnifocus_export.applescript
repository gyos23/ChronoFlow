tell application id "com.omnigroup.OmniFocus4"
	if not running then
		return "{\"success\":false,\"live\":false,\"message\":\"OmniFocus is not running\",\"tasks\":[]}"
	end if
	tell default document
		return evaluate javascript "(() => {
			const now = new Date();
			const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
			const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
			
			const windowTaskMap = new Map();
			const fallbackTaskMap = new Map();

			function processTask(t) {
				if (!t || t.completed) return null;
				try {
					if (t.taskStatus === Task.Status.Dropped) return null;
				} catch(e) {}

				const id = t.id.primaryKey;
				const due = t.effectiveDueDate;
				const defer = t.effectiveDeferDate;
				const isDueToday = Boolean(due && (due >= startOfToday) && (due <= endOfToday));
				const isPlannedToday = Boolean(!isDueToday || (defer && (defer >= startOfToday) && (defer <= endOfToday)));

				let omniTime = '';
				if (due) {
					const h = due.getHours();
					const m = String(due.getMinutes()).padStart(2, '0');
					const ampm = h >= 12 ? 'PM' : 'AM';
					const displayH = (h % 12) || 12;
					omniTime = displayH + ':' + m + ' ' + ampm;
				}

				const tags = t.tags ? t.tags.map(x => x.name) : [];
				let est = t.estimatedMinutes || 0;
				if (!est) {
					if (tags.some(x => /t3|deep|high|top/i.test(x))) est = 60;
					else if (tags.some(x => /habit|routine|low/i.test(x))) est = 20;
					else est = 30;
				}

				let taskType = 'admin';
				if (est >= 60 || tags.some(x => /t3|top|p5|deep/i.test(x))) taskType = 'deep';
				else if (est <= 20 || tags.some(x => /habit|routine|p1/i.test(x))) taskType = 'habit';

				return {
					id: id,
					title: t.name,
					project: t.containingProject ? t.containingProject.name : 'Inbox',
					tags: tags,
					duration: est,
					dueDate: due ? due.toISOString() : null,
					deferDate: defer ? defer.toISOString() : null,
					flagged: t.flagged || false,
					isDueToday: isDueToday,
					isPlannedToday: isPlannedToday,
					omniTime: omniTime,
					type: taskType
				};
			}

			// 1. Priority: Harvest visible tasks from active window (e.g. Forecast view)
			try {
				const win = document.windows[0];
				if (win && win.content && win.content.rootNode) {
					function walk(node) {
						if (node.object && node.object instanceof Task) {
							const item = processTask(node.object);
							if (item && !windowTaskMap.has(item.id)) {
								windowTaskMap.set(item.id, item);
							}
						}
						if (node.children) {
							node.children.forEach(walk);
						}
					}
					walk(win.content.rootNode);
				}
			} catch(winErr) {}

			let finalTasks = [];
			if (windowTaskMap.size > 0) {
				finalTasks = Array.from(windowTaskMap.values());
			} else {
				// Fallback: search document for due today or deferred to today
				flattenedTasks.forEach(t => {
					if (t.completed) return;
					const due = t.effectiveDueDate;
					const defer = t.effectiveDeferDate;
					if ((due && due >= startOfToday && due <= endOfToday) || (defer && defer >= startOfToday && defer <= endOfToday) || t.flagged) {
						const item = processTask(t);
						if (item && !fallbackTaskMap.has(item.id)) {
							fallbackTaskMap.set(item.id, item);
						}
					}
				});
				finalTasks = Array.from(fallbackTaskMap.values());
			}

			return JSON.stringify({
				success: true,
				live: true,
				count: finalTasks.length,
				dueCount: finalTasks.filter(t => t.isDueToday).length,
				plannedCount: finalTasks.filter(t => t.isPlannedToday && !t.isDueToday).length,
				tasks: finalTasks
			});
		})()"
	end tell
end tell
