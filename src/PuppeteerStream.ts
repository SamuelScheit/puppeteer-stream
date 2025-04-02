import {
	launch as puppeteerLaunch,
	LaunchOptions,
	Browser,
	Page,
} from "puppeteer-core";
import * as path from "path";
import { Transform } from "stream";
import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";

const extensionId = "jjndjgheafjngoipoacpjgeicjeomjli";
let currentIndex = 0;
type StreamLaunchOptions = LaunchOptions & {
		allowIncognito?: boolean;
	} & {
		closeDelay?: number;
	} & {
		extensionPath?: string;
	};
let port: number;

export const wss = (async () => {
	for (let i = 55200; i <= 65535; i++) {
		const ws = new WebSocketServer({ port: i });
		const promise = await Promise.race([
			new Promise((resolve) => {
				ws.on("error", (e: any) => {
					resolve(!e.message.includes("EADDRINUSE"));
				});
			}),
			new Promise((resolve) => {
				ws.on("listening", () => {
					resolve(true);
				});
			}),
		]);
		if (promise) {
			port = i;
			return ws;
		}
	}
})();

export async function launch(
	arg1: StreamLaunchOptions | { launch?: Function; [key: string]: any },
	opts?: StreamLaunchOptions
): Promise<Browser> {
	//if puppeteer library is not passed as first argument, then first argument is options
	// @ts-ignore
	if (typeof arg1.launch != "function") opts = arg1;

	if (!opts) opts = {};
	if (!opts.args) opts.args = [];

	function addToArgs(arg: string, value?: string) {
		if (!value) {
			if (opts.args.includes(arg)) return;
			return opts.args.push(arg);
		}
		let found = false;
		opts.args = opts.args.map((x) => {
			if (x.includes(arg)) {
				found = true;
				return x + "," + value;
			}
			return x;
		});
		if (!found) opts.args.push(arg + value);
	}

	if (!opts.extensionPath) {
		opts.extensionPath = path.join(__dirname, "..", "extension");
	}

	addToArgs("--load-extension=", opts.extensionPath);
	addToArgs("--disable-extensions-except=", opts.extensionPath);
	addToArgs("--allowlisted-extension-id=", extensionId);
	addToArgs("--autoplay-policy=no-user-gesture-required");
	addToArgs("--auto-accept-this-tab-capture");

	if (opts.defaultViewport?.width && opts.defaultViewport?.height) {
		opts.args.push(`--window-size=${opts.defaultViewport.width},${opts.defaultViewport.height}`);
		opts.args.push(`--ozone-override-screen-size=${opts.defaultViewport.width},${opts.defaultViewport.height}`);
	}

	// @ts-ignore
	opts.headless = opts.headless === "new" ? "new" : false;

	if (opts.headless) {
		if (!opts.ignoreDefaultArgs) opts.ignoreDefaultArgs = [];

		if (Array.isArray(opts.ignoreDefaultArgs) && !opts.ignoreDefaultArgs.includes("--mute-audio"))
			opts.ignoreDefaultArgs.push("--mute-audio");

		if (!opts.args.includes("--headless=new")) opts.args.push("--headless=new");
	}

	let browser: Browser;

	// @ts-ignore
	if (typeof arg1.launch == "function") {
		// @ts-ignore
		browser = await arg1.launch(opts);
	} else {
		browser = await puppeteerLaunch(opts);
	}

	if (opts.allowIncognito) {
		const settings = await browser.newPage();
		await settings.goto(`chrome://extensions/?id=${extensionId}`);
		await settings.evaluate(() => {
			(document as any)
				.querySelector("extensions-manager")
				.shadowRoot.querySelector("#viewManager > extensions-detail-view.active")
				.shadowRoot.querySelector(
					"div#container.page-container > div.page-content > div#options-section extensions-toggle-row#allow-incognito"
				)
				.shadowRoot.querySelector("label#label input")
				.click();
		});
		await settings.close();
	}

	(await browser.newPage()).goto(`chrome-extension://${extensionId}/options.html#${port}`);

	const old_browser_close = browser.close;
	browser.close = async () => {
		for (const page of await browser.pages()) {
			if (!page.url().startsWith(`chrome-extension://${extensionId}/options.html`)) {
				await page.close();
			}
		}
		const extension = await getExtensionPage(browser);
		await extension.evaluate(async () => {
			return chrome.tabs.query({});
		});
		if (opts.closeDelay) {
			await new Promise((r) => setTimeout(r, opts.closeDelay));
		}
		await old_browser_close.call(browser);
	};

	return browser;
}

export type BrowserMimeType =
	| "video/webm"
	| "video/webm;codecs=vp8"
	| "video/webm;codecs=vp9"
	| "video/webm;codecs=vp8.0"
	| "video/webm;codecs=vp9.0"
	| "video/webm;codecs=vp8,opus"
	| "video/webm;codecs=vp8,pcm"
	| "video/WEBM;codecs=VP8,OPUS"
	| "video/webm;codecs=vp9,opus"
	| "video/webm;codecs=vp8,vp9,opus"
	| "audio/webm"
	| "audio/webm;codecs=opus"
	| "audio/webm;codecs=pcm"
	| "video/mp4"
	| "video/mp4;codecs=avc1,mp4a.40.2"
	| "video/mp4;codecs=vp9,mp4a.40.2"
	| "video/mp4;codecs=av01,mp4a.40.2";

export type Constraints = {
	mandatory?: MediaTrackConstraints;
	optional?: MediaTrackConstraints;
};

interface IPuppeteerStreamOpts {
	onDestroy: () => Promise<void>;
	highWaterMarkMB: number;
	immediateResume: boolean;
	port: number;
}

interface TabQueryOptions {
	active?: boolean;
	audible?: boolean;
	autoDiscardable?: boolean;
	currentWindow?: boolean;
	discarded?: boolean;
	groupId?: number;
	highlighted?: boolean;
	index?: number;
	lastFocusedWindow?: boolean;
	muted?: boolean;
	pinned?: boolean;
	status?: TabStatus;
	title?: string;
	url?: string | string[];
	windowId?: number;
	windowType?: WindowType;
}

type TabStatus = "unloaded" | "loading" | "complete";

type WindowType = "normal" | "popup" | "panel" | "app" | "devtools";

export interface getStreamOptions {
	audio: boolean;
	video: boolean;
	videoConstraints?: Constraints;
	audioConstraints?: Constraints;
	mimeType?: BrowserMimeType;
	audioBitsPerSecond?: number;
	videoBitsPerSecond?: number;
	bitsPerSecond?: number;
	frameSize?: number;
	delay?: number;
	/**
	 * Tab query options to target the correct tab,
	 * see [Chrome's extensions documentation](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-query) for more info.
	 */
	tabQuery?: TabQueryOptions;
	retry?: {
		each?: number;
		times?: number;
	};
	streamConfig?: {
		highWaterMarkMB?: number;
		immediateResume?: boolean;
		closeTimeout?: number;
	};
}

export async function getExtensionPage(browser: Browser) {
	const extensionTarget = await browser.waitForTarget((target) => {
		return target.type() === "page" && target.url().startsWith(`chrome-extension://${extensionId}/options.html`);
	});
	if (!extensionTarget) throw new Error("cannot load extension");

	const videoCaptureExtension = await extensionTarget.page();
	if (!videoCaptureExtension) throw new Error("cannot get page of extension");

	return videoCaptureExtension;
}

let mutex = false;
let queue: Function[] = [];

function lock() {
	return new Promise((res) => {
		if (!mutex) {
			mutex = true;
			return res(null);
		}
		queue.push(res);
	});
}

function unlock() {
	if (queue.length) queue.shift()();
	else mutex = false;
}

export async function getStream(page: Page, opts: getStreamOptions) {
	if (!opts.audio && !opts.video) throw new Error("At least audio or video must be true");
	if (!opts.mimeType) {
		if (opts.video) opts.mimeType = "video/webm";
		else if (opts.audio) opts.mimeType = "audio/webm";
	}
	if (!opts.frameSize) opts.frameSize = 20;
	const retryPolicy = Object.assign({}, { each: 20, times: 3 }, opts.retry);

	const extension = await getExtensionPage(page.browser());

	const highWaterMarkMB = opts.streamConfig?.highWaterMarkMB || 8;
	const index = currentIndex++;

	await lock();

	await page.bringToFront();
	const [tab] = await extension.evaluate(
		async (x) => {
			// @ts-ignore
			return chrome.tabs.query(x);
		},
		opts.tabQuery || {
			active: true,
		}
	);

	unlock();
	if (!tab) throw new Error("Cannot find tab, try providing your own tabQuery to getStream options");

	const stream = new Transform({
		highWaterMark: 1024 * 1024 * highWaterMarkMB,
		transform(chunk, encoding, callback) {
			callback(null, chunk);
		},
	});

	function onConnection(ws: WebSocket, req: IncomingMessage) {
		const url = new URL(`http://localhost:${port}${req.url}`);
		if (url.searchParams.get("index") != index.toString()) return;

		async function close() {
			if (!stream.readableEnded && !stream.writableEnded) stream.end();
			if (!extension.isClosed() && extension.browser().isConnected()) {
				// @ts-ignore
				extension.evaluate((index) => STOP_RECORDING(index), index);
			}

			if (ws.readyState != WebSocket.CLOSED) {
				setTimeout(() => {
					// await pending messages to be sent and then close the socket
					if (ws.readyState != WebSocket.CLOSED) ws.close();
				}, opts.streamConfig?.closeTimeout ?? 5000);
			}
			(await wss).off("connection", onConnection);
		}

		ws.on("message", (data) => {
			stream.write(data);
		});

		ws.on("close", close);
		page.on("close", close);
		stream.on("close", close);
	}

	(await wss).on("connection", onConnection);

	await lock();
	await page.bringToFront();
	await assertExtensionLoaded(extension, retryPolicy);

	await extension.evaluate(
		// @ts-ignore
		(settings) => START_RECORDING(settings),
		{ ...opts, index, tabId: tab.id }
	);
	unlock();

	return stream;
}

async function assertExtensionLoaded(ext: Page, opt: getStreamOptions["retry"]) {
	const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
	for (let currentTick = 0; currentTick < opt.times; currentTick++) {
		// @ts-ignore
		if (await ext.evaluate(() => typeof START_RECORDING === "function")) return;
		await wait(Math.pow(opt.each, currentTick));
	}
	throw new Error("Could not find START_RECORDING function in the browser context");
}
