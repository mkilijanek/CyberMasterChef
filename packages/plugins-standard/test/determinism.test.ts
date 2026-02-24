import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type DataValue, type Recipe } from "@cybermasterchef/core";
import { standardPlugin } from "../src/index.js";

type DeterminismCase = {
  name: string;
  recipe: Recipe;
  input: DataValue;
};

const cases: DeterminismCase[] = [
  {
    name: "string transform chain",
    recipe: {
      version: 1,
      steps: [
        { opId: "text.trim" },
        { opId: "text.lowercase" },
        { opId: "text.toSnakeCase" },
        { opId: "text.reverse" }
      ]
    },
    input: { type: "string", value: "  Cyber Master Chef  " }
  },
  {
    name: "codec round-trip chain",
    recipe: {
      version: 1,
      steps: [
        { opId: "codec.toBase64" },
        { opId: "codec.fromBase64" },
        { opId: "codec.toHex" },
        { opId: "codec.fromHex" }
      ]
    },
    input: { type: "string", value: "Determinism-123" }
  }
];

describe("determinism", () => {
  for (const c of cases) {
    it(c.name, async () => {
      const registry = new InMemoryRegistry();
      standardPlugin.register(registry);

      const r1 = await runRecipe({ registry, recipe: c.recipe, input: c.input });
      const r2 = await runRecipe({ registry, recipe: c.recipe, input: c.input });
      const r3 = await runRecipe({ registry, recipe: c.recipe, input: c.input });
      const stableTrace = (trace: typeof r1.trace) =>
        trace.map((step) => ({
          step: step.step,
          opId: step.opId,
          inputType: step.inputType,
          outputType: step.outputType
        }));

      expect(r2.output).toEqual(r1.output);
      expect(r3.output).toEqual(r1.output);
      expect(stableTrace(r2.trace)).toEqual(stableTrace(r1.trace));
      expect(stableTrace(r3.trace)).toEqual(stableTrace(r1.trace));
    });
  }
});
