import type { Operation } from "@cybermasterchef/core";

function toBits(byte: number): string {
  return byte.toString(2).padStart(8, "0");
}

export const toBinary: Operation = {
  id: "codec.toBinary",
  name: "To Binary",
  description: "Encodes bytes or string to binary octets.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "delimiter",
      label: "Delimiter",
      type: "string",
      defaultValue: " "
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const delimiter = typeof args.delimiter === "string" ? args.delimiter : " ";
    return {
      type: "string",
      value: [...bytes].map((b) => toBits(b)).join(delimiter)
    };
  }
};
