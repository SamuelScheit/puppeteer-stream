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
        const extensionPath = path_1.default.join(__dirname, "..", "extension");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1B1cHBldGVlclN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwREFBcUQ7QUFDckQsa0VBQStEO0FBQy9ELG1DQUFtRDtBQUNuRCxnREFBd0I7QUFDeEIsd0VBQXFFO0FBRXJFLE1BQWEsTUFBTyxTQUFRLGlCQUFRO0lBQ25DLFlBQW9CLElBQVUsRUFBRSxPQUF5QjtRQUN4RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFESSxTQUFJLEdBQUosSUFBSSxDQUFNO0lBRTlCLENBQUM7SUFFRCxLQUFLLEtBQUksQ0FBQztJQUVWLE9BQU87UUFDTixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEIsZ0RBQWdEO1FBQ2hELHNDQUFzQztRQUN0QyxrREFBa0Q7UUFDbEQsa0JBQWtCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQ0Q7QUFmRCx3QkFlQztBQVNELE1BQU0sU0FBUyxHQUFHLG1CQUFTLENBQUMsTUFBTSxDQUFDO0FBQ25DLGFBQWE7QUFDYixtQkFBUyxDQUFDLE1BQU0sR0FBRyxVQUFnQixJQUFtQjs7O1FBQ3JELElBQUksQ0FBQyxJQUFJO1lBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUUvQixNQUFNLGFBQWEsR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUQsTUFBTSxXQUFXLEdBQUcsa0NBQWtDLENBQUM7UUFDdkQsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksbUJBQW1CLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLElBQUksV0FBVyxH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