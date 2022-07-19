const utils = require('./_utils');

async function videoRecorder() {
	const { getStream, launch } = require("../dist/PuppeteerStream");
	const fs = require("fs");

	const filename = `./test.webm`;

	const file = fs.createWriteStream(filename);

	const browser = await launch({
		executablePath: utils.getExecutablePath(),
		headless: true,
		defaultViewport: null,
		devtools: true,
		args: ["--window-size=1920,1080", "--window-position=1921,0", "--autoplay-policy=no-user-gesture-required"],
	});

	const page = await browser.newPage();

	await page.goto("https://www.rtp.pt/play/p8157/e518677/telejornal", {
		waitUntil: "load",
	});

	const stream = await getStream(page, {
		audio: true,
		video: true,
	});

	stream.pipe(file);

	setTimeout(async () => {
    await stream.destroy();
		file.close();
		await browser.close();
		console.log("finished");
	}, 10000);
}
videoRecorder();
