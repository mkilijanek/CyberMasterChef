import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { standardPlugin } from "../src/index.js";

type NegativeCase = {
  name: string;
  input: string;
  recipe: Recipe;
  expectedError?: string;
  expectedOutput?: string;
};

const cases: NegativeCase[] = [
  {
    name: "fromHex degrades malformed input deterministically",
    input: "zz",
    recipe: { version: 1, steps: [{ opId: "codec.fromHex" }] },
    expectedOutput: "\u0000"
  },
  {
    name: "fromBinary rejects non-binary chunks",
    input: "01012010",
    recipe: { version: 1, steps: [{ opId: "codec.fromBinary" }] },
    expectedError: "Invalid binary octet"
  },
  {
    name: "fromBase64 rejects malformed payload",
    input: "%%%@@@",
    recipe: { version: 1, steps: [{ opId: "codec.fromBase64" }] },
    expectedError: "Invalid character"
  },
  {
    name: "csvToLines drops empty cells",
    input: ",a,,b,",
    recipe: { version: 1, steps: [{ opId: "text.csvToLines" }] },
    expectedOutput: "a\nb"
  },
  {
    name: "wordsToLines keeps empty output for whitespace-only input",
    input: "   \t  ",
    recipe: { version: 1, steps: [{ opId: "text.wordsToLines" }] },
    expectedOutput: ""
  },
  {
    name: "countNonEmptyLines returns zero for blank payload",
    input: "\n\n  \n",
    recipe: { version: 1, steps: [{ opId: "text.countNonEmptyLines" }] },
    expectedOutput: "0"
  }
];

describe("golden negative and degradation cases", () => {
  for (const c of cases) {
    it(c.name, async () => {
      const registry = new InMemoryRegistry();
      standardPlugin.register(registry);
      if (c.expectedError) {
        await expect(
          runRecipe({
            registry,
            recipe: c.recipe,
            input: { type: "string", value: c.input }
          })
        ).rejects.toThrow(c.expectedError);
        return;
      }

      const out = await runRecipe({
        registry,
        recipe: c.recipe,
        input: { type: "string", value: c.input }
      });
      if (out.output.type === "bytes") {
        expect(new TextDecoder().decode(out.output.value)).toBe(c.expectedOutput);
      } else {
        expect(String(out.output.value)).toBe(c.expectedOutput);
      }
    });
  }
});
