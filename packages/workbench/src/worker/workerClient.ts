import type { DataValue, Recipe } from "@cybermasterchef/core";
import type { WorkerRequest, WorkerResponse } from "./protocol";
import type { ExecutionClient } from "./clientTypes";

export class SandboxClient implements ExecutionClient {
  private readonly worker: Worker;
  private ready = false;
  private activeId: string | null = null;
  private disposed = false;
  private readonly pending = new Map<
    string,
    {
      resolve: (value: {
        output: DataValue;
        trace: Array<{ step: number; opId: string; inputType: string; outputType: string; durationMs: number }>;
        run: {
          runId: string;
          startedAt: number;
          endedAt: number;
          durationMs: number;
          stepDurationTotalMs: number;
          stepDurationAvgMs: number;
          slowestStep: { step: number; opId: string; durationMs: number } | null;
          recipeHash: string;
          inputHash: string;
        };
      }) => void;
      reject: (reason?: unknown) => void;
    }
  >();

  constructor() {
    this.worker = new Worker(new URL("./sandbox.worker.ts", import.meta.url), {
      type: "module"
    });
    this.worker.addEventListener("message", (ev: MessageEvent<WorkerResponse>) => {
      const msg = ev.data;
      if (msg.type === "ready") return;
      const handler = this.pending.get(msg.id);
      if (!handler) return;
      this.pending.delete(msg.id);
      if (this.activeId === msg.id) this.activeId = null;
      if (msg.type === "result") {
        handler.resolve({ output: msg.output, trace: msg.trace, run: msg.run });
      } else {
        handler.reject(new Error(msg.message));
      }
    });
  }

  async init(): Promise<void> {
    if (this.disposed) throw new Error("SandboxClient is disposed");
    if (this.ready) return;
    await new Promise<void>((resolve) => {
      const onMsg = (ev: MessageEvent<WorkerResponse>) => {
        if (ev.data.type === "ready") {
          this.worker.removeEventListener("message", onMsg);
          this.ready = true;
          resolve();
        }
      };
      this.worker.addEventListener("message", onMsg);
      const req: WorkerRequest = { type: "init" };
      this.worker.postMessage(req);
    });
  }

  async bake(
    recipe: Recipe,
    input: DataValue,
    opts?: { timeoutMs?: number; priority?: "normal" | "high" }
  ): Promise<{
    output: DataValue;
    trace: Array<{ step: number; opId: string; inputType: string; outputType: string; durationMs: number }>;
    run: {
      runId: string;
      startedAt: number;
      endedAt: number;
      durationMs: number;
      stepDurationTotalMs: number;
      stepDurationAvgMs: number;
      slowestStep: { step: number; opId: string; durationMs: number } | null;
      recipeHash: string;
      inputHash: string;
    };
  }> {
    if (this.disposed) throw new Error("SandboxClient is disposed");
    await this.init();
    const id = crypto.randomUUID();
    this.activeId = id;
    return await new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const req: WorkerRequest =
        opts?.timeoutMs === undefined
          ? { type: "bake", id, recipe, input }
          : { type: "bake", id, recipe, input, timeoutMs: opts.timeoutMs };
      if (input.type === "bytes") {
        this.worker.postMessage(req, [input.value.buffer]);
      } else {
        this.worker.postMessage(req);
      }
    });
  }

  cancelActive(): void {
    if (!this.activeId) return;
    const id = this.activeId;
    const req: WorkerRequest = { type: "cancel", id };
    this.worker.postMessage(req);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.terminate();
    for (const [, handler] of this.pending) {
      handler.reject(new Error("Sandbox client disposed"));
    }
    this.pending.clear();
    this.activeId = null;
    this.ready = false;
  }
}
