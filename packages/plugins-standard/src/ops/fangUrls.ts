import type { Operation } from "@cybermasterchef/core";

export const fangUrls: Operation = {
  id: "network.fangUrls",
  name: "Fang URLs",
  description: "Reverts common defanged URL markers back to standard URL form.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = input.value
      .replace(/\bhxxps:\/\//gi, "https://")
      .replace(/\bhxxp:\/\//gi, "http://")
      .replace(/\[\.\]/g, ".");
    return { type: "string", value };
  }
};
