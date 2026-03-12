import { InMemoryRegistry, type Operation } from "@cybermasterchef/core";
import { toBase64 } from "../../../plugins-standard/src/ops/toBase64.js";
import { fromBase64 } from "../../../plugins-standard/src/ops/fromBase64.js";
import { toHex } from "../../../plugins-standard/src/ops/toHex.js";
import { fromHex } from "../../../plugins-standard/src/ops/fromHex.js";
import { toBinary } from "../../../plugins-standard/src/ops/toBinary.js";
import { fromBinary } from "../../../plugins-standard/src/ops/fromBinary.js";
import { toCharcode } from "../../../plugins-standard/src/ops/toCharcode.js";
import { fromCharcode } from "../../../plugins-standard/src/ops/fromCharcode.js";
import { toDecimal } from "../../../plugins-standard/src/ops/toDecimal.js";
import { fromDecimal } from "../../../plugins-standard/src/ops/fromDecimal.js";
import { toOctal } from "../../../plugins-standard/src/ops/toOctal.js";
import { fromOctal } from "../../../plugins-standard/src/ops/fromOctal.js";
import { urlEncode } from "../../../plugins-standard/src/ops/urlEncode.js";
import { urlDecode } from "../../../plugins-standard/src/ops/urlDecode.js";
import { reverse } from "../../../plugins-standard/src/ops/reverse.js";
import { lowercase } from "../../../plugins-standard/src/ops/lowercase.js";
import { uppercase } from "../../../plugins-standard/src/ops/uppercase.js";
import { trim } from "../../../plugins-standard/src/ops/trim.js";
import { prepend } from "../../../plugins-standard/src/ops/prepend.js";
import { append } from "../../../plugins-standard/src/ops/append.js";
import { replace } from "../../../plugins-standard/src/ops/replace.js";
import { slice } from "../../../plugins-standard/src/ops/slice.js";
import { repeat } from "../../../plugins-standard/src/ops/repeat.js";
import { padStart } from "../../../plugins-standard/src/ops/padStart.js";
import { padEnd } from "../../../plugins-standard/src/ops/padEnd.js";
import { sha224 } from "../../../plugins-standard/src/ops/sha224.js";
import { sha256 } from "../../../plugins-standard/src/ops/sha256.js";
import { jsonMinify } from "../../../plugins-standard/src/ops/jsonMinify.js";
import { jsonBeautify } from "../../../plugins-standard/src/ops/jsonBeautify.js";
import { jsonSortKeys } from "../../../plugins-standard/src/ops/jsonSortKeys.js";
import { extractStrings } from "../../../plugins-standard/src/ops/extractStrings.js";
import { extractIpAddresses } from "../../../plugins-standard/src/ops/extractIpAddresses.js";
import { extractUrls } from "../../../plugins-standard/src/ops/extractUrls.js";
import { extractEmails } from "../../../plugins-standard/src/ops/extractEmails.js";
import { defangUrl } from "../../../plugins-standard/src/ops/defangUrl.js";
import { fangUrl } from "../../../plugins-standard/src/ops/fangUrl.js";
import { rot13 } from "../../../plugins-standard/src/ops/rot13.js";
import { rot13BruteForce } from "../../../plugins-standard/src/ops/rot13BruteForce.js";
import { rot47 } from "../../../plugins-standard/src/ops/rot47.js";
import { rot47BruteForce } from "../../../plugins-standard/src/ops/rot47BruteForce.js";

const browserBuiltinOperations: Operation[] = [
  toBase64,
  fromBase64,
  toHex,
  fromHex,
  toBinary,
  fromBinary,
  toCharcode,
  fromCharcode,
  toDecimal,
  fromDecimal,
  toOctal,
  fromOctal,
  urlEncode,
  urlDecode,
  reverse,
  lowercase,
  uppercase,
  trim,
  prepend,
  append,
  replace,
  slice,
  repeat,
  padStart,
  padEnd,
  sha224,
  sha256,
  jsonMinify,
  jsonBeautify,
  jsonSortKeys,
  extractStrings,
  extractIpAddresses,
  extractUrls,
  extractEmails,
  defangUrl,
  fangUrl,
  rot13,
  rot13BruteForce,
  rot47,
  rot47BruteForce
];

export function createRegistryWithBuiltins(): InMemoryRegistry {
  const registry = new InMemoryRegistry();
  for (const op of browserBuiltinOperations) {
    registry.register(op);
  }
  return registry;
}
