// NOTICE: install ffmpeg first
// const { launch, getStream } = require("puppeteer-stream");
const { launch, getStream } = require("../dist/PuppeteerStream");
const fs = require("fs");
const { exec } = require("child_process");

async function test() {
	const browser = await launch({
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});

	const page = await browser.newPage();
	await page.goto("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
	const stream = await getStream(page, { audio: true, video: true, frameSize: 1000 });
	console.log("recording");
	// this will pipe the stream to ffmpeg and convert the webm to mp4 format
	const ffmpeg = exec(`ffmpeg -y -i - output.mp4`);
	ffmpeg.stderr.on("data", (chunk) => {
		console.log(chunk.toString());
	});

	stream.pipe(ffmpeg.stdin);

	setTimeout(async () => {
		await stream.unpipe(ffmpeg);
		ffmpeg.kill();

		console.log("finished");
	}, 1000 * 10);
}

test();
