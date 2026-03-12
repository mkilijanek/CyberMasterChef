import type { Operation } from "@cybermasterchef/core";
import { loadSharp } from "./sharpLoader.js";

export const invertImage: Operation = {
  id: "image.invert",
  name: "Invert Image",
  description: "Inverts image colors.",
  input: ["bytes"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const sharp = await loadSharp();
    const output = await sharp(Buffer.from(input.value)).negate({ alpha: false }).toBuffer();
    return { type: "bytes", value: new Uint8Array(output) };
  }
};
