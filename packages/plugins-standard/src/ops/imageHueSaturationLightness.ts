import type { Operation } from "@cybermasterchef/core";

export const imageHueSaturationLightness: Operation = {
  id: "image.hsl",
  name: "Image Hue/Saturation/Lightness",
  description: "Adjusts hue, saturation, and lightness of an image.",
  input: ["bytes"],
  output: "bytes",
  args: [
    { key: "hue", label: "Hue (degrees)", type: "number", defaultValue: 0 },
    { key: "saturation", label: "Saturation (-1 to 1)", type: "number", defaultValue: 0 },
    { key: "lightness", label: "Lightness (-1 to 1)", type: "number", defaultValue: 0 }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");

    const hue = typeof args.hue === "number" ? args.hue : 0;
    const saturation = typeof args.saturation === "number" ? args.saturation : 0;
    const lightness = typeof args.lightness === "number" ? args.lightness : 0;

    const output = await sharp(Buffer.from(input.value))
      .modulate({
        hue,
        saturation: 1 + saturation,
        brightness: 1 + lightness
      })
      .toBuffer();

    return { type: "bytes", value: new Uint8Array(output) };
  }
};
