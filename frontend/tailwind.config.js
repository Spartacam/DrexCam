/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nace: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        drex: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          dark: '#0a0e17',
          surface: '#111827',
          border: '#1f2937',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

