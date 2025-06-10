export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@primevue/nuxt-module", '@nuxtjs/supabase'],
  css: ["@/assets/main.css"],

  runtimeConfig: {
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || "Dotahub",
    },
  },

  primevue: {
    autoImport: true,
    importTheme: { from: "@/themes/mytheme.js" },
  },
});
