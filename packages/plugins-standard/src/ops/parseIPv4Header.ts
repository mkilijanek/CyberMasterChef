import type { Operation } from "@cybermasterchef/core";
import { parseIpv4Header } from "./ipv4HeaderUtils.js";

export const parseIPv4Header: Operation = {
  id: "network.parseIPv4Header",
  name: "Parse IPv4 Header",
  description: "Parses an IPv4 packet header and returns normalized metadata.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "json", value: parseIpv4Header(bytes) };
  }
};
