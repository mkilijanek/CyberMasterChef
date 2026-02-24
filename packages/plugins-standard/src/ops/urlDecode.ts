import type { Operation } from "@cybermasterchef/core";

export const urlDecode: Operation = {
  id: "codec.urlDecode",
  name: "URL Decode",
  description: "Decodes percent-encoded URL text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    try {
      return { type: "string", value: decodeURIComponent(input.value) };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`Invalid URL-encoded input: ${msg}`, { cause: e });
    }
  }
};
