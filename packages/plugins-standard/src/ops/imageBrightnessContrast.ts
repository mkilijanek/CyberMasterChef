import type { Operation } from "@cybermasterchef/core";

export const imageBrightnessContrast: Operation = {
  id: "image.brightnessContrast",
  name: "Image Brightness/Contrast",
  description: "Adjusts brightness and contrast of an image.",
  input: ["bytes"],
  output: "bytes",
  args: [
    { key: "brightness", label: "Brightness (-1 to 1)", type: "number", defaultValue: 0 },
    { key: "contrast", label: "Contrast (-1 to 1)", type: "number", defaultValue: 0 }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const brightness = typeof args.brightness === "number" ? args.brightness : 0;
    const contrast = typeof args.contrast === "number" ? args.contrast : 0;

    const output = await sharp(Buffer.from(input.value))
      .modulate({ brightness: 1 + brightness })
      .linear(1 + contrast, 0)
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
