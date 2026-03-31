/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          600: '#4f46e5',
          700: '#4338ca',
        },
        slate: {
          50: '#f8fafc',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          900: '#0f172a',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '40px': '40px',
      },
    },
  },
  plugins: [],
}
