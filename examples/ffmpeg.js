// NOTICE: install ffmpeg first
// const { launch, getStream } = require("puppeteer-stream");
const { launch, getStream } = require("../dist/PuppeteerStream");
const fs = require("fs");
const { exec } = require("child_process");
const utils = require("../tests/_utils");

async function test() {
	const browser = await launch({
		executablePath: utils.getExecutablePath(),
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});

	const page = await browser.newPage();
	await page.goto("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
	const stream = await getStream(page, { audio: true, video: true, frameSize: 1000 });
	console.log("recording");
	// this will pipe the stream to ffmpeg and convert the webm to mkv format (which supports vp8/vp9)
	const ffmpeg = exec(`ffmpeg -y -i - -c copy output.mp4`);
	ffmpeg.stderr.on("data", (chunk) => {
		console.log(chunk.toString());
	});

	stream.on("close", () => {
		console.log("stream close");
		ffmpeg.stdin.end();
	});

	stream.pipe(ffmpeg.stdin);

	setTimeout(async () => {
		stream.destroy();

		console.log("finished");
		await browser.close();
	}, 1000 * 10);
}

test();
