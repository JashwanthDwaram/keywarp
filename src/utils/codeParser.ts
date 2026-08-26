/**
 * Code and Document Parser Utility
 * Converts raw code snippets, markdown, or text files into typing-optimized practice drills.
 */

export interface ParsedCodeDrill {
  title: string;
  cleanText: string;
  lineCount: number;
  wordCount: number;
  charCount: number;
}

export function parseCodeForTyping(rawInput: string, customTitle = 'Custom Code Practice'): ParsedCodeDrill {
  if (!rawInput || !rawInput.trim()) {
    return {
      title: customTitle,
      cleanText: 'const greet = () => console.log("Hello, TypePulse!");',
      lineCount: 1,
      wordCount: 7,
      charCount: 52
    };
  }

  // 1. Strip license headers and multi-line comment blocks
  let text = rawInput
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove /* ... */
    .replace(/<!--[\s\S]*?-->/g, '') // remove HTML comments
    .replace(/"""[\s\S]*?"""/g, ''); // remove Python docstrings

  // 2. Normalize carriage returns and tabs
  text = text.replace(/\r\n/g, '\n').replace(/\t/g, '  ');

  // 3. Process line by line
  const lines = text.split('\n');
  const cleanLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trimEnd();
    // Skip empty lines at the very top or bottom
    if (!trimmed && cleanLines.length === 0) continue;
    // Skip repetitive comments
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('--')) {
      continue;
    }
    if (trimmed.length > 0) {
      cleanLines.push(trimmed);
    }
  }

  // If too short, fallback to trimmed raw text
  let finalJoined = cleanLines.join('\n').trim();
  if (finalJoined.length < 10) {
    finalJoined = rawInput.trim();
  }

  // Limit to reasonable drill length (~600 chars max so typing test isn't daunting)
  if (finalJoined.length > 700) {
    const words = finalJoined.split(/\s+/);
    finalJoined = words.slice(0, 100).join(' ');
  }

  const words = finalJoined.trim().split(/\s+/).filter(Boolean);

  return {
    title: customTitle,
    cleanText: finalJoined,
    lineCount: cleanLines.length,
    wordCount: words.length,
    charCount: finalJoined.length
  };
}
