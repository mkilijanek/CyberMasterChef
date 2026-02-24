import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { isoToUnix } from "../src/ops/isoToUnix.js";
import { unixToIso } from "../src/ops/unixToIso.js";
import { unixToWindowsFiletime } from "../src/ops/unixToWindowsFiletime.js";
import { windowsFiletimeToUnix } from "../src/ops/windowsFiletimeToUnix.js";
import { parseObjectIdTimestamp } from "../src/ops/parseObjectIdTimestamp.js";
import { extractUnixTimestamps } from "../src/ops/extractUnixTimestamps.js";
import { extractIsoTimestamps } from "../src/ops/extractIsoTimestamps.js";
import { isoToDateOnly } from "../src/ops/isoToDateOnly.js";
import { isoWeekday } from "../src/ops/isoWeekday.js";
import { parseUnixFilePermissions } from "../src/ops/parseUnixFilePermissions.js";

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

  it("extracts 10 and 13 digit Unix timestamp candidates", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractUnixTimestamps);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.extractUnixTimestamps" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "a=1700000000 b=1700000000123 c=123456789 d=1700000000" }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "1700000000\n1700000000123"
    });
  });

  it("extracts ISO-8601 UTC timestamps", async () => {
    const registry = new InMemoryRegistry();
    registry.register(extractIsoTimestamps);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.extractIsoTimestamps" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "a=2024-01-01T00:00:00Z b=2024-01-01T00:00:00.000Z c=invalid"
      }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "2024-01-01T00:00:00.000Z"
    });
  });

  it("converts ISO timestamp to date-only format", async () => {
    const registry = new InMemoryRegistry();
    registry.register(isoToDateOnly);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.isoToDateOnly" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "2024-02-03T04:05:06.000Z" }
    });
    expect(out.output).toEqual({ type: "string", value: "2024-02-03" });
  });

  it("resolves weekday name from ISO timestamp", async () => {
    const registry = new InMemoryRegistry();
    registry.register(isoWeekday);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.isoWeekday" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "2024-02-05T00:00:00.000Z" }
    });
    expect(out.output).toEqual({ type: "string", value: "Monday" });
  });

  it("parses UNIX permission mode into symbolic representation", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseUnixFilePermissions);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.parseUnixFilePermissions" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "0755" }
    });
    expect(out.output).toEqual({ type: "string", value: "rwxr-xr-x (755)" });
  });

  it("parses special UNIX permission bits", async () => {
    const registry = new InMemoryRegistry();
    registry.register(parseUnixFilePermissions);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "date.parseUnixFilePermissions", args: { includeNumeric: false } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "4755" }
    });
    expect(out.output).toEqual({ type: "string", value: "rwsr-xr-x" });
  });
});
