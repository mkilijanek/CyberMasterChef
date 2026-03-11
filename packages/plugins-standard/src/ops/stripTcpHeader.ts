import type { Operation } from "@cybermasterchef/core";

export const stripTcpHeader: Operation = {
  id: "network.stripTcpHeader",
  name: "Strip TCP Header",
  description: "Strips the TCP header and returns the segment payload bytes.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    if (bytes.length < 20) {
      throw new Error("TCP header requires at least 20 bytes");
    }
    const headerLengthBytes = ((bytes[12] ?? 0) >>> 4) * 4;
    if (headerLengthBytes < 20) {
      throw new Error("Invalid TCP header length");
    }
    if (bytes.length < headerLengthBytes) {
      throw new Error("TCP segment shorter than declared header length");
    }
    return { type: "bytes", value: bytes.slice(headerLengthBytes) };
  }
};
