import type { Operation } from "@cybermasterchef/core";

export const fangIPs: Operation = {
  id: "network.fangIPs",
  name: "Fang IPs",
  description: "Reverts defanged IPv4 markers [.] back to regular dots.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = input.value.replace(/\b(\d{1,3})\[\.\](\d{1,3})\[\.\](\d{1,3})\[\.\](\d{1,3})\b/g, "$1.$2.$3.$4");
    return { type: "string", value };
  }
};
