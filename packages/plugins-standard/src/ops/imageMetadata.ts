import type { Operation } from "@cybermasterchef/core";

export const imageMetadata: Operation = {
  id: "image.metadata",
  name: "Image Metadata",
  description: "Extracts width, height, and format metadata from image bytes.",
  input: ["bytes"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");
    const meta = await sharp(Buffer.from(input.value)).metadata();

    return {
      type: "json",
      value: {
        width: meta.width ?? null,
        height: meta.height ?? null,
        format: meta.format ?? null,
        size: meta.size ?? null,
        space: meta.space ?? null,
        channels: meta.channels ?? null,
        hasAlpha: meta.hasAlpha ?? null,
        density: meta.density ?? null
      }
    };
  }
};
