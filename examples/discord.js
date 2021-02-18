// npm i discord.js @discordjs/opus ffmpeg-static puppeteer puppeteer-stream
// start this script
const { Client } = require("discord.js");
const { launch, getStream } = require("puppeteer-stream");

const client = new Client();

console.log("starting ...");
client.on("ready", () => console.log("bot started: enter !play in a server channel"));

client.on("message", async (message) => {
	if (message.content !== "!play") return;
	if (!message.member) return message.reply("This command can only be executed on a server");
	if (!message.member.voice || !message.member.voice.channel) return message.reply("Join a Voice Channel first");

	const browser = await launch({
		defaultViewport: {
			width: 1920,
			height: 1080,
		},
	});
	const connection = await message.member.voice.channel.join();
	const page = await browser.newPage();
	await page.goto("https://dl5.webmfiles.org/big-buck-bunny_trailer.webm");
	const stream = await getStream(page, { audio: true, video: false });

	const dispatcher = await connection.play(stream);
});

client.login(process.env.TOKEN);
