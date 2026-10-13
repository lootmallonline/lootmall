import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: { 50: "#fbf1f3", 100: "#f6dde2", 500: "#8c2236", 600: "#751b2d", 700: "#5f1524", 800: "#4a101c" },
        gold: { 300: "#e8cf8f", 400: "#d9b45f", 500: "#c99a2e" },
        ink: "#1f1a1c",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: { card: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
