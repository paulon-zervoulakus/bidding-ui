/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      keyframes: {
        heartbeat: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '14%': { opacity: '1', transform: 'scale(1.15)' },
          '28%': { opacity: '1', transform: 'scale(1)' },
          '42%': { opacity: '1', transform: 'scale(1.15)' },
          '70%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 0.9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

