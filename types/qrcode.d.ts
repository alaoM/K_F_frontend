declare module 'qrcode' {
    interface QRCodeToDataURLOptions {
        type?: string;
        quality?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
        width?: number;
        scale?: number;
    }

    function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
    function toDataURL(
        text: string,
        options: QRCodeToDataURLOptions,
        callback: (err: Error | null, url: string) => void
    ): void;
    function toDataURL(
        text: string,
        callback: (err: Error | null, url: string) => void
    ): void;

    function toString(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
    function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeToDataURLOptions): Promise<void>;
}
