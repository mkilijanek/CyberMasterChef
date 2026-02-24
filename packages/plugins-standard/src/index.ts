import type { Plugin, OperationRegistry } from "@cybermasterchef/core";
import { toBase64 } from "./ops/toBase64.js";
import { fromBase64 } from "./ops/fromBase64.js";
import { toHex } from "./ops/toHex.js";
import { fromHex } from "./ops/fromHex.js";
import { sha256 } from "./ops/sha256.js";

export const standardPlugin: Plugin = {
  pluginId: "plugins-standard",
  version: "0.1.0",
  register(registry: OperationRegistry): void {
    registry.register(toBase64);
    registry.register(fromBase64);
    registry.register(toHex);
    registry.register(fromHex);
    registry.register(sha256);
  }
};
