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
exports.getStream = exports.launch = exports.Stream = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const stream_1 = require("stream");
const path_1 = __importDefault(require("path"));
class Stream extends stream_1.Readable {
    constructor(page, options) {
        super(options);
        this.page = page;
    }
    _read() { }
    destroy() {
        const _super = Object.create(null, {
            destroy: { get: () => super.destroy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.destroy.call(this);
            // @ts-ignore
            yield this.page.browser().videoCaptureExtension.evaluate((index) => {
                // @ts-ignore
                STOP_RECORDING(index);
            }, 
            // @ts-ignore
            this.page._id);
        });
    }
}
exports.Stream = Stream;
function launch(opts) {
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
        opts.args = opts.args.map((x) => {
            if (x.includes("--load-extension=")) {
                loadExtension = true;
                return x + "," + extensionPath;
            }
            else if (x.includes("--disable-extensions-except=")) {
                loadExtensionExcept = true;
                return "--disable-extensions-except=" + extensionPath + "," + x.split("=")[1];
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
        const browser = yield puppeteer_1.default.launch(opts);
        // @ts-ignore
        browser.encoders = new Map();
        const extensionTarget = yield browser.waitForTarget(
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
}
exports.launch = launch;
function getStream(page, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new Stream(page);
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
        yield page.bringToFront();
        // @ts-ignore
        yield page.browser().videoCaptureExtension.evaluate((settings) => {
            // @ts-ignore
            START_RECORDING(settings);
        }, Object.assign(Object.assign({}, opts), { index: page._id }));
        // @ts-ignore
        page.browser().encoders.set(page._id, encoder);
        return encoder;
    });
}
exports.getStream = getStream;
function str2ab(str) {
    // Convert a UTF-8 String to an ArrayBuffer
    var buf = new ArrayBuffer(str.length); // 1 byte for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1B1cHBldGVlclN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwREFNbUI7QUFDbkIsbUNBQW1EO0FBQ25ELGdEQUF3QjtBQUV4QixNQUFhLE1BQU8sU0FBUSxpQkFBUTtJQUNuQyxZQUFvQixJQUFVLEVBQUUsT0FBeUI7UUFDeEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBREksU0FBSSxHQUFKLElBQUksQ0FBTTtJQUU5QixDQUFDO0lBRUQsS0FBSyxLQUFJLENBQUM7SUFFSixPQUFPOzs7OztZQUNaLE9BQU0sT0FBTyxZQUFHO1lBQ2hCLGFBQWE7WUFDYixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUN2RCxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUNqQixhQUFhO2dCQUNiLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixDQUFDO1lBQ0QsYUFBYTtZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNiLENBQUM7UUFDSCxDQUFDO0tBQUE7Q0FDRDtBQW5CRCx3QkFtQkM7QUFTRCxTQUFzQixNQUFNLENBQzNCLElBQTBFOzs7UUFFMUUsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRS9CLE1BQU0sYUFBYSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5RCxNQUFNLFdBQVcsR0FBRyxrQ0FBa0MsQ0FBQztRQUN2RCxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxtQkFBbUIsR0FBRyxLQUFLLENBQUM7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