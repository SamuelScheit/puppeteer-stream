/// <reference types="node" />
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { Readable, ReadableOptions } from "stream";
export declare class Stream extends Readable {
    private page;
    constructor(page: Page, options?: ReadableOptions);
    _read(): void;
    destroy(): Promise<void>;
}
declare module "puppeteer" {
    interface Page {
        index: number;
        getStream(opts: getStreamOptions): Promise<Stream>;
    }
}
export declare type BrowserMimeType = "audio/webm" | "audio/webm;codecs=opus" | "audio/opus" | "audio/aac" | "audio/ogg" | "audio/mp3" | "audio/pcm" | "audio/wav" | "audio/vorbis" | "video/webm" | "video/mp4" | "image/gif";
export interface getStreamOptions {
    audio: boolean;
    video: boolean;
    mimeType?: BrowserMimeType;
    audioBitsPerSecond?: number;
    videoBitsPerSecond?: number;
    bitsPerSecond?: number;
    frameSize?: number;
}
