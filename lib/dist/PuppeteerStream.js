"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const Page_1 = require("puppeteer/lib/cjs/puppeteer/common/Page");
const stream_1 = require("stream");
const path_1 = __importDefault(require("path"));
const Browser_1 = require("puppeteer/lib/cjs/puppeteer/common/Browser");
class Stream extends stream_1.Readable {
    constructor(page, options) {
        super(options);
        this.page = page;
    }
    _read() { }
    destroy() {
        super.destroy();
        // TODO: do not destory page just stop recording
        // await page.evaluate((filename) => {
        // 	window.postMessage({ type: "REC_STOP" }, "*");
        // }, exportname);
        return this.page.close();
    }
}
exports.Stream = Stream;
const oldLaunch = puppeteer_1.default.launch;
// @ts-ignore
puppeteer_1.default.launch = function (opts) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        if (!opts)
            opts = {};
        if (!opts.args)
            opts.args = [];
        const extensionPath = path_1.default.join(__dirname, "..", "..", "extension");
        const extensionId = "jjndjgheafjngoipoacpjgeicjeomjli";
        let loadExtension = false;
        let loadExtensionExcept = false;
        let whitelisted = false;
        opts.args.map((x) => {
            if (x.includes("--load-extension=")) {
                loadExtension = true;
                return x + "," + extensionPath;
            }
            else if (x.includes("--disable-extensions-except=")) {
                loadExtensionExcept = true;
                return x + "," + extensionPath;
            }
            else if (x.includes("--whitelisted-extension-id")) {
                whitelisted = true;
                return x + "," + extensionId;
            }
            return x;
        });
        if (!loadExtension)
            opts.args.push("--load-extension=" + extensionPath);
        if (!loadExtensionExcept)
            opts.args.push("--disable-extensions-except=" + extensionPath);
        if (!whitelisted)
            opts.args.push("--whitelisted-extension-id=" + extensionId);
        if (((_a = opts.defaultViewport) === null || _a === void 0 ? void 0 : _a.width) && ((_b = opts.defaultViewport) === null || _b === void 0 ? void 0 : _b.height))
            opts.args.push(`--window-size=${(_c = opts.defaultViewport) === null || _c === void 0 ? void 0 : _c.width}x${(_d = opts.defaultViewport) === null || _d === void 0 ? void 0 : _d.height}`);
        opts.headless = false;
        const browser = yield oldLaunch.call(this, opts);
        // @ts-ignore
        browser.encoders = new Map();
        const targets = yield browser.targets();
        const extensionTarget = targets.find(
        // @ts-ignore
        (target) => target.type() === "background_page" && target._targetInfo.title === "Video Capture");
        // @ts-ignore
        browser.videoCaptureExtension = yield extensionTarget.page();
        // @ts-ignore
        yield browser.videoCaptureExtension.exposeFunction("sendData", (opts) => {
            const data = Buffer.from(str2ab(opts.data));
            // @ts-ignore
            browser.encoders.get(opts.id).push(data);
        });
        return browser;
    });
};
const oldNewPage = Browser_1.Browser.prototype.newPage;
Browser_1.Browser.prototype.newPage = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield oldNewPage.call(this);
        const pages = yield this.pages();
        page.index = pages.length - 1;
        return page;
    });
};
// @ts-ignore
Page_1.Page.prototype.getStream = function (opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new Stream(this);
        if (!opts.audio && !opts.video)
            throw new Error("At least audio or video must be true");
        if (!opts.mimeType) {
            if (opts.video)
                opts.mimeType = "video/webm";
            else if (opts.audio)
                opts.mimeType = "audio/webm";
        }
        if (!opts.frameSize)
            opts.frameSize = 20;
        yield this.bringToFront();
        // @ts-ignore
        yield this.browser().videoCaptureExtension.evaluate((settings) => {
            // @ts-ignore
            START_RECORDING(settings);
        }, Object.assign(Object.assign({}, opts), { index: this.index }));
        // @ts-ignore
        this.browser().encoders.set(this.index, encoder);
        return encoder;
    });
};
function str2ab(str) {
    // Convert a UTF-8 String to an ArrayBuffer
    var buf = new ArrayBuffer(str.length); // 1 byte for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1B1cHBldGVlclN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwREFBcUQ7QUFDckQsa0VBQStEO0FBQy9ELG1DQUFtRDtBQUNuRCxnREFBd0I7QUFDeEIsd0VBQXFFO0FBRXJFLE1BQWEsTUFBTyxTQUFRLGlCQUFRO0lBQ25DLFlBQW9CLElBQVUsRUFBRSxPQUF5QjtRQUN4RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFESSxTQUFJLEdBQUosSUFBSSxDQUFNO0lBRTlCLENBQUM7SUFFRCxLQUFLLEtBQUksQ0FBQztJQUVWLE9BQU87UUFDTixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEIsZ0RBQWdEO1FBQ2hELHNDQUFzQztRQUN0QyxrREFBa0Q7UUFDbEQsa0JBQWtCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQ0Q7QUFmRCx3QkFlQztBQVNELE1BQU0sU0FBUyxHQUFHLG1CQUFTLENBQUMsTUFBTSxDQUFDO0FBQ25DLGFBQWE7QUFDYixtQkFBUyxDQUFDLE1BQU0sR0FBRyxVQUFnQixJQUFtQjs7O1FBQ3JELElBQUksQ0FBQyxJQUFJO1lBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUUvQixNQUFNLGFBQWEsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sV0FBVyxHQUFHLGtDQUFrQyxDQUFDO1FBQ3ZELElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLG1CQUFtQixHQUFHLEtBQUssQ0FBQztRQUNoQyxJ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