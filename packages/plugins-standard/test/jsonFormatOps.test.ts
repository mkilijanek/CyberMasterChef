import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { jsonMinify } from "../src/ops/jsonMinify.js";
import { jsonBeautify } from "../src/ops/jsonBeautify.js";
import { jsonSortKeys } from "../src/ops/jsonSortKeys.js";
import { jsonExtractKeys } from "../src/ops/jsonExtractKeys.js";
import { jsonArrayLength } from "../src/ops/jsonArrayLength.js";
import { jsonStringValues } from "../src/ops/jsonStringValues.js";
import { jsonNumberValues } from "../src/ops/jsonNumberValues.js";

describe("json format operations", () => {
  it("minifies JSON payload", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonMinify);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.jsonMinify" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: '{\n  "a": 1,\n  "b": [1,2]\n}' }
    });
    expect(out.output).toEqual({ type: "string", value: '{"a":1,"b":[1,2]}' });
  });

  it("beautifies JSON payload", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonBeautify);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.jsonBeautify", args: { indent: 2 } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: '{"a":1,"b":[1,2]}' }
    });
    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    expect(out.output.value.includes("\n  \"a\"")).toBe(true);
  });

  it("rejects invalid JSON input", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonMinify);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.jsonMinify" }] };
    await expect(
      runRecipe({ registry, recipe, input: { type: "string", value: "{not-json}" } })
    ).rejects.toThrow("Invalid JSON input");
  });

  it("sorts keys recursively in JSON objects", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonSortKeys);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.jsonSortKeys" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: '{"b":1,"a":{"d":2,"c":3}}' }
    });
    expect(out.output).toEqual({ type: "string", value: '{"a":{"c":3,"d":2},"b":1}' });
  });

  it("extracts nested key paths from JSON payload", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonExtractKeys);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.jsonExtractKeys" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: '{"a":{"b":[{"c":1}]}}' }
    });
    expect(out.output).toEqual({
      type: "string",
      value: "a\na.b\na.b[0]\na.b[0].c"
    });
  });

  it("returns JSON array length for nested path", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonArrayLength);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.jsonArrayLength", args: { path: "items" } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: '{"items":[1,2,3]}' }
    });
    expect(out.output).toEqual({ type: "string", value: "3" });
  });

  it("extracts all nested JSON string values", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonStringValues);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.jsonStringValues" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: '{"a":"x","b":[1,{"c":"y"}],"d":"z"}' }
    });
    expect(out.output).toEqual({ type: "string", value: "x\ny\nz" });
  });

  it("extracts all nested JSON number values", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonNumberValues);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.jsonNumberValues" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: '{"a":1,"b":[2,{"c":3}],"d":"x"}' }
    });
    expect(out.output).toEqual({ type: "string", value: "1\n2\n3" });
  });
});
