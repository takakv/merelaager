export {};

declare global {
  // Required for the qrcode module, which has types for the browser as well.
  type HTMLCanvasElement = never;
}
