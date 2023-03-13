import {
	launch as puppeteerLaunch,
	LaunchOptions,
	Browser,
	Page,
	BrowserLaunchArgumentOptions,
	BrowserConnectOptions,
} from "puppeteer-core";
import * as path from "path";
import { Readable } from "stream";
import dgram, { Socket } from "dgram";

const extensionPath = path.join(__dirname, "..", "extension");
const extensionId = "jjndjgheafjngoipoacpjgeicjeomjli";
let currentIndex = 0;
type StreamLaunchOptions = LaunchOptions &
	BrowserLaunchArgumentOptions &
	BrowserConnectOptions & {
		allowIncognito?: boolean;
	};

export async function launch(
	arg1: StreamLaunchOptions & { launch?: Function; [key: string]: any },
	opts?: StreamLaunchOptions
): Promise<Browser> {
	//if puppeteer library is not passed as first argument, then first argument is options
	if (typeof arg1.launch != "function") {
		opts = arg1;
	}

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

	addToArgs("--load-extension=", extensionPath);
	addToArgs("--disable-extensions-except=", extensionPath);
	addToArgs("--whitelisted-extension-id=", extensionId);
	addToArgs("--autoplay-policy=no-user-gesture-required");

	if (opts.defaultViewport?.width && opts.defaultViewport?.height)
		opts.args.push(`--window-size=${opts.defaultViewport.width}x${opts.defaultViewport.height}`);

	opts.headless = false;

	let browser: Browser;
	if (typeof arg1.launch == "function") {
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
	| "audio/webm;codecs=pcm";

export interface getStreamOptions {
	audio: boolean | MediaTrackConstraints;
	video: boolean | MediaTrackConstraints;
	mimeType?: BrowserMimeType;
	audioBitsPerSecond?: number;
	videoBitsPerSecond?: number;
	bitsPerSecond?: number;
	frameSize?: number;
	delay?: number;
}

async function getExtensionPage(browser: Browser) {
	const extensionTarget = await browser.waitForTarget((target) => {
		return target.type() === "page" && target.url() === `chrome-extension://${extensionId}/options.html`;
	});
	if (!extensionTarget) throw new Error("cannot load extension");

	const videoCaptureExtension = await extensionTarget.page();
	if (!videoCaptureExtension) throw new Error("cannot get page of extension");

	return videoCaptureExtension;
}

export async function getStream(page: Page, opts: getStreamOptions) {
	if (!opts.audio && !opts.video) throw new Error("At least audio or video must be true");
	if (!opts.mimeType) {
		if (opts.video) opts.mimeType = "video/webm";
		else if (opts.audio) opts.mimeType = "audio/webm";
	}
	if (!opts.frameSize) opts.frameSize = 20;

	const extension = await getExtensionPage(page.browser());
	const index = currentIndex++;

	const stream = new UDPStream(55200 + index, () =>
		// @ts-ignore
		extension.evaluate((index) => STOP_RECORDING(index), index)
	);

	await page.bringToFront();
	extension.evaluate(
		// @ts-ignore
		(settings) => START_RECORDING(settings),
		{ ...opts, index }
	);

	return stream;
}

class UDPStream extends Readable {
	socket: Socket;
	constructor(port = 55200, public onDestroy: Function) {
		super({ highWaterMark: 1024 * 1024 * 8 });
		this.socket = dgram
			.createSocket("udp4", (data) => {
				this.push(data);
			})
			.bind(port, "127.0.0.1", () => {});

		this.resume();
	}

	_read(size: number): void {}

	// @ts-ignore
	override async destroy(error?: Error) {
		await this.onDestroy();
		this.socket.close();
		super.destroy();
		return this;
	}
}
