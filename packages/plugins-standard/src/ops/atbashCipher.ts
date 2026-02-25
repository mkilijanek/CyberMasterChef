import type { Operation } from "@cybermasterchef/core";

function atbashChar(char: string): string {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(90 - (code - 65));
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(122 - (code - 97));
  }
  return char;
}

export const atbashCipher: Operation = {
  id: "crypto.atbashCipher",
  name: "Atbash Cipher",
  description: "Applies the Atbash substitution cipher to ASCII letters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: [...input.value].map(atbashChar).join("") };
  }
};
