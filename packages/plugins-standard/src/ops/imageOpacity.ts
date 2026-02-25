import type { Operation } from "@cybermasterchef/core";

export const imageOpacity: Operation = {
  id: "image.opacity",
  name: "Image Opacity",
  description: "Adjusts image opacity (alpha).",
  input: ["bytes"],
  output: "bytes",
  args: [
    { key: "opacity", label: "Opacity (0-1)", type: "number", defaultValue: 1 }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");
    const opacity = typeof args.opacity === "number" ? args.opacity : 1;
    const clamped = Math.max(0, Math.min(1, opacity));

    const image = sharp(Buffer.from(input.value)).ensureAlpha();
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    if (channels < 4) {
      return { type: "bytes", value: new Uint8Array(data) };
    }
    for (let i = 0; i < data.length; i += channels) {
      const alpha = data[i + 3] ?? 0;
      data[i + 3] = Math.round(alpha * clamped);
    }

    const output = await sharp(data, {
      raw: { width: info.width, height: info.height, channels }
    })
      .toFormat("png")
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
