import type { Operation } from "@cybermasterchef/core";

function tcpIpChecksum(bytes: Uint8Array): number {
  let sum = 0;
  for (let index = 0; index < bytes.length; index += 2) {
    const word = (bytes[index]! << 8) | (bytes[index + 1] ?? 0);
    sum += word;
    while (sum > 0xffff) {
      sum = (sum & 0xffff) + (sum >>> 16);
    }
  }
  return (~sum) & 0xffff;
}

export const tcpIpChecksumOp: Operation = {
  id: "hash.tcpIpChecksum",
  name: "TCP/IP Checksum",
  description: "Computes the Internet checksum (RFC 1071). Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return {
      type: "string",
      value: tcpIpChecksum(bytes).toString(16).padStart(4, "0")
    };
  }
};
