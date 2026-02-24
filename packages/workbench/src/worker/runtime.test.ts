import { describe, expect, it } from "vitest";
import type { DataValue, OperationRegistry, Recipe } from "@cybermasterchef/core";
import type { WorkerRequest, WorkerResponse } from "./protocol";
import { createWorkerRuntime } from "./runtime";

type Trace = Array<{ step: number; opId: string; inputType: string; outputType: string }>;

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeBakeRequest(id: string, timeoutMs?: number): WorkerRequest {
  const recipe: Recipe = { version: 1, steps: [{ opId: "text.reverse" }] };
  const input: DataValue = { type: "string", value: "abc" };
  return timeoutMs === undefined
    ? { type: "bake", id, recipe, input }
    : { type: "bake", id, recipe, input, timeoutMs };
}

describe("worker runtime protocol integration", () => {
  it("handles cancel by aborting active run and posting error", async () => {
    const messages: WorkerResponse[] = [];
    const started = deferred<void>();
    const runRecipe = async (args: {
      registry: OperationRegistry;
      recipe: Recipe;
      input: DataValue;
      signal?: AbortSignal;
    }) => {
      started.resolve();
      return await new Promise<{ output: DataValue; trace: Trace }>((resolve, reject) => {
        args.signal?.addEventListener("abort", () => reject(new Error("Aborted")));
        void resolve;
      });
    };
    const runtime = createWorkerRuntime({
      registry: {} as OperationRegistry,
      runRecipe,
      postMessage: (msg) => {
        messages.push(msg);
      },
      setTimeoutFn: (h, ms) => setTimeout(h, ms),
      clearTimeoutFn: (id) => clearTimeout(id)
    });

    const bakePromise = runtime.handle(makeBakeRequest("cancel-1"));
    await started.promise;
    await runtime.handle({ type: "cancel", id: "cancel-1" });
    await bakePromise;

    expect(messages).toContainEqual({
      type: "error",
      id: "cancel-1",
      message: "Aborted"
    });
  });

  it("times out run and posts error", async () => {
    const messages: WorkerResponse[] = [];
    const runRecipe = async (args: {
      registry: OperationRegistry;
      recipe: Recipe;
      input: DataValue;
      signal?: AbortSignal;
    }) =>
      await new Promise<{ output: DataValue; trace: Trace }>((resolve, reject) => {
        args.signal?.addEventListener("abort", () => reject(new Error("Aborted")));
        void resolve;
      });

    const runtime = createWorkerRuntime({
      registry: {} as OperationRegistry,
      runRecipe,
      postMessage: (msg) => {
        messages.push(msg);
      },
      setTimeoutFn: (h, ms) => setTimeout(h, ms),
      clearTimeoutFn: (id) => clearTimeout(id)
    });

    await runtime.handle(makeBakeRequest("timeout-1", 5));

    expect(messages).toContainEqual({
      type: "error",
      id: "timeout-1",
      message: "Aborted"
    });
  });

  it("handles race conditions and keeps request ids aligned with responses", async () => {
    const messages: WorkerResponse[] = [];
    const first = deferred<{ output: DataValue; trace: Trace }>();
    const second = deferred<{ output: DataValue; trace: Trace }>();

    const runRecipe = async (args: {
      registry: OperationRegistry;
      recipe: Recipe;
      input: DataValue;
      signal?: AbortSignal;
    }) => {
      const marker = args.input.type === "string" ? args.input.value : "";
      return marker === "first" ? await first.promise : await second.promise;
    };

    const runtime = createWorkerRuntime({
      registry: {} as OperationRegistry,
      runRecipe,
      postMessage: (msg) => {
        messages.push(msg);
      },
      setTimeoutFn: (h, ms) => setTimeout(h, ms),
      clearTimeoutFn: (id) => clearTimeout(id)
    });

    const recipe: Recipe = { version: 1, steps: [{ opId: "text.reverse" }] };
    const p1 = runtime.handle({
      type: "bake",
      id: "race-1",
      recipe,
      input: { type: "string", value: "first" }
    });
    const p2 = runtime.handle({
      type: "bake",
      id: "race-2",
      recipe,
      input: { type: "string", value: "second" }
    });

    second.resolve({
      output: { type: "string", value: "second-out" },
      trace: [{ step: 0, opId: "text.reverse", inputType: "string", outputType: "string" }]
    });
    first.resolve({
      output: { type: "string", value: "first-out" },
      trace: [{ step: 0, opId: "text.reverse", inputType: "string", outputType: "string" }]
    });
    await Promise.all([p1, p2]);

    expect(messages[0]).toMatchObject({ type: "result", id: "race-2" });
    expect(messages[1]).toMatchObject({ type: "result", id: "race-1" });
  });
});

