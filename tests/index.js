const utils = require("./_utils");
const { getStream, launch } = require("../dist/PuppeteerStream");
const fs = require("fs");
const child_process = require("child_process");

async function videoRecorder() {
	const filename = `./test.webm`;

	const file = fs.createWriteStream(filename);

	const browser = await launch({
		executablePath: utils.getExecutablePath(),
		headless: false,
		defaultViewport: null,
		devtools: true,
	});

	const page = await browser.newPage();

	await page.goto("https://www.rtp.pt/play/p8157/e518677/telejornal", {
		waitUntil: "load",
	});

	const stream = await getStream(page, {
		audio: true,
		video: true,
		delay: 1000,
	});

	stream.on("end", () => {
		file.close();
	});

	stream.pipe(file);

	setTimeout(async () => {
		await stream.destroy();
		await browser.close();
		console.log("finished");
	}, 10000);

	// stream.pipe(p.stdin);
}
videoRecorder();
