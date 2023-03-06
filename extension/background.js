chrome.tabs.create(
	{ pinned: true, active: false, url: `chrome-extension://${chrome.runtime.id}/options.html` },
	(tab) => {}
);
