import type { Operation } from "@cybermasterchef/core";

export const ditherImage: Operation = {
  id: "image.dither",
  name: "Dither Image",
  description: "Applies a monochrome dithering-like threshold to the image.",
  input: ["bytes"],
  output: "bytes",
  args: [
    {
      key: "threshold",
      label: "Threshold",
      type: "number",
      defaultValue: 128
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const threshold =
      typeof args.threshold === "number" ? Math.max(0, Math.min(255, args.threshold)) : 128;

    const output = await sharp(Buffer.from(input.value))
      .grayscale()
      .threshold(Math.floor(threshold))
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
