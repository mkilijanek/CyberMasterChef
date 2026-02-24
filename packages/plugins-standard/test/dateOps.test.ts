import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { isoToUnix } from "../src/ops/isoToUnix.js";
import { unixToIso } from "../src/ops/unixToIso.js";
import { unixToWindowsFiletime } from "../src/ops/unixToWindowsFiletime.js";
import { windowsFiletimeToUnix } from "../src/ops/windowsFiletimeToUnix.js";
import { parseObjectIdTimestamp } from "../src/ops/parseObjectIdTimestamp.js";

describe("date operations", () => {
  it("converts ISO to Unix milliseconds", async () => {
    const registry = new InMemoryRegistry();
    registry.register(isoToUnix);
    const recipe: Recipe = { version: 1, steps: [{ opId: "date.isoToUnix" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "1970-01-01T00:00:01.500Z" }
    });
    expect(out.output).toEqual({ type: "string", value: "1500" });
  });

  it("converts Unix milliseconds to ISO", async () => {
    const registry = new InMemoryRegistry();
    registry.register(unixToIso);
    const recipe: Recipe = { version: 1, steps: [{ opId: "date.unixToIso" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "1500" }
    });
    expect(out.output).toEqual({ type: "string", value: "1970-01-01T00:00:01.500Z" });
  });

  it("converts Unix seconds to ISO with argument", async () => {
    const registry = new InMemoryRegistry();
    registry.register(unixToIso);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.unixToIso", args: { seconds: true } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "1" }
    });
    expect(out.output).toEqual({ type: "string", value: "1970-01-01T00:00:01.000Z" });
  });

  it("converts Unix milliseconds to Windows FILETIME", async () => {
    const registry = new InMemoryRegistry();
    registry.register(unixToWindowsFiletime);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.unixToWindowsFiletime" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "0" }
    });
    expect(out.output).toEqual({ type: "string", value: "116444736000000000" });
  });

  it("converts Windows FILETIME to Unix milliseconds", async () => {
    const registry = new InMemoryRegistry();
    registry.register(windowsFiletimeToUnix);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.windowsFiletimeToUnix" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "116444736000000000" }
    });
    expect(out.output).toEqual({ type: "string", value: "0" });
  });

  it("parses ObjectId timestamp to ISO", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseObjectIdTimestamp);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.parseObjectIdTimestamp" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "507f1f77bcf86cd799439011" }
    });
    expect(out.output).toEqual({ type: "string", value: "2012-10-17T21:13:27.000Z" });
  });
});
