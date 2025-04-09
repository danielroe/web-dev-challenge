// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  ssr: false,
  devtools: { enabled: true },

  runtimeConfig: {
    anthropicApiKey: '',
    spoonacularApiKey: '',
    unsplash: {
      accessKey: '',
      secretKey: '',
    },
  },
  compatibilityDate: '2024-11-01',

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
