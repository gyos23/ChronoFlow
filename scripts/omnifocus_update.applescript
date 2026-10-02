on run argv
	if (count of argv) is 0 then
		return "{\"error\":\"No update payload provided\"}"
	end if
	set payload to item 1 of argv
	tell application id "com.omnigroup.OmniFocus4"
		if not running then
			return "{\"error\":\"OmniFocus is not running\"}"
		end if
		tell default document
			return evaluate javascript "(() => {
				const payload = " & payload & ";
				const updates = payload.updates || [];
				const results = [];
				for (const item of updates) {
					try {
						const task = Task.byIdentifier(item.id);
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
							results.push({ id: item.id, status: 'updated' });
						} else {
							results.push({ id: item.id, status: 'not_found' });
						}
					} catch(err) {
						results.push({ id: item.id, status: 'error', message: err.toString() });
					}
				}
				return JSON.stringify({ success: true, updatedCount: results.filter(r => r.status === 'updated').length, results: results });
			})()"
		end tell
	end tell
end run
