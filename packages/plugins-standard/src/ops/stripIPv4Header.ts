import type { Operation } from "@cybermasterchef/core";
import { parseIpv4Header } from "./ipv4HeaderUtils.js";

export const stripIPv4Header: Operation = {
  id: "network.stripIPv4Header",
  name: "Strip IPv4 Header",
  description: "Strips the IPv4 header and returns the packet payload bytes.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const parsed = parseIpv4Header(bytes);
    const packetEnd = Math.min(parsed.totalLength, bytes.length);
    return { type: "bytes", value: bytes.slice(parsed.headerLengthBytes, packetEnd) };
  }
};
