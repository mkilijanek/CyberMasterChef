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
    name: "Unix epoch to Windows FILETIME",
    input: "0",
    recipe: {
      version: 1,
      steps: [{ opId: "date.unixToWindowsFiletime" }]
    },
    expected: "116444736000000000"
  },
  {
    name: "Unix FILETIME round-trip",
    input: "1500",
    recipe: {
      version: 1,
      steps: [
        { opId: "date.unixToWindowsFiletime" },
        { opId: "date.windowsFiletimeToUnix" }
      ]
    },
    expected: "1500"
  },
  {
    name: "Parse ObjectId timestamp",
    input: "507f1f77bcf86cd799439011",
    recipe: {
      version: 1,
      steps: [{ opId: "date.parseObjectIdTimestamp" }]
    },
    expected: "2012-10-17T21:13:27.000Z"
  },
  {
    name: "Extract emails from mixed input",
    input: "contact: alice@example.com, ALICE@example.com, bob@test.org",
    recipe: {
      version: 1,
      steps: [{ opId: "forensic.extractEmails" }]
    },
    expected: "alice@example.com\nbob@test.org"
  },
  {
    name: "Extract domains from URL and email text",
    input: "hxxps://ignore x https://a.example.com and sec@b.test.org and A.EXAMPLE.COM",
    recipe: {
      version: 1,
      steps: [{ opId: "forensic.extractDomains" }]
    },
    expected: "a.example.com\nb.test.org"
  },
  {
    name: "Sort JSON keys recursively",
    input: "{\"z\":1,\"a\":{\"k\":2,\"b\":3}}",
    recipe: {
      version: 1,
      steps: [{ opId: "format.jsonSortKeys" }]
    },
    expected: "{\"a\":{\"b\":3,\"k\":2},\"z\":1}"
  },
  {
    name: "Extract nested JSON key paths",
    input: "{\"user\":{\"id\":1,\"roles\":[{\"name\":\"admin\"}]}}",
    recipe: {
      version: 1,
      steps: [{ opId: "format.jsonExtractKeys" }]
    },
    expected: "user\nuser.id\nuser.roles\nuser.roles[0]\nuser.roles[0].name"
  },
  {
    name: "Extract MD5 IOCs",
    input: "hash=d41d8cd98f00b204e9800998ecf8427e dup=D41D8CD98F00B204E9800998ECF8427E",
    recipe: {
      version: 1,
      steps: [{ opId: "forensic.extractMd5" }]
    },
    expected: "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    name: "Extract SHA-256 IOCs",
    input: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 duplicate",
    recipe: {
      version: 1,
      steps: [{ opId: "forensic.extractSha256" }]
    },
    expected: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    name: "Extract Unix timestamp candidates",
    input: "start=1700000000 end=1700000000123 invalid=1234",
    recipe: {
      version: 1,
      steps: [{ opId: "date.extractUnixTimestamps" }]
    },
    expected: "1700000000\n1700000000123"
  },
  {
    name: "Extract ISO timestamps",
    input: "x=2025-01-02T03:04:05Z y=2025-01-02T03:04:05.000Z",
    recipe: {
      version: 1,
      steps: [{ opId: "date.extractIsoTimestamps" }]
    },
    expected: "2025-01-02T03:04:05.000Z"
  },
  {
    name: "Extract IPv6 candidates",
    input: "src=2001:db8:0:0:0:ff00:42:8329 and src=2001:db8:0:0:0:ff00:42:8329",
    recipe: {
      version: 1,
      steps: [{ opId: "network.extractIPv6" }]
    },
    expected: "2001:db8:0:0:0:ff00:42:8329"
  },
  {
    name: "Defang IPv4 addresses",
    input: "conn 10.10.10.10 -> 8.8.8.8",
    recipe: {
      version: 1,
      steps: [{ opId: "network.defangIPs" }]
    },
    expected: "conn 10[.]10[.]10[.]10 -> 8[.]8[.]8[.]8"
  },
  {
    name: "Defang/fang IPv4 round-trip",
    input: "src 1.2.3.4 dst 8.8.8.8",
    recipe: {
      version: 1,
      steps: [{ opId: "network.defangIPs" }, { opId: "network.fangIPs" }]
    },
    expected: "src 1.2.3.4 dst 8.8.8.8"
  },
  {
    name: "Extract SHA-1 IOCs",
    input: "sha1=da39a3ee5e6b4b0d3255bfef95601890afd80709",
    recipe: {
      version: 1,
      steps: [{ opId: "forensic.extractSha1" }]
    },
    expected: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
  },
  {
    name: "Extract SHA-512 IOCs",
    input:
      "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
    recipe: {
      version: 1,
      steps: [{ opId: "forensic.extractSha512" }]
    },
    expected:
      "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"
  },
  {
    name: "Extract JWT candidates",
    input:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
    recipe: {
      version: 1,
      steps: [{ opId: "forensic.extractJwt" }]
    },
    expected:
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
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
