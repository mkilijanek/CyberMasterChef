import type { Operation } from "@cybermasterchef/core";
import { parseTcpHeaderOp } from "./parseTcpHeader.js";

export const parseTcp: Operation = {
  id: "network.parseTcp",
  name: "Parse TCP",
  description: "Parses a TCP segment header and returns normalized metadata.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: (ctx) => parseTcpHeaderOp.run(ctx)
};
