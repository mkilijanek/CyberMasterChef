/// <reference lib="webworker" />
import { runRecipe } from "@cybermasterchef/core";
import type { WorkerRequest } from "./protocol";
import { createRegistryWithBuiltins } from "../plugins/builtins";
import { createWorkerRuntime } from "./runtime";

// Defense-in-depth: disable network APIs inside the worker.
// Production hosting must also enforce CSP connect-src 'none'.
function disableNetworkApis(): void {
  const deny = (): never => {
    throw new Error("Network APIs are disabled in sandbox worker");
  };
  const globalScope = self as unknown as typeof globalThis & {
    fetch: typeof fetch;
    XMLHttpRequest: typeof XMLHttpRequest;
    WebSocket: typeof WebSocket;
  };
  globalScope.fetch = deny as unknown as typeof fetch;
  globalScope.XMLHttpRequest = function () {
    deny();
  } as unknown as typeof XMLHttpRequest;
  globalScope.WebSocket = function () {
    deny();
  } as unknown as typeof WebSocket;
}

disableNetworkApis();

const registry = createRegistryWithBuiltins();
const runtime = createWorkerRuntime({
  registry,
  runRecipe,
  postMessage: (msg, transfer) => {
    if (transfer && transfer.length > 0) {
      self.postMessage(msg, transfer);
    } else {
      self.postMessage(msg);
    }
  },
  setTimeoutFn: (handler, ms) => self.setTimeout(handler, ms),
  clearTimeoutFn: (id) => self.clearTimeout(id)
});

self.addEventListener("message", (ev: MessageEvent<WorkerRequest>) => {
  void runtime.handle(ev.data);
});
