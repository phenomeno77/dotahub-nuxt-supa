// tailwind.config.ts
import { type Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // important: enables `dark` class usage
  content: [
    "./components/**/*.{vue,js}",
    "./layouts/**/*.{vue,js}",
    "./pages/**/*.{vue,js}",
    "./app.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.ts",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background-color)",
        text: {
          primary: "var(--text-primary)",
          muted: "var(--text-muted)",
        },
        rank: "var(--rank-text)",
      },
    },
  },
  plugins: [],
};

export default config;
