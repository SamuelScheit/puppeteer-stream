import {
	launch as puppeteerLaunch,
	LaunchOptions,
	Browser,
	Page,
	BrowserLaunchArgumentOptions,
	BrowserConnectOptions,
} from "puppeteer";
import { Readable, ReadableOptions } from "stream";
import * as path from "path";
import * as url from 'url';

type PageWithExtension = Omit<Page, 'browser'> & { browser(): BrowserWithExtension };

let currentIndex = 0;

export class Stream extends Readable {
	constructor(private page: PageWithExtension, options?: ReadableOptions) {
		super(options);
	}

	_read() {}

	destroy() {
		super.destroy();
		this.page.browser().videoCaptureExtension?.evaluate(
			(index) => {
				// @ts-ignore
				STOP_RECORDING(index);
			},
			this.page.index
		);
		return this;
	}
}

declare module "puppeteer" {
	interface Page {
		index: number;
		getStream(opts: getStreamOptions): Promise<Stream>;
	}
}

type BrowserWithExtension = Browser & { encoders?: Map<number,Stream>; videoCaptureExtension?: Page};

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

	let browser : BrowserWithExtension;
	if (typeof arg1.launch == "function") {
		browser = await arg1.launch(opts);
	} else {
		browser = await puppeteerLaunch(opts);
	}
	browser.encoders = new Map();

	const targets = await browser.targets();
	const extensionTarget = targets.find((t) => {
		return t._getTargetInfo().title === "Video Capture" && t.type() === 'background_page';
	});
	
	if (!extensionTarget) { throw new Error('cannot load extension'); }

	const videoCaptureExtension = await extensionTarget.page();

	if (!videoCaptureExtension) { throw new Error('cannot get page of extension'); }

	browser.videoCaptureExtension = videoCaptureExtension;

	await browser.videoCaptureExtension.exposeFunction(
		"sendData",
		(opts: any) => {
			const data = Buffer.from(str2ab(opts.data));
			browser.encoders?.get(opts.id)?.push(data);
		}
	);

	await browser.videoCaptureExtension.exposeFunction(
		"log",
		(...opts: any) => {
			console.log('videoCaptureExtension', ...opts);
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

export async function getStream(page: PageWithExtension, opts: getStreamOptions) {
	const encoder = new Stream(page);
	if (!opts.audio && !opts.video)
		throw new Error("At least audio or video must be true");
	if (!opts.mimeType) {
		if (opts.video) opts.mimeType = "video/webm";
		else if (opts.audio) opts.mimeType = "audio/webm";
	}
	if (!opts.frameSize) opts.frameSize = 20;

	await page.bringToFront();

	if (page.index === undefined) {
		page.index = currentIndex++;
	}

	await page.browser().videoCaptureExtension?.evaluate(
		(settings) => {
			// @ts-ignore
			START_RECORDING(settings);
		},
		{ ...opts, index: page.index }
	);
	page.browser().encoders?.set(page.index, encoder);

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
