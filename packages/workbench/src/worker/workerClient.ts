import type { DataValue, Recipe } from "@cybermasterchef/core";
import type { WorkerRequest, WorkerResponse } from "./protocol";

export class SandboxClient {
  private readonly worker: Worker;
  private ready = false;

  constructor() {
    this.worker = new Worker(new URL("./sandbox.worker.ts", import.meta.url), {
      type: "module"
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
    input: DataValue
  ): Promise<{ output: DataValue; trace: Array<{ step: number; opId: string }> }> {
    await this.init();
    const id = crypto.randomUUID();
    return await new Promise((resolve, reject) => {
      const onMsg = (ev: MessageEvent<WorkerResponse>) => {
        const msg = ev.data;
        if (msg.type === "result" && msg.id === id) {
          this.worker.removeEventListener("message", onMsg);
          resolve({ output: msg.output, trace: msg.trace });
        }
        if (msg.type === "error" && msg.id === id) {
          this.worker.removeEventListener("message", onMsg);
          reject(new Error(msg.message));
        }
      };
      this.worker.addEventListener("message", onMsg);
      const req: WorkerRequest = { type: "bake", id, recipe, input };
      if (input.type === "bytes") {
        this.worker.postMessage(req, [input.value.buffer]);
      } else {
        this.worker.postMessage(req);
      }
    });
  }
}
