const recorders = {} as Record<string, MediaRecorder>;

export type RecordingOptions = {
	index: number;
	video: boolean;
	audio: boolean;
	frameSize: number;
	audioBitsPerSecond: number;
	videoBitsPerSecond: number;
	bitsPerSecond: number;
	mimeType: string;
	videoConstraints?: chrome.tabCapture.MediaStreamConstraint;
	audioConstraints?: chrome.tabCapture.MediaStreamConstraint;
	delay?: number;
	tabId: number;
};

const START_RECORDING = async ({
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
	delay,
	tabId,
}: RecordingOptions) => {
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
			tabId,
		})
	);

	const client = new WebSocket(`ws://localhost:${window.location.hash.substring(1)}/?index=${index}`, []);

	await new Promise<void>((resolve) => {
		if (client.readyState === WebSocket.OPEN) resolve();
		client.addEventListener("open", () => resolve());
	});

	const stream = await new Promise<MediaStream>((resolve, reject) => {
		chrome.tabCapture.capture(
			{
				audio,
				video,
				audioConstraints,
				videoConstraints,
			},
			(stream) => {
				if (chrome.runtime.lastError || !stream) {
					reject(chrome.runtime.lastError?.message);
				} else {
					resolve(stream);
				}
			}
		);
	});

	// somtimes needed to sync audio and video
	if (delay) await new Promise((resolve) => setTimeout(resolve, delay));

	const recorder = new MediaRecorder(stream, {
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

	stream.onremovetrack = () => {
		try {
			recorder.stop();
		} catch (error) {}
	};

	recorder.start(frameSize);
};

const STOP_RECORDING = async (index: number) => {
	console.log("[PUPPETEER_STREAM] STOP_RECORDING", index);
	if (!recorders[index]) return;
	if (recorders[index].state === "inactive") return;

	recorders[index].stop();
};

globalThis.START_RECORDING = START_RECORDING;
globalThis.STOP_RECORDING = STOP_RECORDING;
