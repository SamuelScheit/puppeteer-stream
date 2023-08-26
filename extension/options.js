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

	const client = new WebSocket("ws://localhost:55200/?index=" + index, []);

	await new Promise((resolve) => {
		if (client.readyState === WebSocket.OPEN) resolve();
		client.addEventListener("open", resolve);
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

		client.send(buffer);
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

			if (client.readyState === WebSocket.OPEN) client.close();
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
	if (recorders[index].state === "inactive") return;

	recorders[index].stop();
}
