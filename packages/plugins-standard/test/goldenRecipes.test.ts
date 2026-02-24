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
    name: "ISO to Unix and back",
    input: "1970-01-01T00:00:01.000Z",
    recipe: {
      version: 1,
      steps: [{ opId: "date.isoToUnix" }, { opId: "date.unixToIso" }]
    },
    expected: "1970-01-01T00:00:01.000Z"
  },
  {
    name: "JSON beautify and minify round-trip",
    input: "{\"a\":1,\"b\":[2,3]}",
    recipe: {
      version: 1,
      steps: [{ opId: "format.jsonBeautify" }, { opId: "format.jsonMinify" }]
    },
    expected: "{\"a\":1,\"b\":[2,3]}"
  },
  {
    name: "Extract printable strings from mixed payload",
    input: "A\u0000HELLO\u0001BYE!",
    recipe: {
      version: 1,
      steps: [{ opId: "forensic.extractStrings", args: { minLength: 3 } }]
    },
    expected: "HELLO\nBYE!"
  },
  {
    name: "Extract unique IPv4 addresses",
    input: "src=10.0.0.1 dst=172.16.0.2 invalid=999.1.1.1 src=10.0.0.1",
    recipe: {
      version: 1,
      steps: [{ opId: "network.extractIPs" }]
    },
    expected: "10.0.0.1\n172.16.0.2"
  },
  {
    name: "Extract URLs from text",
    input: "go https://a.example/x and http://b.example/y, then https://a.example/x",
    recipe: {
      version: 1,
      steps: [{ opId: "network.extractUrls" }]
    },
    expected: "https://a.example/x\nhttp://b.example/y"
  },
  {
    name: "Defang URL payload",
    input: "ping https://ioc.example.com/dropper.exe",
    recipe: {
      version: 1,
      steps: [{ opId: "network.defangUrls" }]
    },
    expected: "ping hxxps://ioc[.]example[.]com/dropper.exe"
  },
  {
    name: "Defang and fang URL round-trip",
    input: "https://ioc.example.com/path",
    recipe: {
      version: 1,
      steps: [{ opId: "network.defangUrls" }, { opId: "network.fangUrls" }]
    },
    expected: "https://ioc.example.com/path"
  },
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
  },
  {
    name: "Hex round-trip",
    input: "EdgeCase42",
    recipe: {
      version: 1,
      steps: [{ opId: "codec.toHex" }, { opId: "codec.fromHex" }]
    },
    expected: "EdgeCase42"
  },
  {
    name: "Non-empty lines after cleanup",
    input: "a\n\n b \n\n\nc",
    recipe: {
      version: 1,
      steps: [{ opId: "text.removeBlankLines" }, { opId: "text.countNonEmptyLines" }]
    },
    expected: "3"
  },
  {
    name: "CSV generation from words",
    input: "a b c",
    recipe: {
      version: 1,
      steps: [{ opId: "text.wordsToLines" }, { opId: "text.linesToCsv" }]
    },
    expected: "a,b,c"
  },
  {
    name: "Reverse line ordering",
    input: "line1\nline2\nline3",
    recipe: {
      version: 1,
      steps: [{ opId: "text.reverseLines" }]
    },
    expected: "line3\nline2\nline1"
  },
  {
    name: "Sort and unique lines chain",
    input: "z\na\nz\nb\na",
    recipe: {
      version: 1,
      steps: [{ opId: "text.uniqueLines" }, { opId: "text.sortLines" }]
    },
    expected: "a\nb\nz"
  },
  {
    name: "snake to camel flow",
    input: "hello_world_again",
    recipe: {
      version: 1,
      steps: [{ opId: "text.toCamelCase" }]
    },
    expected: "helloWorldAgain"
  },
  {
    name: "pascal to kebab flow",
    input: "CyberMasterChef",
    recipe: {
      version: 1,
      steps: [{ opId: "text.toKebabCase" }]
    },
    expected: "cybermasterchef"
  },
  {
    name: "strip accents and lowercase",
    input: "Żółć",
    recipe: {
      version: 1,
      steps: [{ opId: "text.stripAccents" }, { opId: "text.lowercase" }]
    },
    expected: "zołc"
  },
  {
    name: "mask digits in mixed text",
    input: "id=1234,port=80",
    recipe: {
      version: 1,
      steps: [{ opId: "text.maskDigits" }]
    },
    expected: "id=****,port=**"
  },
  {
    name: "count punctuation sample",
    input: "a,b;c:d",
    recipe: {
      version: 1,
      steps: [{ opId: "text.countCommas" }]
    },
    expected: "1"
  },
  {
    name: "remove control chars chain",
    input: "a\u0000b\u0007c",
    recipe: {
      version: 1,
      steps: [{ opId: "text.removeControlChars" }]
    },
    expected: "abc"
  },
  {
    name: "compact lines after trim",
    input: " aa \n\n bb \ncc ",
    recipe: {
      version: 1,
      steps: [{ opId: "text.compactLines" }]
    },
    expected: "aa bb cc"
  },
  {
    name: "rot13 twice restores input",
    input: "CyberMasterChef",
    recipe: {
      version: 1,
      steps: [{ opId: "text.rot13" }, { opId: "text.rot13" }]
    },
    expected: "CyberMasterChef"
  },
  {
    name: "normalize commas and split lines",
    input: "a,,,b,,c",
    recipe: {
      version: 1,
      steps: [{ opId: "text.normalizeCommas" }, { opId: "text.csvToLines" }]
    },
    expected: "a\nb\nc"
  },
  {
    name: "bracket surround then trim quotes",
    input: "abc",
    recipe: {
      version: 1,
      steps: [{ opId: "text.surroundQuotes" }, { opId: "text.trimQuotes" }]
    },
    expected: "abc"
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
