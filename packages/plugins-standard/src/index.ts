import type { Plugin, OperationRegistry } from "@cybermasterchef/core";
import { toBase64 } from "./ops/toBase64.js";
import { fromBase64 } from "./ops/fromBase64.js";
import { toHex } from "./ops/toHex.js";
import { fromHex } from "./ops/fromHex.js";
import { sha256 } from "./ops/sha256.js";
import { toBinary } from "./ops/toBinary.js";
import { fromBinary } from "./ops/fromBinary.js";
import { urlEncode } from "./ops/urlEncode.js";
import { urlDecode } from "./ops/urlDecode.js";
import { reverse } from "./ops/reverse.js";
import { lowercase } from "./ops/lowercase.js";
import { uppercase } from "./ops/uppercase.js";
import { trim } from "./ops/trim.js";
import { prepend } from "./ops/prepend.js";
import { append } from "./ops/append.js";

export const standardPlugin: Plugin = {
  pluginId: "plugins-standard",
  version: "0.1.0",
  register(registry: OperationRegistry): void {
    registry.register(toBase64);
    registry.register(fromBase64);
    registry.register(toHex);
    registry.register(fromHex);
    registry.register(toBinary);
    registry.register(fromBinary);
    registry.register(urlEncode);
    registry.register(urlDecode);
    registry.register(reverse);
    registry.register(lowercase);
    registry.register(uppercase);
    registry.register(trim);
    registry.register(prepend);
    registry.register(append);
    registry.register(sha256);
  }
};
