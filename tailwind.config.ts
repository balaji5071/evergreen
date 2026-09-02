import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f8f5",
          100: "#e1f0e8",
          200: "#c4e2d3",
          300: "#99ccb4",
          400: "#67af8f",
          500: "#439371",
          600: "#31765a",
          700: "#275e4a",
          800: "#214b3c",
          900: "#0c3b2e",
          950: "#06221b",
        },
        cream: {
          50: "#fdfbf7",
          100: "#fbf8f0",
          200: "#f5eee0",
          300: "#eee1cb",
          400: "#e3ccaa",
          500: "#d7b489",
        },
        emeraldDeep: "#0C3B2E",
        mintBg: "#EAF5EF",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(12, 59, 46, 0.06)",
        card: "0 10px 30px -5px rgba(12, 59, 46, 0.08)",
        glow: "0 0 20px rgba(67, 147, 113, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
