import type { Operation } from "@cybermasterchef/core";
import { parseUdpHeaderOp } from "./parseUdpHeader.js";

export const parseUdp: Operation = {
  id: "network.parseUdp",
  name: "Parse UDP",
  description: "Parses a UDP datagram header and returns normalized metadata.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: (ctx) => parseUdpHeaderOp.run(ctx)
};
