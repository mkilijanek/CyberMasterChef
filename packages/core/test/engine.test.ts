import { describe, expect, it } from "vitest";
import { InMemoryRegistry } from "../src/registry.js";
import { runRecipe } from "../src/engine.js";
import type { Recipe } from "../src/types.js";

describe("engine", () => {
  it("runs a simple two-step recipe (string -> bytes -> string)", async () => {
    const registry = new InMemoryRegistry();
    registry.register({
      id: "test.toBytes",
      name: "To bytes",
      description: "utf8 encode",
      input: ["string"],
      output: "bytes",
      args: [],
      run: ({ input }) => {
        if (input.type !== "string") throw new Error("bad input");
        return { type: "bytes", value: new TextEncoder().encode(input.value) };
      }
    });
    registry.register({
      id: "test.toString",
      name: "To string",
      description: "utf8 decode",
      input: ["bytes"],
      output: "string",
      args: [],
      run: ({ input }) => {
        if (input.type !== "bytes") throw new Error("bad input");
        return { type: "string", value: new TextDecoder().decode(input.value) };
      }
    });

    const recipe: Recipe = {
      version: 1,
      steps: [{ opId: "test.toBytes" }, { opId: "test.toString" }]
    };
    const result = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "hello" }
    });

    expect(result.output.type).toBe("string");
    expect(result.output.value).toBe("hello");
    expect(result.trace).toHaveLength(2);
    expect(result.trace[0]?.durationMs).toBeTypeOf("number");
    expect(result.trace[1]?.durationMs).toBeTypeOf("number");
    expect(result.meta.startedAt).toBeTypeOf("number");
    expect(result.meta.endedAt).toBeTypeOf("number");
    expect(result.meta.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.meta.endedAt).toBeGreaterThanOrEqual(result.meta.startedAt);
  });

  it("throws OperationNotFoundError for unknown opId", async () => {
    const registry = new InMemoryRegistry();
    const recipe: Recipe = { version: 1, steps: [{ opId: "does.not.exist" }] };
    await expect(
      runRecipe({ registry, recipe, input: { type: "string", value: "x" } })
    ).rejects.toThrow("does.not.exist");
  });

  it("returns input unchanged for empty recipe", async () => {
    const registry = new InMemoryRegistry();
    const recipe: Recipe = { version: 1, steps: [] };
    const result = await runRecipe({
      registry,
      recipe,
      input: { type: "string", value: "unchanged" }
    });
    expect(result.output).toEqual({ type: "string", value: "unchanged" });
    expect(result.trace).toHaveLength(0);
    expect(result.meta.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("aborts when signal is already aborted", async () => {
    const registry = new InMemoryRegistry();
    registry.register({
      id: "test.pass",
      name: "Pass-through",
      description: "returns input",
      input: ["string"],
      output: "string",
      args: [],
      run: ({ input }) => input
    });
    const recipe: Recipe = { version: 1, steps: [{ opId: "test.pass" }] };
    const controller = new AbortController();
    controller.abort();

    await expect(
      runRecipe({
        registry,
        recipe,
        input: { type: "string", value: "x" },
        signal: controller.signal
      })
    ).rejects.toThrow("Aborted");
  });
});
