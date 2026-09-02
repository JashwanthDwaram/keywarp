// Touch-typing hand assignment used for real hand-balance telemetry:
// every character the user actually types is attributed to its standard-keyboard hand.

const CHAR_HAND: Record<string, 'left' | 'right'> = {
  // Left hand
  '`': 'left', '~': 'left', '1': 'left', '!': 'left', '2': 'left', '@': 'left',
  'q': 'left', 'Q': 'left', 'w': 'left', 'W': 'left', 'e': 'left', 'E': 'left',
  'r': 'left', 'R': 'left', 't': 'left', 'T': 'left', 'a': 'left', 'A': 'left',
  's': 'left', 'S': 'left', 'd': 'left', 'D': 'left', 'f': 'left', 'F': 'left',
  'g': 'left', 'G': 'left', 'z': 'left', 'Z': 'left', 'x': 'left', 'X': 'left',
  'c': 'left', 'C': 'left', 'v': 'left', 'V': 'left', 'b': 'left', 'B': 'left',
  '3': 'left', '#': 'left', '4': 'left', '$': 'left', '5': 'left', '%': 'left',
  // Right hand
  '6': 'right', '^': 'right', '7': 'right', '&': 'right', '8': 'right', '*': 'right',
  '9': 'right', '(': 'right', '0': 'right', ')': 'right', '-': 'right', '_': 'right',
  '=': 'right', '+': 'right', 'y': 'right', 'Y': 'right', 'u': 'right', 'U': 'right',
  'i': 'right', 'I': 'right', 'o': 'right', 'O': 'right', 'p': 'right', 'P': 'right',
  '[': 'right', '{': 'right', ']': 'right', '}': 'right', '\\': 'right', '|': 'right',
  'h': 'right', 'H': 'right', 'j': 'right', 'J': 'right', 'k': 'right', 'K': 'right',
  'l': 'right', 'L': 'right', ';': 'right', ':': 'right', "'": 'right', '"': 'right',
  'n': 'right', 'N': 'right', 'm': 'right', 'M': 'right', ',': 'right', '<': 'right',
  '.': 'right', '>': 'right', '/': 'right', '?': 'right'
};

export interface HandBalance {
  leftChars: number;
  rightChars: number;
}

/** Count how many characters of `text` belong to each hand (space attributed to thumbs, ignored). */
export const computeHandBalance = (text: string): HandBalance => {
  let leftChars = 0;
  let rightChars = 0;
  for (const ch of text) {
    const hand = CHAR_HAND[ch];
    if (hand === 'left') leftChars++;
    else if (hand === 'right') rightChars++;
  }
  return { leftChars, rightChars };
};
