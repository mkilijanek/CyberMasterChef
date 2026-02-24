import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { extractStrings } from "../src/ops/extractStrings.js";
import { extractEmails } from "../src/ops/extractEmails.js";
import { extractDomains } from "../src/ops/extractDomains.js";
import { extractMd5 } from "../src/ops/extractMd5.js";
import { extractSha256 } from "../src/ops/extractSha256.js";

describe("forensic operations", () => {
  it("extracts printable strings from bytes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractStrings);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "forensic.extractStrings", args: { minLength: 3 } }]
    };
    const bytes = new Uint8Array([0, 65, 66, 67, 68, 1, 120, 121, 122, 0, 49, 50, 51, 52]);
    const out = await runRecipe({ registry, recipe, input: { type: "bytes", value: bytes } });
    expect(out.output).toEqual({ type: "string", value: "ABCD\nxyz\n1234" });
  });

  it("extracts printable strings from string input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractStrings);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "forensic.extractStrings", args: { minLength: 3 } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "\u0000abc\u0000de\u0000WXYZ" }
    });
    expect(out.output).toEqual({ type: "string", value: "abc\nWXYZ" });
  });

  it("extracts unique emails from text input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractEmails);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "forensic.extractEmails" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "Admin@Example.com copy admin@example.com and sec.ops@test.io"
      }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "admin@example.com\nsec.ops@test.io"
    });
  });

  it("extracts unique domains from mixed text", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractDomains);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "forensic.extractDomains" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value:
          "https://Portal.EXAMPLE.com/a admin@example.com mirror.test.io portal.example.com"
      }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "portal.example.com\nexample.com\nmirror.test.io"
    });
  });

  it("extracts unique MD5 hashes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractMd5);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.extractMd5" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value:
          "d41d8cd98f00b204e9800998ecf8427e and D41D8CD98F00B204E9800998ECF8427E and zzzz"
      }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "d41d8cd98f00b204e9800998ecf8427e"
    });
  });

  it("extracts unique SHA-256 hashes", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractSha256);
    const recipe: Recipe = { version: 1, steps: [{ opId: "forensic.extractSha256" }] };
    const hash =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: `${hash} ${hash.toUpperCase()} not-a-hash`
      }
    });
    expect(out.output).toEqual({ type: "string", value: hash });
  });
});
