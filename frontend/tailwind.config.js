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
        police: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          accent: '#2563EB',
          highlight: '#3B82F6',
          gold: '#D97706',
          danger: '#DC2626',
          success: '#059669',
          text: '#F3F4F6',
          muted: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
