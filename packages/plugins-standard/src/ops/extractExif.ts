import type { Operation } from "@cybermasterchef/core";

export const extractExif: Operation = {
  id: "image.extractExif",
  name: "Extract EXIF",
  description: "Extracts EXIF metadata from image bytes.",
  input: ["bytes"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");
    const exifReader = (await import("exif-reader")) as {
      default: (buffer: Buffer) => Record<string, unknown>;
    };

    const meta = await sharp(Buffer.from(input.value)).metadata();
    if (!meta.exif) {
      return { type: "json", value: null };
    }

    const parsed = exifReader.default(Buffer.from(meta.exif));
    return { type: "json", value: parsed };
  }
};
