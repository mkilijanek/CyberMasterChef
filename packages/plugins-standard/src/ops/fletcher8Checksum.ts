import type { Operation } from "@cybermasterchef/core";
import { fletcher8Checksum } from "./fletcher8.js";

export const fletcher8ChecksumAlias: Operation = {
  id: "hash.fletcher8Checksum",
  name: "Fletcher8 Checksum",
  description: "Computes Fletcher-8 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: (ctx) => fletcher8Checksum.run(ctx)
};
