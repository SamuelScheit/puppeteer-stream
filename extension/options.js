const recorders = {};

async function START_RECORDING({
	index,
	video,
	audio,
	frameSize,
	audioBitsPerSecond,
	videoBitsPerSecond,
	bitsPerSecond,
	mimeType,
	videoConstraints,
	delay,
	audioConstraints,
}) {
	console.log(
		"[PUPPETEER_STREAM] START_RECORDING",
		JSON.stringify({
			index,
			video,
			audio,
			frameSize,
			audioBitsPerSecond,
			videoBitsPerSecond,
			bitsPerSecond,
			mimeType,
			videoConstraints,
			audioConstraints,
		})
	);

	const { socketId } = await new Promise((resolve) => {
		chrome.sockets.tcp.create({ bufferSize: 1024 * 1024 * 8 }, resolve);
	});

	await new Promise((resolve) => {
		chrome.sockets.tcp.connect(socketId, "127.0.0.1", 55200 + index, "ipv4", resolve);
	});

	const send = (data) =>
		new Promise((resolve) => {
			chrome.sockets.tcp.send(socketId, data, resolve);
		});

	const stream = await new Promise((resolve, reject) => {
		chrome.tabCapture.capture({ video, audio, videoConstraints, audioConstraints }, (stream) => {
			if (stream) resolve(stream);
			else reject();
		});
	});

	// somtimes needed to sync audio and video
	if (delay) await new Promise((resolve) => setTimeout(resolve, delay));

	const recorder = new MediaRecorder(stream, {
		ignoreMutedMedia: true,
		audioBitsPerSecond,
		videoBitsPerSecond,
		bitsPerSecond,
		mimeType,
	});

	recorder.ondataavailable = async (e) => {
		if (!e.data.size) return;

		const buffer = await e.data.arrayBuffer();

		await send(buffer);
	};
	recorders[index] = recorder;
	// TODO: recorder onerror

	recorder.onerror = () => recorder.stop();

	recorder.onstop = function () {
		try {
			const tracks = stream.getTracks();

			tracks.forEach(function (track) {
				track.stop();
			});

			chrome.sockets.tcp.disconnect(socketId);
		} catch (error) {}
	};
	stream.oninactive = () => {
		try {
			recorder.stop();
		} catch (error) {}
	};

	recorder.start(frameSize);
}

function STOP_RECORDING(index) {
	console.log("[PUPPETEER_STREAM] STOP_RECORDING", index);
	if (!recorders[index]) return;
	recorders[index].stop();
}
