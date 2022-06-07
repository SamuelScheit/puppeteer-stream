import puppeteer, {
	LaunchOptions,
	Browser,
	Page,
	BrowserLaunchArgumentOptions,
	BrowserConnectOptions,
} from "puppeteer";
import { Readable, ReadableOptions } from "stream";
import path from "path";

export class Stream extends Readable {
	constructor(private page: Page, options?: ReadableOptions) {
		super(options);
	}

	_read() {}

	async destroy() {
		super.destroy();
		// @ts-ignore
		await this.page.browser().videoCaptureExtension.evaluate(
			(index: string) => {
				// @ts-ignore
				STOP_RECORDING(index);
			},
			// @ts-ignore
			this.page._id
		);
	}
}

declare module "puppeteer" {
	interface Page {
		index: number;
		getStream(opts: getStreamOptions): Promise<Stream>;
	}
}

export async function launch(
	arg1:
		| (LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions)
		| any,
	opts?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions
): Promise<Browser> {
	//if puppeteer library is not passed as first argument, then first argument is options
	if (typeof arg1.launch != "function") {
		opts = arg1;
	}

	if (!opts) opts = {};

	if (!opts.args) opts.args = [];

	const extensionPath = path.join(__dirname, "..", "extension");
	const extensionId = "jjndjgheafjngoipoacpjgeicjeomjli";
	let loadExtension = false;
	let loadExtensionExcept = false;
	let whitelisted = false;

	opts.args = opts.args.map((x) => {
		if (x.includes("--load-extension=")) {
			loadExtension = true;
			return x + "," + extensionPath;
		} else if (x.includes("--disable-extensions-except=")) {
			loadExtensionExcept = true;
			return (
				"--disable-extensions-except=" + extensionPath + "," + x.split("=")[1]
			);
		} else if (x.includes("--whitelisted-extension-id")) {
			whitelisted = true;
			return x + "," + extensionId;
		}

		return x;
	});

	if (!loadExtension) opts.args.push("--load-extension=" + extensionPath);
	if (!loadExtensionExcept)
		opts.args.push("--disable-extensions-except=" + extensionPath);
	if (!whitelisted) opts.args.push("--whitelisted-extension-id=" + extensionId);
	if (opts.defaultViewport?.width && opts.defaultViewport?.height)
		opts.args.push(
			`--window-size=${opts.defaultViewport?.width}x${opts.defaultViewport?.height}`
		);

	opts.headless = false;

	let browser : Browser;
	if (typeof arg1.launch == "function") {
		browser = await arg1.launch(opts);
	} else {
		browser = await puppeteer.launch(opts); 
	}
	// @ts-ignore
	browser.encoders = new Map();

	const extensionTarget = await browser.waitForTarget(
		// @ts-ignore
		(target) => target.type() === "background_page" && target._targetInfo.title === "Video Capture"
	);

	// @ts-ignore
	browser.videoCaptureExtension = await extensionTarget.page();

	// @ts-ignore
	await browser.videoCaptureExtension.exposeFunction(
		"sendData",
		(opts: any) => {
			const data = Buffer.from(str2ab(opts.data));
			// @ts-ignore
			browser.encoders.get(opts.id).push(data);
		}
	);

	return browser;
}

export type BrowserMimeType =
	| "audio/webm"
	| "audio/webm;codecs=opus"
	| "audio/opus"
	| "audio/aac"
	| "audio/ogg"
	| "audio/mp3"
	| "audio/pcm"
	| "audio/wav"
	| "audio/vorbis"
	| "video/webm"
	| "video/mp4";

export interface getStreamOptions {
	audio: boolean;
	video: boolean;
	mimeType?: BrowserMimeType;
	audioBitsPerSecond?: number;
	videoBitsPerSecond?: number;
	bitsPerSecond?: number;
	frameSize?: number;
}

export async function getStream(page: Page, opts: getStreamOptions) {
	const encoder = new Stream(page);
	if (!opts.audio && !opts.video)
		throw new Error("At least audio or video must be true");
	if (!opts.mimeType) {
		if (opts.video) opts.mimeType = "video/webm";
		else if (opts.audio) opts.mimeType = "audio/webm";
	}
	if (!opts.frameSize) opts.frameSize = 20;

	await page.bringToFront();
	// @ts-ignore

	await (<Page>page.browser().videoCaptureExtension).evaluate(
		(settings) => {
			// @ts-ignore
			START_RECORDING(settings);
		},
		// @ts-ignore
		{ ...opts, index: page._id }
	);

	// @ts-ignore
	page.browser().encoders.set(page._id, encoder);

	return encoder;
}

function str2ab(str: any) {
	// Convert a UTF-8 String to an ArrayBuffer

	var buf = new ArrayBuffer(str.length); // 1 byte for each char
	var bufView = new Uint8Array(buf);

	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}
