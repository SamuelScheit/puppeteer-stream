const { launch, getStream } = require("../dist/PuppeteerStream");
const fs = require("fs");
const http = require("https");

async function main() {
	console.log("downloading video");
	await new Promise((resolve) => {
		const request = http.request("https://vjs.zencdn.net/v/oceans.mp4", (res) => {
			const buffers = [];
			res.on("data", (chunk) => {
				buffers.push(chunk);
			});
			res.on("end", () => {
				fs.writeFileSync(__dirname + "/oceans.mp4", Buffer.concat(buffers));
				resolve();
			});
		});
		request.on("error", console.error);
		request.end();
	});
	console.log("starting browser");

	const browser = await launch({
		defaultViewport: {
			width: 1180,
			height: 950,
		},
		headless: false,
		args: [
			"--no-sandbox",
			"--headless=new",
			"--disable-gpu",
			"--disable-dev-shm-usage",
			// "--mute-audio",
			"--autoplay-policy=no-user-gesture-required",
		],
		ignoreHTTPSErrors: true,
		// executablePath: "/usr/bin/chromium",
		executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	});
	const context = browser.defaultBrowserContext();
	context.clearPermissionOverrides();

	for (let i = 0; i < 50; i++) {
		let x = i;
		(async () => {
			const page = await context.newPage();
			await page.goto(`file://${__dirname}/oceans.html`);
			const file = fs.createWriteStream(__dirname + "/test" + x + ".webm");

			const stream = await getStream(page, {
				audio: true,
				bitsPerSecond: 256000,
			});

			stream.pipe(file);

			process.on("SIGINT", () => {
				console.log("Caught interrupt signal");
				stream.end();
				browser.close();
			});
		})().catch((e) => console.error(e));
	}
}

main();
