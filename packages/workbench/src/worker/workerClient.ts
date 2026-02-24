import type { DataValue, Recipe } from "@cybermasterchef/core";
import type { WorkerRequest, WorkerResponse } from "./protocol";

export class SandboxClient {
  private readonly worker: Worker;
  private ready = false;
  private activeId: string | null = null;
  private readonly pending = new Map<
    string,
    {
      resolve: (value: {
        output: DataValue;
        trace: Array<{ step: number; opId: string; inputType: string; outputType: string }>;
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
        handler.resolve({ output: msg.output, trace: msg.trace });
      } else {
        handler.reject(new Error(msg.message));
      }
    });
  }

  async init(): Promise<void> {
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
    opts?: { timeoutMs?: number }
  ): Promise<{
    output: DataValue;
    trace: Array<{ step: number; opId: string; inputType: string; outputType: string }>;
  }> {
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
}
