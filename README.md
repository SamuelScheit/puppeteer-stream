# puppeteer-stream

An Extension for Puppeteer to retrieve audio and/or video streams of a page

<a href="https://www.npmjs.com/package/puppeteer-stream">
	<img src="https://img.shields.io/npm/v/puppeteer-stream">
</a>

## Recording video/audio from video conferencing calls

If you’re looking to use this repo to retrieve video or audio streams from meeting platforms like Zoom, Google Meet, Microsoft Teams, consider checking out [Recall.ai](https://www.recall.ai/?utm_source=github&utm_medium=sponsorship&utm_campaign=puppeteer-stream), an API for meeting recording.

## Installation

```
npm i puppeteer-stream
# or "yarn add puppeteer-stream"
```

## Usage

### Import

For ES5

```js
const { launch, getStream } = require("puppeteer-stream");
```

or for ES6

```js
import { launch, getStream } from "puppeteer-stream";
```

### Launch

The method [`launch(options)`](https://github.com/SamuelScheit/puppeteer-stream/blob/main/src/PuppeteerStream.ts#L16) takes additional to the original [puppeteer launch function](https://github.com/puppeteer/puppeteer/blob/puppeteer-v20.7.2/docs/api/puppeteer.puppeteernode.launch.md), the following options

```ts
{
	allowIncognito?: boolean, // to be able to use incognito mode
	closeDelay?: number, // to fix rarely occurring TargetCloseError, set and increase number (in ms)
	extensionPath?: string, // used internally to load the puppeteer-stream browser extension (needed for electron https://github.com/SamuelScheit/puppeteer-stream/issues/137)
}
```

and returns a `Promise<`[`Browser`](https://github.com/SamuelScheit/puppeteer-stream/blob/beb7d50dbae8069cd7e42eb17dbe99174c56e3a6/src/PuppeteerStream.ts#L126)`>`

#### Headless

Works also in headless mode (no gui needed), just set `headless: "new"` in the [launch options](#launch)

### Get Stream

The method [`getStream(options)`](https://github.com/SamuelScheit/puppeteer-stream/blob/beb7d50dbae8069cd7e42eb17dbe99174c56e3a6/src/PuppeteerStream.ts#L208) takes the following options

```ts
{
	audio: boolean, // whether or not to enable audio
	video: boolean, // whether or not to enable video
	mimeType?: string, // optional mime type of the stream, e.g. "audio/webm" or "video/webm"
	audioBitsPerSecond?: number, // The chosen bitrate for the audio component of the media.
	videoBitsPerSecond?: number, // The chosen bitrate for the video component of the media.
	bitsPerSecond?: number, // The chosen bitrate for the audio and video components of the media. This can be specified instead of the above two properties. If this is specified along with one or the other of the above properties, this will be used for the one that isn't specified.
	frameSize?: number, // The number of milliseconds to record into each packet.
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

and returns a `Promise<`[`Readable`](https://github.com/SamuelScheit/puppeteer-stream/blob/beb7d50dbae8069cd7e42eb17dbe99174c56e3a6/src/PuppeteerStream.ts#L288)`>`

For a detailed documentation of the `mimeType`, `audioBitsPerSecond`, `videoBitsPerSecond`, `bitsPerSecond`, `frameSize` properties have a look at the [HTML5 MediaRecorder Options](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder) and for the `videoConstraints` and `audioConstraints` properties have a look at the [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints).

## Example

### [Save Stream to File:](/examples/file.js)

```js
const { launch, getStream, wss } = require("puppeteer-stream");
const fs = require("fs");

const file = fs.createWriteStream(__dirname + "/test.webm");

async function test() {
	const browser = await launch({
		executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
		// or on linux: "google-chrome-stable"
		// or on mac: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});

	const page = await browser.newPage();
	await page.goto("https://www.youtube.com/embed/9bZkp7q19f0?autoplay=1");
	const stream = await getStream(page, { audio: true, video: true });
	console.log("recording");

	stream.pipe(file);
	setTimeout(async () => {
		await stream.destroy();
		file.close();
		console.log("finished");

		await browser.close();
		(await wss).close();
	}, 1000 * 10);
}

test();
```

### [Stream to Discord](/examples/discord.js)

### [Stream Spotify](https://www.npmjs.com/package/spotify-playback-sdk-node)

### [Use puppeteer-extra plugins](/examples/puppeteer-extra.js)
