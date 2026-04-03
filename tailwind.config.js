/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Diatype Mono"', '"SF Mono"', '"Fira Code"', "monospace"],
        display: ['"Terminal Grotesque"', "sans-serif"],
      },
      colors: {
        yellow: "#FFE600",
        bg: "#000000",
        folder: "#1a1a1a",
        "folder-border": "#2a2a2a",
        "text-muted": "#9ca3af",
        "window-title": "#2a2a2a",
        "window-body": "#1a1a1a",
      },
    },
  },
  plugins: [],
};
