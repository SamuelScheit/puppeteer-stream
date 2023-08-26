const { launch, getStream } = require("../");
const fs = require("fs");
const utils = require("../tests/_utils");

const file = fs.createWriteStream(__dirname + "/test.webm");

async function test() {
	const browser = await launch({
		executablePath: utils.getExecutablePath(),
	});

	const page = await browser.newPage();
	await page.goto("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
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
	}, 1000 * 10);
}

test();
