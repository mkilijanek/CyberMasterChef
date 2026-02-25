import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { csvToJson } from "../src/ops/csvToJson.js";
import { jsonToCsv } from "../src/ops/jsonToCsv.js";
import { yamlToJson } from "../src/ops/yamlToJson.js";
import { jsonToYaml } from "../src/ops/jsonToYaml.js";
import { cborEncode } from "../src/ops/cborEncode.js";
import { cborDecode } from "../src/ops/cborDecode.js";
import { bsonEncode } from "../src/ops/bsonEncode.js";
import { bsonDecode } from "../src/ops/bsonDecode.js";
import { avroEncode } from "../src/ops/avroEncode.js";
import { avroDecode } from "../src/ops/avroDecode.js";

describe("data format operations", () => {
  it("parses CSV into JSON with metadata", async () => {
    const registry = new InMemoryRegistry();
    registry.register(csvToJson);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.csvToJson" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "name,age\nalice,30" }
    });

    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    const value = out.output.value as { data: Array<Record<string, string>> };
    expect(value.data[0]).toEqual({ name: "alice", age: "30" });
  });

  it("serializes JSON to CSV", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonToCsv);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.jsonToCsv" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: [{ name: "alice", age: 30 }] }
    });

    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    const normalized = out.output.value.replace(/\r\n/g, "\n").trim();
    expect(normalized).toBe("name,age\nalice,30");
  });

  it("converts JSON to YAML and back", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonToYaml);
    registry.register(yamlToJson);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.jsonToYaml" }, { opId: "format.yamlToJson" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });

    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toEqual({ name: "alice", age: 30 });
  });

  it("round-trips CBOR encode/decode", async () => {
    const registry = new InMemoryRegistry();
    registry.register(cborEncode);
    registry.register(cborDecode);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.cborEncode" }, { opId: "format.cborDecode" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });

    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toEqual({ name: "alice", age: 30 });
  });

  it("round-trips BSON encode/decode", async () => {
    const registry = new InMemoryRegistry();
    registry.register(bsonEncode);
    registry.register(bsonDecode);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.bsonEncode" }, { opId: "format.bsonDecode" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });

    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    const value = out.output.value as { name: string; age: number };
    expect(value.name).toBe("alice");
    expect(value.age).toBe(30);
  });

  it("round-trips Avro encode/decode with schema", async () => {
    const registry = new InMemoryRegistry();
    registry.register(avroEncode);
    registry.register(avroDecode);
    const schema = JSON.stringify({
      type: "record",
      name: "Person",
      fields: [
        { name: "name", type: "string" },
        { name: "age", type: "int" }
      ]
    });
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "format.avroEncode", args: { schema } },
        { opId: "format.avroDecode", args: { schema } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });

    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toEqual({ name: "alice", age: 30 });
  });
});
