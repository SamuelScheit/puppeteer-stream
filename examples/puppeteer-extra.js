const { launch, getStream } = require("../dist/PuppeteerStream");
const fs = require("fs");
const utils = require("../tests/_utils");

// make sure to install puppeteer-extra & puppeteer-extra-plugin-stealth to use this example
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

const file = fs.createWriteStream(__dirname + "/test.webm");

async function test() {
	const browser = await launch(puppeteer, {
		executablePath: utils.getExecutablePath(),
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});

	const page = await browser.newPage();
	await page.goto("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
	const stream = await getStream(page, { audio: true, video: true });
	console.log("recording");

	stream.pipe(file);
	setTimeout(async () => {
		await stream.destroy();
		await browser.close();
		file.close();
		console.log("finished");
	}, 1000 * 10);
}

test();
