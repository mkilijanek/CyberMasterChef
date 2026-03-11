import type { Operation } from "@cybermasterchef/core";

export const stripUdpHeader: Operation = {
  id: "network.stripUdpHeader",
  name: "Strip UDP Header",
  description: "Strips the UDP header and returns the datagram payload bytes.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    if (bytes.length < 8) {
      throw new Error("UDP header requires at least 8 bytes");
    }
    const udpLength = ((bytes[4] ?? 0) << 8) | (bytes[5] ?? 0);
    if (udpLength !== 0 && udpLength < 8) {
      throw new Error("Invalid UDP length");
    }
    const end = udpLength === 0 ? bytes.length : Math.min(udpLength, bytes.length);
    return { type: "bytes", value: bytes.slice(8, end) };
  }
};
