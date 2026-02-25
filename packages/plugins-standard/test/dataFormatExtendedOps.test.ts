import { describe, expect, it } from "vitest";
import { InMemoryRegistry, runRecipe, type Recipe } from "@cybermasterchef/core";
import { amfEncode } from "../src/ops/amfEncode.js";
import { amfDecode } from "../src/ops/amfDecode.js";
import { avroEncode } from "../src/ops/avroEncode.js";
import { avroToJson } from "../src/ops/avroToJson.js";
import { bsonSerialise } from "../src/ops/bsonSerialise.js";
import { bsonDecode } from "../src/ops/bsonDecode.js";
import { toTable } from "../src/ops/toTable.js";
import { toHtmlEntity } from "../src/ops/toHtmlEntity.js";
import { fromHtmlEntity } from "../src/ops/fromHtmlEntity.js";
import { toMessagePack } from "../src/ops/toMessagePack.js";
import { fromMessagePack } from "../src/ops/fromMessagePack.js";
import { toQuotedPrintable } from "../src/ops/toQuotedPrintable.js";
import { fromQuotedPrintable } from "../src/ops/fromQuotedPrintable.js";
import { htmlToTextOp } from "../src/ops/htmlToText.js";
import { jsonataQuery } from "../src/ops/jsonataQuery.js";
import { xmlBeautify } from "../src/ops/xmlBeautify.js";
import { xmlMinify } from "../src/ops/xmlMinify.js";
import { protobufEncode } from "../src/ops/protobufEncode.js";
import { protobufDecode } from "../src/ops/protobufDecode.js";
import { stripHtmlTags } from "../src/ops/stripHtmlTags.js";
import { toHexdump } from "../src/ops/toHexdump.js";
import { fromHexdump } from "../src/ops/fromHexdump.js";

describe("data format extended operations", () => {
  it("round-trips AMF encoding", async () => {
    const registry = new InMemoryRegistry();
    registry.register(amfEncode);
    registry.register(amfDecode);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "format.amfEncode", args: { version: "AMF0" } },
        { opId: "format.amfDecode", args: { version: "AMF0" } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({ name: "alice", age: 30 });
  });

  it("decodes Avro to JSON", async () => {
    const registry = new InMemoryRegistry();
    registry.register(avroEncode);
    registry.register(avroToJson);
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
        { opId: "format.avroToJson", args: { schema } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });
    expect(out.output).toEqual({ type: "json", value: { name: "alice", age: 30 } });
  });

  it("serialises BSON", async () => {
    const registry = new InMemoryRegistry();
    registry.register(bsonSerialise);
    registry.register(bsonDecode);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "format.bsonSerialise" },
        { opId: "format.bsonDecode" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({ name: "alice", age: 30 });
  });

  it("formats CSV to table", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toTable);
    const recipe: Recipe = { version: 1, steps: [{ opId: "format.toTable" }] };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "name,age\nalice,30" }
    });
    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    expect(out.output.value.split("\n").length).toBe(2);
  });

  it("encodes and decodes HTML entities", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toHtmlEntity);
    registry.register(fromHtmlEntity);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "format.toHtmlEntity" },
        { opId: "format.fromHtmlEntity" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "<div>" }
    });
    expect(out.output).toEqual({ type: "string", value: "<div>" });
  });

  it("round-trips MessagePack", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toMessagePack);
    registry.register(fromMessagePack);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "format.toMessagePack" },
        { opId: "format.fromMessagePack" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });
    expect(out.output).toEqual({ type: "json", value: { name: "alice", age: 30 } });
  });

  it("encodes and decodes quoted-printable", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toQuotedPrintable);
    registry.register(fromQuotedPrintable);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "format.toQuotedPrintable" },
        { opId: "format.fromQuotedPrintable" }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hello=world" }
    });
    expect(out.output).toEqual({ type: "string", value: "hello=world" });
  });

  it("converts HTML to text and strips tags", async () => {
    const registry = new InMemoryRegistry();
    registry.register(htmlToTextOp);
    registry.register(stripHtmlTags);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.htmlToText" }, { opId: "format.stripHtmlTags" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "<p>Hello <strong>world</strong></p>" }
    });
    expect(out.output.type).toBe("string");
  });

  it("strips nested/reintroduced script tags safely", async () => {
    const registry = new InMemoryRegistry();
    registry.register(stripHtmlTags);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.stripHtmlTags" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: {
        type: "string",
        value: "<scrip<script>is removed</script>t>alert(123)</script>"
      }
    });
    expect(out.output.type).toBe("string");
    if (out.output.type !== "string") return;
    expect(out.output.value.toLowerCase()).not.toContain("<script");
    expect(out.output.value).not.toContain("<");
  });

  it("runs Jsonata queries", async () => {
    const registry = new InMemoryRegistry();
    registry.register(jsonataQuery);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.jsonataQuery", args: { expression: "$.name" } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });
    expect(out.output).toEqual({ type: "json", value: "alice" });
  });

  it("beautifies and minifies XML", async () => {
    const registry = new InMemoryRegistry();
    registry.register(xmlBeautify);
    registry.register(xmlMinify);
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "format.xmlBeautify", args: { indent: 2 } },
        { opId: "format.xmlMinify", args: { preserveComments: true } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "<root><item>1</item></root>" }
    });
    expect(out.output).toEqual({ type: "string", value: "<root><item>1</item></root>" });
  });

  it("removes reintroduced XML comments when preserveComments=false", async () => {
    const registry = new InMemoryRegistry();
    registry.register(xmlMinify);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.xmlMinify", args: { preserveComments: false } }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "<!<!--- comment --->>" }
    });
    expect(out.output).toEqual({ type: "string", value: "<!>" });
  });

  it("encodes and decodes protobuf", async () => {
    const registry = new InMemoryRegistry();
    registry.register(protobufEncode);
    registry.register(protobufDecode);
    const schema = `syntax = "proto3"; message Person { string name = 1; int32 age = 2; }`;
    const recipe: Recipe = {
      version: 1,
      steps: [
        { opId: "format.protobufEncode", args: { schema, messageType: "Person" } },
        { opId: "format.protobufDecode", args: { schema, messageType: "Person" } }
      ]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "json", value: { name: "alice", age: 30 } }
    });
    expect(out.output.type).toBe("json");
    if (out.output.type !== "json") return;
    expect(out.output.value).toMatchObject({ name: "alice", age: 30 });
  });

  it("round-trips hexdump", async () => {
    const registry = new InMemoryRegistry();
    registry.register(toHexdump);
    registry.register(fromHexdump);
    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "format.toHexdump" }, { opId: "format.fromHexdump" }]
    };
    const out = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hello" }
    });
    expect(out.output.type).toBe("bytes");
    if (out.output.type !== "bytes") return;
    expect(new TextDecoder().decode(out.output.value)).toBe("hello");
  });
});
