import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mint: '#ccf2e4',
        pastelPink: '#fce1e4',
        pastelYellow: '#fff6cc',
        lavender: '#e6e6fa',
      },
    },
  },
  plugins: [],
}
export default config;
