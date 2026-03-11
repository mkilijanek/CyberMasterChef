import type { Operation } from "@cybermasterchef/core";
import { parseTcpHeader } from "./tcpHeaderUtils.js";

export const parseTcpHeaderOp: Operation = {
  id: "network.parseTcpHeader",
  name: "Parse TCP Header",
  description: "Parses a TCP segment header and returns normalized metadata.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "json", value: parseTcpHeader(bytes) };
  }
};
