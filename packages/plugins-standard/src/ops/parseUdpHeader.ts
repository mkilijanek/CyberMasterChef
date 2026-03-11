import type { Operation } from "@cybermasterchef/core";
import { parseUdpHeader } from "./udpHeaderUtils.js";

export const parseUdpHeaderOp: Operation = {
  id: "network.parseUdpHeader",
  name: "Parse UDP Header",
  description: "Parses a UDP datagram header and returns normalized metadata.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "json", value: parseUdpHeader(bytes) };
  }
};
