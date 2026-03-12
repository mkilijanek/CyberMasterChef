import type { Operation } from "@cybermasterchef/core";
import { adler32Checksum } from "./adler32.js";

export const adler32ChecksumAlias: Operation = {
  id: "hash.adler32Checksum",
  name: "Adler32 Checksum",
  description: "Computes Adler-32 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: (ctx) => adler32Checksum.run(ctx)
};
