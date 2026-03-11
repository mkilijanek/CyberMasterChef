import type { Operation } from "@cybermasterchef/core";
import { parseX509CrlBytes, parseX509Input } from "./x509Utils.js";

export const parseX509Crl: Operation = {
  id: "network.parseX509Crl",
  name: "Parse X.509 CRL",
  description: "Parses a DER or PEM X.509 certificate revocation list into normalized metadata.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = parseX509Input(
      input.type === "bytes" ? input.value : input.value,
      "X509 CRL"
    );
    return { type: "json", value: parseX509CrlBytes(bytes) };
  }
};
