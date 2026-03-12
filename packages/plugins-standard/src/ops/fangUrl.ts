import type { Operation } from "@cybermasterchef/core";
import { fangUrls } from "./fangUrls.js";

export const fangUrl: Operation = {
  id: "network.fangUrl",
  name: "Fang URL",
  description: "Reverts common defanged URL markers back to standard URL form.",
  input: ["string"],
  output: "string",
  args: [],
  run: (ctx) => fangUrls.run(ctx)
};
