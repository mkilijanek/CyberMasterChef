import type { Operation } from "@cybermasterchef/core";

function normalizeAmount(value: unknown): number {
  const amount = Math.floor(typeof value === "number" ? value : 1);
  if (!Number.isFinite(amount) || amount < 0 || amount > 7) {
    throw new Error("Shift amount must be between 0 and 7");
  }
  return amount;
}

export const bitShiftLeft: Operation = {
  id: "bytes.bitShiftLeft",
  name: "Bit Shift Left",
  description: "Shifts each byte left by the selected amount.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [{ key: "amount", label: "Amount", type: "number", defaultValue: 1 }],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const amount = normalizeAmount(args.amount);
    const bytes = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return {
      type: "bytes",
      value: Uint8Array.from(bytes, (byte) => (byte << amount) & 0xff)
    };
  }
};
