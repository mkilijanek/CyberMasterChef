import type { Operation } from "@cybermasterchef/core";
import { extractIPs } from "./extractIPs.js";

export const extractIpAddresses: Operation = {
  id: "network.extractIpAddresses",
  name: "Extract IP Addresses",
  description: "Extracts unique IPv4 addresses from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: (ctx) => extractIPs.run(ctx)
};
