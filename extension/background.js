chrome.tabs.create(
	{ active: false, url: `chrome-extension://${chrome.runtime.id}/options.html` },
	(tab) => {}
);
