/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base/Main Colors
        'base-bg': '#E0E1DD',
        'header-footer': '#1B263B',
        'primary-button': '#415A77',
        
        // Secondary/Accent Colors
        'secondary': '#778DA9',
        'accent': '#F4A261',
        
        // Text Colors
        'text-heading': '#0D1B2A',
        'text-body': '#1B263B',
        'text-sub': '#778DA9',
        
        // State Colors
        'state-success': '#4CAF50',
        'state-warning': '#FFD166',
        'state-error': '#E63946',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
}