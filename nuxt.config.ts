export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@primevue/nuxt-module"],
  css: ["@/assets/main.css"],

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  },

  primevue: {
    autoImport: true,
    importTheme: { from: "@/themes/mytheme.js" },
  },
});
