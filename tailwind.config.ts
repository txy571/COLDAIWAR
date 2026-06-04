/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Era I — 羊皮纸
        'parchment': '#d4c5a9',
        'parchment-dark': '#5a4a3a',
        'blood': '#8b0000',
        // Era II — CRT
        'crt-bg': '#000a00',
        'crt-green': '#00ff88',
        'crt-cyan': '#00ffff',
        // Era III — 赛博
        'cyber-bg': '#0a0015',
        'cyber-cyan': '#00ffff',
        'cyber-magenta': '#ff00ff',
      },
      fontFamily: {
        'typewriter': ['Courier Prime', 'Courier New', 'monospace'],
        'terminal': ['Share Tech Mono', 'monospace'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
