import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0D1B2A', light: '#1B3A5C', dark: '#070F17' },
        accent: { DEFAULT: '#D4A853', hover: '#B8912E', light: '#F0D78C' },
        success: '#1A7A42',
        bg: '#FAFAF7',
        card: '#FFFFFF',
        border: '#E5E7EB',
        'text-main': '#1A1A2E',
        'text-mid': '#6B7280',
        'text-light': '#9CA3AF',
      },
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
        display: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
