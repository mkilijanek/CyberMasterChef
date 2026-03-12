const PRINTABLE_ASCII_START = 33;
const PRINTABLE_ASCII_END = 126;
const PRINTABLE_ASCII_RANGE = PRINTABLE_ASCII_END - PRINTABLE_ASCII_START + 1;
const LATIN_RANGE = 26;

function rotateCharCode(code: number, start: number, range: number, shift: number): string {
  return String.fromCharCode(start + (((code - start + shift) % range) + range) % range);
}

export function applyRot13(value: string, shift = 13): string {
  return value.replace(/[A-Za-z]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return rotateCharCode(code, 65, LATIN_RANGE, shift);
    return rotateCharCode(code, 97, LATIN_RANGE, shift);
  });
}

export function applyRot47(value: string, shift = 47): string {
  return value.replace(/[!-~]/g, (char) =>
    rotateCharCode(char.charCodeAt(0), PRINTABLE_ASCII_START, PRINTABLE_ASCII_RANGE, shift)
  );
}

export function formatRotBruteForce(value: string, shifts: number, transformer: (input: string, shift: number) => string): string {
  return Array.from({ length: shifts }, (_, shift) => `${shift}: ${transformer(value, shift)}`).join(
    "\n"
  );
}
