/// <reference lib="webworker" />
import { runRecipe } from "@cybermasterchef/core";
import type { WorkerRequest, WorkerResponse } from "./protocol";
import { createRegistryWithBuiltins } from "../plugins/builtins";

// Defense-in-depth: disable network APIs inside the worker.
// Production hosting must also enforce CSP connect-src 'none'.
function disableNetworkApis(): void {
  const deny = (): never => {
    throw new Error("Network APIs are disabled in sandbox worker");
  };
  // @ts-ignore — intentional runtime override
  self.fetch = deny;
  // @ts-ignore — intentional runtime override
  self.XMLHttpRequest = function () {
    deny();
  } as unknown as typeof XMLHttpRequest;
  // @ts-ignore — intentional runtime override
  self.WebSocket = function () {
    deny();
  } as unknown as typeof WebSocket;
}

disableNetworkApis();

const registry = createRegistryWithBuiltins();

self.addEventListener("message", (ev: MessageEvent<WorkerRequest>) => {
  void handle(ev.data);
});

async function handle(msg: WorkerRequest): Promise<void> {
  if (msg.type === "init") {
    const out: WorkerResponse = { type: "ready" };
    self.postMessage(out);
    return;
  }

  if (msg.type === "bake") {
    try {
      const res = await runRecipe({
        registry,
        recipe: msg.recipe,
        input: msg.input
      });
      const out: WorkerResponse = {
        type: "result",
        id: msg.id,
        output: res.output,
        trace: res.trace.map((t) => ({ step: t.step, opId: t.opId }))
      };
      // Transfer bytes buffer to avoid copy
      if (res.output.type === "bytes") {
        self.postMessage(out, [res.output.value.buffer]);
      } else {
        self.postMessage(out);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const out: WorkerResponse = { type: "error", id: msg.id, message };
      self.postMessage(out);
    }
  }
}
