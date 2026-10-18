export default defineEventHandler(() => {
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://rdvdiscos.com.br'
  
  return `# RDV Discos - Robots.txt
# https://rdvdiscos.com.br

User-agent: *
Allow: /

# Páginas públicas importantes
Allow: /disco/
Allow: /discos-novos/
Allow: /discos-usados
Allow: /ofertas
Allow: /charts/
Allow: /dj-playlists/
Allow: /gravadora/
Allow: /busca

# Bloquear áreas privadas
Disallow: /minha-conta/
Disallow: /carrinho
Disallow: /checkout
Disallow: /completar-cadastro
Disallow: /pedido/
Disallow: /auth/
Disallow: /api/
Disallow: /_nuxt/

# Bloquear parâmetros de sessão/tracking
Disallow: /*?token=
Disallow: /*?ref=
Disallow: /*?utm_

# Crawl-delay para não sobrecarregar
Crawl-delay: 1

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Google específico
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing específico
User-agent: Bingbot
Allow: /
Crawl-delay: 1
`
})
