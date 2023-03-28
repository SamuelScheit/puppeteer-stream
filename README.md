# puppeteer-stream

An Extension for Puppeteer to retrieve audio and/or video streams of a page

<a href="https://www.npmjs.com/package/puppeteer-stream">
	<img src="https://img.shields.io/npm/v/puppeteer-stream">
</a>

## Installation

```
npm i puppeteer-stream
# or "yarn add puppeteer-stream"
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
	frameSize?: number; // The number of milliseconds to record into each packet.
  	videoConstraints: {
		mandatory?: MediaTrackConstraints,
		optional?: MediaTrackConstraints
	},
	audioConstraints: {
		mandatory?: MediaTrackConstraints,
		optional?: MediaTrackConstraints
	},
}
```

`getStream` returns a `Promise<`[`Readable`](/dist/PuppeteerStream.d.ts#L4)`>`

For a detailed documentation of the `mimeType`, `audioBitsPerSecond`, `videoBitsPerSecond`, `bitsPerSecond`, `frameSize` properties have a look at the [HTML5 MediaRecorder Options](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder) and for the `videoConstraints` and `audioConstraints` properties have a look at the [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints).

### Launch

The method `launch(options)` is just a slightly changed puppeteer [launch](https://pptr.dev/#?product=Puppeteer&version=v7.1.0&show=api-puppeteerlaunchoptions) function to start puppeteer in headful mode with this extension.

## Example

### [Save Stream to File:](/examples/file.js)

```js
const { launch, getStream } = require("puppeteer-stream");
const fs = require("fs");

const file = fs.createWriteStream(__dirname + "/test.webm");

async function test() {
	const browser = await launch({
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
		file.close();
		console.log("finished");
	}, 1000 * 10);
}

test();
```

### [Stream to Discord](/examples/discord.js)

### [Stream Spotify](https://www.npmjs.com/package/spotify-playback-sdk-node)

### [Use puppeteer-extra plugins](/examples/puppeteer-extra.js)
