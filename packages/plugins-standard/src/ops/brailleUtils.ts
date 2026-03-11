const ASCII_LOOKUP =
  " A1B'K2L@CIF/MSP\"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=";
const DOT6_LOOKUP =
  "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿";

export function encodeBraille(input: string): string {
  return input
    .split("")
    .map((char) => {
      const index = ASCII_LOOKUP.indexOf(char.toUpperCase());
      return index < 0 ? char : DOT6_LOOKUP[index];
    })
    .join("");
}

export function decodeBraille(input: string): string {
  return input
    .split("")
    .map((char) => {
      const index = DOT6_LOOKUP.indexOf(char);
      return index < 0 ? char : ASCII_LOOKUP[index];
    })
    .join("");
}
