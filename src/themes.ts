export interface Theme {
  id: string;
  name: string;
  bg: string;
  sub: string;
  text: string;
  main: string;
  error: string;
  errorExtra: string;
  surface: string;
}

export const THEMES: Record<string, Theme> = {
  'earth-minimal': {
    id: 'earth-minimal',
    name: 'Earth Minimal',
    bg: '#1a1a16',
    sub: '#8a8578',
    text: '#e8e6e1',
    main: '#d85a30',
    error: '#e24b4a',
    errorExtra: '#639922',
    surface: '#22221c'
  },
  'carbon': {
    id: 'carbon',
    name: 'Carbon',
    bg: '#1e1e1e',
    sub: '#757575',
    text: '#f5e6c8',
    main: '#e6a15c',
    error: '#df5b57',
    errorExtra: '#85a854',
    surface: '#282828'
  },
  'nord': {
    id: 'nord',
    name: 'Nord',
    bg: '#242933',
    sub: '#6b7b96',
    text: '#eceff4',
    main: '#88c0d0',
    error: '#bf616a',
    errorExtra: '#a3be8c',
    surface: '#2e3440'
  },
  'dracula': {
    id: 'dracula',
    name: 'Dracula',
    bg: '#21222c',
    sub: '#6272a4',
    text: '#f8f8f2',
    main: '#bd93f9',
    error: '#ff5555',
    errorExtra: '#50fa7b',
    surface: '#282a36'
  },
  'serika-dark': {
    id: 'serika-dark',
    name: 'Serika Dark',
    bg: '#323437',
    sub: '#646669',
    text: '#d1d0c5',
    main: '#e2b714',
    error: '#ca4754',
    errorExtra: '#8cb83a',
    surface: '#2c2e30'
  },
  'graphite': {
    id: 'graphite',
    name: 'Graphite Slate',
    bg: '#121417',
    sub: '#6b7280',
    text: '#f3f4f6',
    main: '#d85a30',
    error: '#e24b4a',
    errorExtra: '#639922',
    surface: '#1a1d24'
  },
  'warm-olive': {
    id: 'warm-olive',
    name: 'Warm Olive',
    bg: '#181a15',
    sub: '#787d6f',
    text: '#e5e7df',
    main: '#d85a30',
    error: '#e24b4a',
    errorExtra: '#639922',
    surface: '#20241c'
  },
  'warm-cookie': {
    id: 'warm-cookie',
    name: '🍪 Warm Cookie',
    bg: '#1c1917',
    sub: '#a8a29e',
    text: '#fef3c7',
    main: '#f59e0b',
    error: '#ef4444',
    errorExtra: '#84cc16',
    surface: '#292524'
  }
};
