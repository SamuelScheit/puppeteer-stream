const { launch, getStream } = require("../");
const fs = require("fs");
const utils = require("../tests/_utils");

async function youtube(browser, i = 0) {
	const file = fs.createWriteStream(__dirname + "/test" + i + ".webm", {
		highWaterMark: 1024,
	});

	const page = await browser.newPage();
	await page.goto("https://www.youtube.com/embed/9bZkp7q19f0?autoplay=1&vq=hd1080&start=30");
	await page.setViewport({
		width: 1920,
		height: 1080,
	});
	const stream = await getStream(page, {
		audio: true,
		video: true,
		videoConstraints: {
			mandatory: {
				maxWidth: 1920,
				maxHeight: 1080,
			},
		},
	});
	console.log("recording");

	stream.pipe(file);
	setTimeout(async () => {
		stream.destroy();
		file.close();
		console.log("finished");
		await page.close();
	}, 1000 * 10);
}

async function main() {
	const browser = await launch({
		executablePath: utils.getExecutablePath(),
		headless: "new",
	});

	for (let i = 0; i < 1; i++) {
		youtube(browser, i).catch(console.error);
	}
}

main();
