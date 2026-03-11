import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe } from "@cybermasterchef/core";
import type { Recipe } from "@cybermasterchef/core";
import { alternatingCaps } from "../src/ops/alternatingCaps.js";
import { divide } from "../src/ops/divide.js";
import { multiply } from "../src/ops/multiply.js";
import { sum } from "../src/ops/sum.js";
import { subtract } from "../src/ops/subtract.js";
import { formatNumber, parseNumberList } from "../src/ops/numericListUtils.js";

describe("misc parity wave operations", () => {
  it("alternates caps while preserving non-letters", async () => {
    const registry = new InMemoryRegistry();
    registry.register(alternatingCaps);
    const recipe: Recipe = { version: 1, steps: [{ opId: "text.alternatingCaps" }] };

    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hello, WORLD! 123" }
    });

    expect(out.output).toEqual({ type: "string", value: "HeLlO, wOrLd! 123" });
  });

  it("runs arithmetic operations on delimiter-separated values", async () => {
    const registry = new InMemoryRegistry();
    registry.register(sum);
    registry.register(subtract);
    registry.register(multiply);
    registry.register(divide);

    const sumRecipe: Recipe = { version: 1, steps: [{ opId: "math.sum", args: { delimiter: "," } }] };
    const subtractRecipe: Recipe = { version: 1, steps: [{ opId: "math.subtract" }] };
    const multiplyRecipe: Recipe = { version: 1, steps: [{ opId: "math.multiply", args: { delimiter: "|" } }] };
    const divideRecipe: Recipe = { version: 1, steps: [{ opId: "math.divide" }] };

    expect(
      await runRecipe({ registry, recipe: sumRecipe, input: { type: "string", value: "1,2,3.5" } })
    ).toMatchObject({ output: { type: "string", value: "6.5" } });
    expect(
      await runRecipe({ registry, recipe: subtractRecipe, input: { type: "string", value: "10 3 2" } })
    ).toMatchObject({ output: { type: "string", value: "5" } });
    expect(
      await runRecipe({ registry, recipe: multiplyRecipe, input: { type: "string", value: "2|3|4" } })
    ).toMatchObject({ output: { type: "string", value: "24" } });
    expect(
      await runRecipe({ registry, recipe: divideRecipe, input: { type: "string", value: "20 5 2" } })
    ).toMatchObject({ output: { type: "string", value: "2" } });
    expect(
      await runRecipe({ registry, recipe: subtractRecipe, input: { type: "string", value: "7" } })
    ).toMatchObject({ output: { type: "string", value: "7" } });
    expect(
      await runRecipe({ registry, recipe: divideRecipe, input: { type: "string", value: "7" } })
    ).toMatchObject({ output: { type: "string", value: "7" } });
  });

  it("covers numeric helper branches and operation errors", () => {
    expect(parseNumberList("", ",")).toEqual([]);
    expect(parseNumberList("1||2", "|")).toEqual([1, 2]);
    expect(parseNumberList("1 2 3", "")).toEqual([1, 2, 3]);
    expect(() => parseNumberList("1,nope", ",")).toThrow("Invalid numeric token: nope");

    expect(formatNumber(4)).toBe("4");
    expect(formatNumber(2.5)).toBe("2.5");

    expect(sum.run({ input: { type: "string", value: "" }, args: {} })).toEqual({
      type: "string",
      value: "0"
    });
    expect(subtract.run({ input: { type: "string", value: "" }, args: {} })).toEqual({
      type: "string",
      value: "0"
    });
    expect(multiply.run({ input: { type: "string", value: "" }, args: {} })).toEqual({
      type: "string",
      value: "0"
    });
    expect(divide.run({ input: { type: "string", value: "" }, args: {} })).toEqual({
      type: "string",
      value: "0"
    });

    expect(() => alternatingCaps.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })).toThrow(
      "Expected string input"
    );
    expect(() => sum.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })).toThrow(
      "Expected string input"
    );
    expect(() => subtract.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })).toThrow(
      "Expected string input"
    );
    expect(() => multiply.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })).toThrow(
      "Expected string input"
    );
    expect(() => divide.run({ input: { type: "bytes", value: new Uint8Array() } as never, args: {} })).toThrow(
      "Expected string input"
    );
    expect(() => divide.run({ input: { type: "string", value: "8 0" }, args: {} })).toThrow(
      "Cannot divide by zero"
    );
  });
});
