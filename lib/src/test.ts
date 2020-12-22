import puppeteer from "puppeteer";
import "./PuppeteerStream";
import fs from "fs";

const file = fs.createWriteStream(__dirname + "/../test.webm");

async function test() {
	const browser = await puppeteer.launch({
		executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		defaultViewport: {
			width: 1920,
			height: 1080,
			deviceScaleFactor: 2,
		},
	});

	const page = await browser.newPage();
	await page.goto("https://www.twitch.tv/xqcow");
	await page.waitForTimeout(8000);
	const stream = await page.getStream({ audio: true, video: true, frameSize: 960 });

	stream.pipe(file);
	setTimeout(async () => {
		await stream.destroy();
		file.close();
		console.log("finished");
	}, 1000 * 10);
}

test();
