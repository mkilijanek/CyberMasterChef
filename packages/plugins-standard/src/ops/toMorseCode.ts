import type { Operation } from "@cybermasterchef/core";

const MORSE_MAP = new Map<string, string>([
  ["A", ".-"], ["B", "-..."], ["C", "-.-."], ["D", "-.."], ["E", "."], ["F", "..-."],
  ["G", "--."], ["H", "...."], ["I", ".."], ["J", ".---"], ["K", "-.-"], ["L", ".-.."],
  ["M", "--"], ["N", "-."], ["O", "---"], ["P", ".--."], ["Q", "--.-"], ["R", ".-."],
  ["S", "..."], ["T", "-"], ["U", "..-"], ["V", "...-"], ["W", ".--"], ["X", "-..-"],
  ["Y", "-.--"], ["Z", "--.."],
  ["0", "-----"], ["1", ".----"], ["2", "..---"], ["3", "...--"], ["4", "....-"],
  ["5", "....."], ["6", "-...."], ["7", "--..."], ["8", "---.."], ["9", "----."],
  [".", ".-.-.-"], [",", "--..--"], ["?", "..--.."], ["!", "-.-.--"], ["/", "-..-."],
  ["-", "-....-"], ["(", "-.--."], [")", "-.--.-"], ["@", ".--.-."], [":", "---..."]
]);

export const toMorseCode: Operation = {
  id: "codec.toMorseCode",
  name: "To Morse Code",
  description: "Encodes text into International Morse code using spaces and / between words.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") {
      throw new Error("Expected string input");
    }
    const words = input.value.toUpperCase().trim().split(/\s+/).filter(Boolean);
    const encodedWords = words.map((word) =>
      Array.from(word).map((char) => {
        const morse = MORSE_MAP.get(char);
        if (!morse) {
          throw new Error(`Unsupported Morse character: ${char}`);
        }
        return morse;
      }).join(" ")
    );
    return { type: "string", value: encodedWords.join(" / ") };
  }
};
