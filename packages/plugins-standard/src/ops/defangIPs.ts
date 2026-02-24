import type { Operation } from "@cybermasterchef/core";

const IPV4_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

export const defangIPs: Operation = {
  id: "network.defangIPs",
  name: "Defang IPs",
  description: "Defangs IPv4 addresses by replacing dots with [.] markers.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = input.value.replace(IPV4_REGEX, (candidate) =>
      candidate.split(".").join("[.]")
    );
    return { type: "string", value };
  }
};
