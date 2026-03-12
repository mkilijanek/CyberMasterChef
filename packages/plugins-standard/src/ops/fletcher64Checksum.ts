import type { Operation } from "@cybermasterchef/core";
import { fletcher64Checksum } from "./fletcher64.js";

export const fletcher64ChecksumAlias: Operation = {
  id: "hash.fletcher64Checksum",
  name: "Fletcher64 Checksum",
  description: "Computes Fletcher-64 checksum. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: (ctx) => fletcher64Checksum.run(ctx)
};
