// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://rdvdiscos.com.br',
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'pt-BR',
      },
      title: 'RDV Discos - Loja de Discos de Vinil',
      titleTemplate: '%s | RDV Discos',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Loja especializada em discos de vinil para DJs e colecionadores. Discos novos, usados, nacionais e importados. Entrega para todo Brasil.' },
        { name: 'theme-color', content: '#facc15' },
        // SEO básico
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'RDV Discos' },
        { name: 'publisher', content: 'RDV Discos' },
        { name: 'keywords', content: 'discos de vinil, vinil, loja de discos, DJ, colecionador, discos novos, discos usados, vinil brasil, comprar vinil' },
        // Open Graph padrão
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'RDV Discos' },
        { property: 'og:locale', content: 'pt_BR' },
        { property: 'og:image', content: 'https://rdvdiscos.com.br/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@rdvdiscos' },
        // Geo
        { name: 'geo.region', content: 'BR-SP' },
        { name: 'geo.placename', content: 'São Paulo' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        // Canonical (será sobrescrito por página)
        { rel: 'canonical', href: 'https://rdvdiscos.com.br' },
      ],
      script: [
        // Schema.org Organization (global)
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicStore',
            'name': 'RDV Discos',
            'description': 'Loja especializada em discos de vinil para DJs e colecionadores',
            'url': 'https://rdvdiscos.com.br',
            'logo': 'https://rdvdiscos.com.br/logo.png',
            'image': 'https://rdvdiscos.com.br/og-image.jpg',
            'telephone': '+55-11-94715-9293',
            'email': 'contato@rdvdiscos.com.br',
            'address': {
              '@type': 'PostalAddress',
              'addressCountry': 'BR',
              'addressRegion': 'SP',
              'addressLocality': 'São Paulo',
            },
            'priceRange': 'R$30 - R$500',
            'currenciesAccepted': 'BRL',
            'paymentAccepted': 'PIX, Cartão de Crédito, Cartão de Débito',
            'openingHoursSpecification': {
              '@type': 'OpeningHoursSpecification',
              'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              'opens': '09:00',
              'closes': '18:00',
            },
            'sameAs': [
              'https://www.instagram.com/rdvdiscos',
              'https://www.facebook.com/rdvdiscos',
            ],
          }),
        },
      ],
    }
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: true
  },

  // Nitro config para rotas de servidor (sitemap, robots)
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
    },
  },

  // Route rules para cache e SEO
  routeRules: {
    // Páginas estáticas - cache longo
    '/': { prerender: true },
    '/login': { prerender: true },
    '/cadastro': { prerender: true },
    // Listagens - ISR (regenera a cada 10 min)
    '/discos-novos/**': { isr: 600 },
    '/discos-usados': { isr: 600 },
    '/ofertas': { isr: 600 },
    '/charts/**': { isr: 600 },
    '/dj-playlists/**': { isr: 600 },
    '/gravadora/**': { isr: 600 },
    // Produtos - ISR (regenera a cada 5 min para estoque)
    '/disco/**': { isr: 300 },
    // Busca - sem cache
    '/busca': { ssr: true },
    // Área do usuário - sem cache, sem prerender
    '/minha-conta/**': { ssr: false },
    '/carrinho': { ssr: false },
    '/checkout': { ssr: false },
  },
})
