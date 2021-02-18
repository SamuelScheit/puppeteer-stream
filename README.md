# puppeteer-stream

An Extension for Puppeteer to retrieve audio and/or video streams of a page

## Installation

```
npm i puppeteer-stream
# or "yarn add puppeteer"
```

## Usage

ES5 import

```js
const { launch, getStream } = require("puppeteer-stream");
```

or ES6 import

```js
import { launch, getStream } from "puppeteer-stream";
```

### Notice: This will only work in headful mode

The method `getStream(options)` takes the following options

```ts
{
	audio: boolean; // whether or not to enable audio
	video: boolean; // whether or not to enable video
	mimeType?: string; // optional mime type of the stream, e.g. "audio/webm" or "video/webm"
	audioBitsPerSecond?: number; // The chosen bitrate for the audio component of the media.
	videoBitsPerSecond?: number; // The chosen bitrate for the video component of the media.
	bitsPerSecond?: number; // The chosen bitrate for the audio and video components of the media. This can be specified instead of the above two properties. If this is specified along with one or the other of the above properties, this will be used for the one that isn't specified.
	frameSize?: number = 20; // The number of milliseconds to record into each packet.
}
```
and returns a `Promise<`[`Readable`](/dist/PuppeteerStream.d.ts#L4)`>`

For a detailed documentation of the options have a look at the [HTML5 MediaRecorder Options](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder)

## Example

### [Save Stream to File:](/examples/example.js)

```js
const { launch, getStream }  = require("puppeteer-stream");
const fs = require("fs");

const file = fs.createWriteStream(__dirname + "/test.webm");

async function test() {
	const browser = await slaunch({
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});

	const page = await browser.newPage();
	await page.goto("https://dl5.webmfiles.org/big-buck-bunny_trailer.webm");
	const stream = await getStream(page, { audio: true, video: true });
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

### [Stream to Discord](/examples/discord.js)
