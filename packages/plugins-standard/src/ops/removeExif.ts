import type { Operation } from "@cybermasterchef/core";
import { loadSharp } from "./sharpLoader.js";

export const removeExif: Operation = {
  id: "image.removeExif",
  name: "Remove EXIF",
  description: "Strips EXIF metadata by re-encoding the image.",
  input: ["bytes"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const sharp = await loadSharp();
    const output = await sharp(Buffer.from(input.value)).toBuffer();
    return { type: "bytes", value: new Uint8Array(output) };
  }
};
