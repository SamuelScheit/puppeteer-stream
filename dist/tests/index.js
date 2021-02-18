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
function videoRecorder() {
    return __awaiter(this, void 0, void 0, function* () {
        require("../dist/PuppeteerStream");
        const puppeteer = require("puppeteer");
        const fs = require("fs");
        const filename = `./test.mp4`;
        const file = fs.createWriteStream(filename);
        const browser = yield puppeteer.launch({
            executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless: true,
            defaultViewport: null,
            devtools: false,
            args: ["--window-size=1920,1080", "--window-position=1921,0", "--autoplay-policy=no-user-gesture-required"],
            ignoreDefaultArgs: ["--mute-audio"],
        });
        const page = yield browser.newPage();
        yield page.goto("https://dl5.webmfiles.org/big-buck-bunny_trailer.webm", {
            waitUntil: "load",
        });
        const stream = yield page.getStream({
            audio: true,
            video: true,
        });
        stream.pipe(file);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield stream.destroy();
            file.close();
            console.log("finished");
        }), 10000);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0cy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsU0FBZSxhQUFhOztRQUMzQixPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNuQyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXpCLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQztRQUU5QixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ3RDLGNBQWMsRUFBRSw4REFBOEQ7WUFDOUUsUUFBUSxFQUFFLElBQUk7WUFDZCxlQUFlLEVBQUUsSUFBSTtZQUNyQixRQUFRLEVBQUUsS0FBSztZQUNmLElBQUksRUFBRSxDQUFDLHlCQUF5QixFQUFFLDBCQUEwQixFQUFFLDRDQUE0QyxDQUFDO1lBQzNHLGlCQUFpQixFQUFFLENBQUMsY0FBYyxDQUFDO1NBQ25DLENBQUMsQ0FBQztRQUVILE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRXJDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyx1REFBdUQsRUFBRTtZQUN4RSxTQUFTLEVBQUUsTUFBTTtTQUNqQixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDbkMsS0FBSyxFQUFFLElBQUk7WUFDWCxLQUFLLEVBQUUsSUFBSTtTQUNYLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEIsVUFBVSxDQUFDLEdBQVMsRUFBRTtZQUNyQixNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUFBIn0=