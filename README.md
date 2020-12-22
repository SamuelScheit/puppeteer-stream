# puppeteer-stream

An Extension for Puppeteer to retrieve audio and/or video streams

## Installation

```
npm i puppeteer-stream
# or "yarn add puppeteer"
```

## Usage

ES5 import

```js
require("puppeteer-stream");
const puppeteer = require("puppeteer");
```

or ES6 import

```js
import "puppeteer-stream";
import puppeteer from "puppeteer";
```

This will patch the launch method of puppeteer to start with this record extension and will add a `page.getStream(options)` method to all pages.

The method `page.getStream(options)` takes the following options:

```ts
{
	audio: boolean; // wheter or not to enable audio
	video: boolean; // wheter or not to enable video
	mimeType?: BrowserMimeType; // optional mimeType of the stream, e.g. "audio/webm", "video/webm"
	audioBitsPerSecond?: number; // The chosen bitrate for the audio component of the media.
	videoBitsPerSecond?: number; // The chosen bitrate for the video component of the media.
	bitsPerSecond?: number; // The chosen bitrate for the audio and video components of the media. This can be specified instead of the above two properties. If this is specified along with one or the other of the above properties, this will be used for the one that isn't specified.
	frameSize?: number = 20; // The number of milliseconds to record into each packet.
}
```

## Example

### Save Stream to File:

```js
require("puppeteer-stream");
const puppeteer = require("puppeteer");
const fs = require("fs");

const file = fs.createWriteStream(__dirname + "/test.webm");

async function test() {
	const browser = await puppeteer.launch({
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});

	const page = await browser.newPage();
	await page.goto("https://dl5.webmfiles.org/big-buck-bunny_trailer.webm");
	const stream = await page.getStream({ audio: true, video: true });
	console.log("recording");

	stream.pipe(file);
	setTimeout(async () => {
		await stream.destroy();
		file.close();
		console.log("finished");
	}, 1000 * 10);
}

test();
```

### [Stream to Discord](/lib/examples/discord.js)
