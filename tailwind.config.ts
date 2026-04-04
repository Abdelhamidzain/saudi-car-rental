import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1B4332', light: '#2D6A4F', dark: '#0B2920' },
        accent: { DEFAULT: '#E8A838', hover: '#D49A2F' },
        success: '#1A7A42',
        bg: '#FAFAF7',
        card: '#FFFFFF',
        border: '#E8E8E3',
        'text-main': '#1A1A1A',
        'text-mid': '#5A5A5A',
        'text-light': '#6B6B6B',
      },
      fontFamily: {
        sans: ['Tahoma', 'Noto Sans Arabic', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
