const utils = require("./_utils");
const http = require("http");
const { getStream, launch } = require("../dist/PuppeteerStream");

async function main() {
	const browser = await launch({
		executablePath: utils.getExecutablePath(),
		headless: true,
	});

	const server = http.createServer(async (req, res) => {
		try {
			const url = decodeURIComponent(req.url.replace("/", ""));
			if (!url.startsWith("http://") && !url.startsWith("https://")) return res.end();
			if (!req.headers["range"]) {
				res.writeHead(200, {
					"Content-Type": "video/webm",
				});
				res.end();
				return;
			}
			console.log(req.url);

			const page = await browser.newPage();
			await page.goto(url);

			req.on("close", async () => {
				await page.close();
			});

			const stream = await getStream(page, {
				audio: true,
				video: true,
				frameSize: 500,
			});

			req.on("close", async () => {
				console.log("request end");
				await stream.destroy();
			});

			stream.pipe(res);
		} catch (error) {
			console.error(error);
			res.end();
		}
	});

	server.listen(3000, () => {
		console.log("Server is listening on port 3000");
		console.log("Try opening http://localhost:3000/https://www.youtube.com/watch?v=dQw4w9WgXcQ");
	});
}

main();
