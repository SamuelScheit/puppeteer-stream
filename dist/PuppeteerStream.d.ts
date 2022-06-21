/// <reference types="node" />
import { LaunchOptions, Browser, Page, BrowserLaunchArgumentOptions, BrowserConnectOptions } from "puppeteer";
import { Readable, ReadableOptions } from "stream";
export declare class Stream extends Readable {
    private page;
    constructor(page: Page, options?: ReadableOptions);
    _read(): void;
    destroy(): Promise<void>;
}
declare module "puppeteer" {
    interface Page {
        _id: string;
        index: number;
        getStream(opts: getStreamOptions): Promise<Stream>;
    }
}
export declare function launch(arg1: (LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions) | any, opts?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions): Promise<Browser>;
export declare type BrowserMimeType = "audio/webm" | "audio/webm;codecs=opus" | "audio/opus" | "audio/aac" | "audio/ogg" | "audio/mp3" | "audio/pcm" | "audio/wav" | "audio/vorbis" | "video/webm" | "video/mp4";
export interface getStreamOptions {
    audio: boolean;
    video: boolean;
    mimeType?: BrowserMimeType;
    audioBitsPerSecond?: number;
    videoBitsPerSecond?: number;
    bitsPerSecond?: number;
    frameSize?: number;
}
export declare function getStream(page: Page, opts: getStreamOptions): Promise<Stream>;
