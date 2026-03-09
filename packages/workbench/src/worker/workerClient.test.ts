import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SandboxClient } from "./workerClient";
import type { WorkerResponse } from "./protocol";

type Handler = (ev: MessageEvent<WorkerResponse>) => void;

class MockWorker {
  public readonly posted: Array<{ payload: unknown; transferCount: number }> = [];
  public terminated = false;
  private readonly listeners = new Set<Handler>();

  addEventListener(_type: string, handler: Handler): void {
    this.listeners.add(handler);
  }

  removeEventListener(_type: string, handler: Handler): void {
    this.listeners.delete(handler);
  }

  postMessage(payload: unknown, transfer?: Transferable[]): void {
    this.posted.push({ payload, transferCount: transfer?.length ?? 0 });
  }

  terminate(): void {
    this.terminated = true;
  }

  emit(payload: WorkerResponse): void {
    for (const listener of this.listeners) {
      listener({ data: payload } as MessageEvent<WorkerResponse>);
    }
  }
}

describe("SandboxClient", () => {
  let worker: MockWorker;
  const cryptoWithUuid = Object.assign(Object.create(globalThis.crypto), {
    randomUUID: () => "run-1"
  });

  beforeEach(() => {
    worker = new MockWorker();
    class WorkerCtor {
      constructor() {
        return worker;
      }
    }
    vi.stubGlobal("Worker", WorkerCtor);
    vi.stubGlobal("crypto", cryptoWithUuid);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("initializes, bakes bytes payloads, cancels, and disposes", async () => {
    const client = new SandboxClient();
    const initPromise = client.init();
    worker.emit({ type: "ready" });
    await initPromise;

    const bakePromise = client.bake(
      { version: 1, steps: [] },
      { type: "bytes", value: new Uint8Array([1, 2, 3]) },
      { timeoutMs: 50 }
    );
    await Promise.resolve();

    expect(worker.posted.at(-1)?.transferCount).toBe(1);
    client.cancelActive();
    expect(worker.posted.at(-1)?.payload).toMatchObject({ type: "cancel", id: "run-1" });

    worker.emit({
      type: "result",
      id: "run-1",
      output: { type: "string", value: "ok" },
      trace: [],
      run: {
        runId: "run-1",
        startedAt: 0,
        endedAt: 1,
        durationMs: 1,
        stepDurationTotalMs: 0,
        stepDurationAvgMs: 0,
        slowestStep: null,
        recipeHash: "recipe",
        inputHash: "input"
      }
    });

    await expect(bakePromise).resolves.toMatchObject({
      output: { type: "string", value: "ok" }
    });

    client.dispose();
    expect(worker.terminated).toBe(true);
    expect(() => client.dispose()).not.toThrow();
  });

  it("rejects worker errors and disposed usage", async () => {
    const client = new SandboxClient();
    const initPromise = client.init();
    worker.emit({ type: "ready" });
    await initPromise;

    const bakePromise = client.bake(
      { version: 1, steps: [] },
      { type: "string", value: "hello" }
    );
    await Promise.resolve();
    worker.emit({ type: "error", id: "run-1", message: "boom" });

    await expect(bakePromise).rejects.toThrow("boom");

    client.dispose();
    await expect(client.init()).rejects.toThrow("SandboxClient is disposed");
    await expect(
      client.bake({ version: 1, steps: [] }, { type: "string", value: "x" })
    ).rejects.toThrow("SandboxClient is disposed");
  });
});
