// @ts-nocheck
/* global chrome, MediaRecorder, FileReader */

const recorders = {};

function START_RECORDING({ index, video, audio, frameSize, audioBitsPerSecond, videoBitsPerSecond, bitsPerSecond, mimeType, videoConstraints }) {
	chrome.tabCapture.capture(
		{
			audio,
			video,
			videoConstraints
		},
		(stream) => {
			if (!stream) return;

			recorder = new MediaRecorder(stream, {
				ignoreMutedMedia: true,
				audioBitsPerSecond,
				videoBitsPerSecond,
				bitsPerSecond,
				mimeType,
			});
			recorders[index] = recorder;
			// TODO: recorder onerror

			recorder.ondataavailable = async function (event) {
				if (event.data.size > 0) {
					const buffer = await event.data.arrayBuffer();
					const data = arrayBufferToString(buffer);

					if (window.sendData) {
						window.sendData({
							id: index,
							data,
						});
					}
				}
			};
			recorder.onerror = () => recorder.stop();

			recorder.onstop = function () {
				try {
					const tracks = stream.getTracks();

					tracks.forEach(function (track) {
						track.stop();
					});
				} catch (error) {}
			};
			stream.oninactive = () => {
				try {
					recorder.stop();
				} catch (error) {}
			};

			recorder.start(frameSize);
		}
	);
}

function STOP_RECORDING(index) {
	//chrome.extension.getBackgroundPage().console.log(recorders)
	if (!recorders[index]) return;
	recorders[index].stop();
}

function arrayBufferToString(buffer) {
	// Convert an ArrayBuffer to an UTF-8 String

	var bufView = new Uint8Array(buffer);
	var length = bufView.length;
	var result = "";
	var addition = Math.pow(2, 8) - 1;

	for (var i = 0; i < length; i += addition) {
		if (i + addition > length) {
			addition = length - i;
		}
		result += String.fromCharCode.apply(null, bufView.subarray(i, i + addition));
	}
	return result;
}
