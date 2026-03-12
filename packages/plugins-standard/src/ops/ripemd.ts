import type { Operation } from "@cybermasterchef/core";
import { ripemd160 } from "./ripemd160.js";

export const ripemd: Operation = {
  id: "hash.ripemd",
  name: "RIPEMD",
  description: "Computes RIPEMD-160 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: (ctx) => ripemd160.run(ctx)
};
