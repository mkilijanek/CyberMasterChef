import type { Operation } from "@cybermasterchef/core";

export const bsonDecode: Operation = {
  id: "format.bsonDecode",
  name: "BSON Decode",
  description: "Decodes BSON bytes into JSON.",
  input: ["bytes"],
  output: "json",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes") throw new Error("Expected bytes input");
    const { deserialize } = await import("bson");
    try {
      const value = deserialize(Buffer.from(input.value)) as unknown;
      return { type: "json", value };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to decode BSON input: ${reason}`, { cause: error });
    }
  }
};
