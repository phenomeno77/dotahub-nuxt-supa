import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: [
    "@primevue/nuxt-module",
    "@nuxtjs/supabase",
    "nuxt-auth-utils",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt",
  ],
  css: ["@/assets/main.css", "primeicons/primeicons.css"],

  supabase: {
    redirect: false,
  },
  runtimeConfig: {
    oauth: {
      steam: {
        apiKey: process.env.NUXT_OATH_STEAM_API_KEY,
      },
    },
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || "Dotahub",
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    },
  },
  plugins: ["~/plugins/virtualScroller.ts"],

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  primevue: {
    autoImport: true,
    importTheme: { from: "@/themes/mytheme.js" },
  },
});
