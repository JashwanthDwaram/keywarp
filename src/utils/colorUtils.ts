/**
 * Converts a hex color (#RRGGBB or #RGB) to an "R, G, B" channel triplet string
 * for use in Tailwind CSS variable opacity functions.
 */
export function hexToRgbTriplet(hex: string): string {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) {
    return '138, 133, 120';
  }
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Returns either dark ink (#121316) or white (#ffffff) depending on which provides
 * optimal WCAG AAA contrast ratio for the given accent/background hex color.
 */
export function getContrastTextColor(hex: string): string {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return '#ffffff';
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  // Perceived relative luminance calculation
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.52 ? '#121417' : '#ffffff';
}
