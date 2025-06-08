export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@primevue/nuxt-module"],
  css: ["@/assets/main.css"],

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || "Dotahub",
    },
  },

  primevue: {
    autoImport: true,
    importTheme: { from: "@/themes/mytheme.js" },
  },
});
