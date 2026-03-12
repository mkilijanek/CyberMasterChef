import type { Operation } from "@cybermasterchef/core";
import { fletcher32Checksum } from "./fletcher32.js";

export const fletcher32ChecksumAlias: Operation = {
  id: "hash.fletcher32Checksum",
  name: "Fletcher32 Checksum",
  description: "Computes Fletcher-32 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: (ctx) => fletcher32Checksum.run(ctx)
};
