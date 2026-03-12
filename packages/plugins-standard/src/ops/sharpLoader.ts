type SharpMetadata = {
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  space?: string;
  channels?: number;
  hasAlpha?: boolean;
  density?: number;
  exif?: Buffer | Uint8Array;
};

type SharpRawOutput = {
  data: Uint8Array;
  info: { width: number; height: number; channels: number };
};

type SharpPipeline = {
  metadata: () => Promise<SharpMetadata>;
  toBuffer(): Promise<Buffer>;
  toBuffer(options: { resolveWithObject: true }): Promise<SharpRawOutput>;
  png: (...args: unknown[]) => SharpPipeline;
  jpeg: (...args: unknown[]) => SharpPipeline;
  webp: (...args: unknown[]) => SharpPipeline;
  avif: (...args: unknown[]) => SharpPipeline;
  gif: (...args: unknown[]) => SharpPipeline;
  tiff: (...args: unknown[]) => SharpPipeline;
  resize: (...args: unknown[]) => SharpPipeline;
  extend: (...args: unknown[]) => SharpPipeline;
  composite: (...args: unknown[]) => SharpPipeline;
  blur: (...args: unknown[]) => SharpPipeline;
  sharpen: (...args: unknown[]) => SharpPipeline;
  rotate: (...args: unknown[]) => SharpPipeline;
  flip: (...args: unknown[]) => SharpPipeline;
  flop: (...args: unknown[]) => SharpPipeline;
  negate: (...args: unknown[]) => SharpPipeline;
  linear: (...args: unknown[]) => SharpPipeline;
  modulate: (...args: unknown[]) => SharpPipeline;
  removeAlpha: (...args: unknown[]) => SharpPipeline;
  ensureAlpha: (...args: unknown[]) => SharpPipeline;
  normalise: (...args: unknown[]) => SharpPipeline;
  normalize: (...args: unknown[]) => SharpPipeline;
  withMetadata: (...args: unknown[]) => SharpPipeline;
  clone: (...args: unknown[]) => SharpPipeline;
  toFormat: (...args: unknown[]) => SharpPipeline;
  extract: (...args: unknown[]) => SharpPipeline;
  grayscale: (...args: unknown[]) => SharpPipeline;
  threshold: (...args: unknown[]) => SharpPipeline;
  raw: (...args: unknown[]) => SharpPipeline;
  tint: (...args: unknown[]) => SharpPipeline;
};

type SharpLike = (input?: unknown, options?: unknown) => SharpPipeline;

type SharpModule = { default: SharpLike };

export async function loadSharp(): Promise<SharpLike> {
  const specifier = "sharp";
  const mod = (await import(/* @vite-ignore */ specifier)) as SharpModule;
  return mod.default;
}
