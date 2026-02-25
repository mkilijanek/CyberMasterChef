import type { Operation } from "@cybermasterchef/core";

export const fromMessagePack: Operation = {
  id: "format.fromMessagePack",
  name: "From MessagePack",
  description: "Decodes MessagePack bytes into JSON.",
  input: ["bytes"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { decode } = await import("@msgpack/msgpack");
    try {
      const value = decode(input.value);
      return { type: "json", value };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to decode MessagePack input: ${reason}`, { cause: error });
    }
  }
};
