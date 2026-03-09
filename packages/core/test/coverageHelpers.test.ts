import { describe, expect, it } from "vitest";
import {
  ConversionError,
  EngineError,
  InMemoryRegistry,
  OperationJsonParseError,
  OperationNotFoundError,
  OperationRuntimeError,
  concatBytes,
  runRecipe,
  utf8ToBytes,
  bytesToUtf8
} from "../src/index.js";
import type { Operation, Recipe } from "../src/index.js";

describe("coverage helpers", () => {
  it("covers registry ordering and duplicate protection", () => {
    const registry = new InMemoryRegistry();
    const beta: Operation = {
      id: "b",
      name: "Beta",
      description: "beta",
      input: ["string"],
      output: "string",
      args: [],
      run: ({ input }) => input
    };
    const alpha: Operation = {
      id: "a",
      name: "Alpha",
      description: "alpha",
      input: ["string"],
      output: "string",
      args: [],
      run: ({ input }) => input
    };

    registry.register(beta);
    registry.register(alpha);

    expect(registry.get("a")).toBe(alpha);
    expect(registry.list().map((op) => op.name)).toEqual(["Alpha", "Beta"]);
    expect(() => registry.register(alpha)).toThrow("Duplicate operation id: a");
  });

  it("covers bytes helpers", () => {
    const hello = utf8ToBytes("hello");
    const world = utf8ToBytes(" world");

    expect(bytesToUtf8(hello)).toBe("hello");
    expect(bytesToUtf8(concatBytes([hello, world]))).toBe("hello world");
    expect(concatBytes([])).toEqual(new Uint8Array(0));
  });

  it("covers error classes", () => {
    const engine = new EngineError("X", "broken");
    const missing = new OperationNotFoundError("demo.op");
    const runtime = new OperationRuntimeError("demo.op", "failed");
    const json = new OperationJsonParseError("demo.op", "Invalid JSON input", "detail");
    const conversion = new ConversionError("string", "bytes");

    expect(engine).toMatchObject({ name: "EngineError", code: "X", message: "broken" });
    expect(missing).toMatchObject({
      name: "OperationNotFoundError",
      code: "OP_NOT_FOUND",
      message: "Operation not found: demo.op"
    });
    expect(runtime).toMatchObject({
      name: "OperationRuntimeError",
      code: "OP_RUNTIME_ERROR",
      opId: "demo.op"
    });
    expect(json).toMatchObject({
      name: "OperationJsonParseError",
      code: "JSON_PARSE_ERROR",
      opId: "demo.op",
      detail: "detail"
    });
    expect(conversion).toMatchObject({
      name: "ConversionError",
      code: "CONVERSION_ERROR",
      message: "Cannot convert from string to bytes"
    });
  });

  it("covers engine abort path", async () => {
    const registry = new InMemoryRegistry();
    registry.register({
      id: "text.echo",
      name: "Echo",
      description: "Echo",
      input: ["string"],
      output: "string",
      args: [],
      run: ({ input }) => input
    });
    const controller = new AbortController();
    controller.abort();
    const recipe: Recipe = { version: 1, steps: [{ opId: "text.echo" }] };

    await expect(
      runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "hello" },
        signal: controller.signal
      })
    ).rejects.toMatchObject({
      name: "OperationRuntimeError",
      opId: "engine",
      message: "Aborted"
    });
  });
});
