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
            yield this.page.browser().videoCaptureExtension.evaluate((index) => {
                STOP_RECORDING(index);
            }, this.page._id);
        });
    }
}
exports.Stream = Stream;
function launch(arg1, opts) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        //if puppeteer library is not passed as first argument, then first argument is options
        if (typeof arg1.launch != "function") {
            opts = arg1;
        }
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
                return ("--disable-extensions-except=" + extensionPath + "," + x.split("=")[1]);
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
        let browser;
        if (typeof arg1.launch == "function") {
            browser = yield arg1.launch(opts);
        }
        else {
            browser = yield puppeteer_1.default.launch(opts);
        }
        browser.encoders = new Map();
        const extensionTarget = yield browser.waitForTarget((target) => target.type() === "background_page" && target._getTargetInfo().title === "Video Capture");
        browser.videoCaptureExtension = yield extensionTarget.page();
        yield browser.videoCaptureExtension.exposeFunction("sendData", (opts) => {
            const data = Buffer.from(str2ab(opts.data));
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
        yield page.browser().videoCaptureExtension.evaluate((settings) => {
            START_RECORDING(settings);
        }, Object.assign(Object.assign({}, opts), { index: page._id }));
        page.browser().encoders.set(page._id, encoder);
        return encoder;
    });
}
exports.getStream = getStream;
// Convert a UTF-8 String to an ArrayBuffer
function str2ab(str) {
    const buf = new ArrayBuffer(str.length); // 1 byte for each char
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1B1cHBldGVlclN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwREFNbUI7QUFDbkIsbUNBQW1EO0FBQ25ELGdEQUF3QjtBQVV4QixNQUFhLE1BQU8sU0FBUSxpQkFBUTtJQUNuQyxZQUFvQixJQUFVLEVBQUUsT0FBeUI7UUFDeEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBREksU0FBSSxHQUFKLElBQUksQ0FBTTtJQUU5QixDQUFDO0lBRUQsS0FBSyxLQUFJLENBQUM7SUFFSixPQUFPOzs7OztZQUNaLE9BQU0sT0FBTyxZQUFHO1lBQ2hCLE1BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQXVCLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUM3RSxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUNqQixjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxFQUNELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNiLENBQUM7UUFDSCxDQUFDO0tBQUE7Q0FDRDtBQWhCRCx3QkFnQkM7QUFVRCxTQUFzQixNQUFNLENBQzNCLElBRU0sRUFDTixJQUEyRTs7O1FBRTNFLHNGQUFzRjtRQUN0RixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sSUFBSSxVQUFVLEVBQUU7WUFDckMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRS9CLE1BQU0sYUFBYSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5RCxNQUFNLFdBQVcsR0FBRyxrQ0FBa0Ms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