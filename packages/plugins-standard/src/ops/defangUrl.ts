import type { Operation } from "@cybermasterchef/core";
import { defangUrls } from "./defangUrls.js";

export const defangUrl: Operation = {
  id: "network.defangUrl",
  name: "Defang URL",
  description: "Defangs HTTP/HTTPS URLs by replacing protocol and host dots.",
  input: ["string"],
  output: "string",
  args: [],
  run: (ctx) => defangUrls.run(ctx)
};
