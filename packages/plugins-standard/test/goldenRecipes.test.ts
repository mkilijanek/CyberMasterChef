import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { standardPlugin } from "../src/index.js";

type GoldenCase = {
  name: string;
  input: string;
  recipe: Recipe;
  expected: string;
};

const goldenCases: GoldenCase[] = [
  {
    name: "Base64 round-trip",
    input: "CyberMasterChef",
    recipe: {
      version: 1,
      steps: [{ opId: "codec.toBase64" }, { opId: "codec.fromBase64" }]
    },
    expected: "CyberMasterChef"
  },
  {
    name: "URL encode + decode + reverse",
    input: "a b+c",
    recipe: {
      version: 1,
      steps: [
        { opId: "codec.urlEncode" },
        { opId: "codec.urlDecode" },
        { opId: "text.reverse" }
      ]
    },
    expected: "c+b a"
  },
  {
    name: "String to binary with delimiter",
    input: "AB",
    recipe: {
      version: 1,
      steps: [{ opId: "codec.toBinary", args: { delimiter: "-" } }]
    },
    expected: "01000001-01000010"
  },
  {
    name: "Trim + lowercase + snake_case",
    input: "  Hello   Cyber Master Chef  ",
    recipe: {
      version: 1,
      steps: [
        { opId: "text.trim" },
        { opId: "text.lowercase" },
        { opId: "text.toSnakeCase" }
      ]
    },
    expected: "hello_cyber_master_chef"
  },
  {
    name: "CSV <-> lines round-trip shape",
    input: "alpha\nbeta\ngamma",
    recipe: {
      version: 1,
      steps: [{ opId: "text.linesToCsv" }, { opId: "text.csvToLines" }]
    },
    expected: "alpha\nbeta\ngamma"
  },
  {
    name: "Normalize whitespace then title case",
    input: "  cyber   master\tchef ",
    recipe: {
      version: 1,
      steps: [{ opId: "text.normalizeWhitespace" }, { opId: "text.toTitleCase" }]
    },
    expected: "Cyber Master Chef"
  },
  {
    name: "Word counting chain",
    input: "a  bb   ccc",
    recipe: {
      version: 1,
      steps: [{ opId: "text.wordCount" }]
    },
    expected: "3"
  },
  {
    name: "Line counting chain",
    input: "one\ntwo\n\nthree",
    recipe: {
      version: 1,
      steps: [{ opId: "text.countNonEmptyLines" }]
    },
    expected: "3"
  },
  {
    name: "Reverse words",
    input: "one two three",
    recipe: {
      version: 1,
      steps: [{ opId: "text.reverseWords" }]
    },
    expected: "three two one"
  }
];

describe("golden recipes", () => {
  for (const c of goldenCases) {
    it(c.name, async () => {
      const registry = new InMemoryRegistry();
      standardPlugin.register(registry);
      const out = await runRecipe({
        registry,
        recipe: c.recipe,
        input: { type: "string", value: c.input }
      });

      if (out.output.type === "bytes") {
        expect(new TextDecoder().decode(out.output.value)).toBe(c.expected);
      } else {
        expect(String(out.output.value)).toBe(c.expected);
      }
    });
  }
});
