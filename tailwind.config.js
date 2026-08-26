/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      bg: withOpacity('--color-bg-rgb'),
      surface: withOpacity('--color-surface-rgb'),
      ink: {
        100: withOpacity('--color-ink-100-rgb'),
        400: withOpacity('--color-ink-400-rgb'),
      },
      correct: withOpacity('--color-correct-rgb'),
      incorrect: withOpacity('--color-incorrect-rgb'),
      accent: withOpacity('--color-accent-rgb'),
      'accent-contrast': withOpacity('--color-accent-contrast-rgb'),
    },
    fontFamily: {
      sans: [
        '"SF Pro Display"',
        '"SF Pro Text"',
        '"SF Pro"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif'
      ],
      mono: ['"JetBrains Mono"', 'monospace'],
    },
    extend: {
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
}
