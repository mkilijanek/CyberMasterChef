import type { Operation } from "@cybermasterchef/core";
import { fletcher16Checksum } from "./fletcher16.js";

export const fletcher16ChecksumAlias: Operation = {
  id: "hash.fletcher16Checksum",
  name: "Fletcher16 Checksum",
  description: "Computes Fletcher-16 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: (ctx) => fletcher16Checksum.run(ctx)
};
