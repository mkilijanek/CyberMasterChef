import type { Operation } from "@cybermasterchef/core";

export const normaliseImage: Operation = {
  id: "image.normalise",
  name: "Normalise Image",
  description: "Normalises image contrast.",
  input: ["bytes"],
  output: "bytes",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { default: sharp } = await import("sharp");
    const output = await sharp(Buffer.from(input.value)).normalize().toBuffer();
    return { type: "bytes", value: new Uint8Array(output) };
  }
};
