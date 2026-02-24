import { describe, expect, it } from "vitest";
import {
  InMemoryRegistry,
  exportCyberChefRecipe,
  importCyberChefRecipe,
  runRecipe,
  type Recipe
} from "@cybermasterchef/core";
import { standardPlugin } from "../src/index.js";

type RoundTripCase = {
  name: string;
  input: string;
  recipe: Recipe;
};

const cases: RoundTripCase[] = [
  {
    name: "codec + reverse chain",
    input: "abc",
    recipe: {
      version: 1,
      steps: [{ opId: "codec.toHex" }, { opId: "codec.fromHex" }, { opId: "text.reverse" }]
    }
  },
  {
    name: "replace and case transforms",
    input: "  Aaa_BBB  ",
    recipe: {
      version: 1,
      steps: [
        { opId: "text.trim" },
        { opId: "text.lowercase" },
        { opId: "text.replace", args: { find: "_", replace: "-", all: true } },
        { opId: "text.uppercase" }
      ]
    }
  },
  {
    name: "url encode/decode chain",
    input: "a b+c",
    recipe: {
      version: 1,
      steps: [{ opId: "codec.urlEncode" }, { opId: "codec.urlDecode" }, { opId: "text.reverse" }]
    }
  }
];

describe("semantic round-trip parity", () => {
  for (const c of cases) {
    it(c.name, async () => {
      const registry = new InMemoryRegistry();
      standardPlugin.register(registry);

      const nativeRun = await runRecipe({
        registry,
        recipe: c.recipe,
        input: { type: "string", value: c.input }
      });

      const exported = exportCyberChefRecipe(c.recipe);
      const imported = importCyberChefRecipe(exported);
      const roundTripRun = await runRecipe({
        registry,
        recipe: imported.recipe,
        input: { type: "string", value: c.input }
      });

      expect(imported.warnings).toEqual([]);
      expect(roundTripRun.output).toEqual(nativeRun.output);
      expect(roundTripRun.trace.map((t) => t.opId)).toEqual(nativeRun.trace.map((t) => t.opId));
      expect(roundTripRun.trace.map((t) => t.outputType)).toEqual(
        nativeRun.trace.map((t) => t.outputType)
      );
    });
  }
});
