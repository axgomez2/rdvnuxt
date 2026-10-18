export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || 'https://rdvdiscos.com.br'
  const apiBase = config.public.apiBase || 'https://media.rdvdiscos.com.br/api'
  
  // Páginas estáticas
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/discos-novos', priority: '0.9', changefreq: 'daily' },
    { url: '/discos-novos/pre-venda', priority: '0.8', changefreq: 'daily' },
    { url: '/discos-usados', priority: '0.9', changefreq: 'daily' },
    { url: '/ofertas', priority: '0.9', changefreq: 'daily' },
    { url: '/charts', priority: '0.7', changefreq: 'weekly' },
    { url: '/dj-playlists', priority: '0.7', changefreq: 'weekly' },
    { url: '/busca', priority: '0.6', changefreq: 'weekly' },
    { url: '/login', priority: '0.3', changefreq: 'monthly' },
    { url: '/cadastro', priority: '0.3', changefreq: 'monthly' },
  ]

  // Buscar produtos do backend
  let products: any[] = []
  let labels: any[] = []
  let charts: any[] = []
  let playlists: any[] = []

  try {
    // Buscar todos os vinis para o sitemap
    const [productsRes, labelsRes, chartsRes, playlistsRes] = await Promise.all([
      $fetch(`${apiBase}/sitemap/products`).catch(() => ({ data: [] })),
      $fetch(`${apiBase}/sitemap/labels`).catch(() => ({ data: [] })),
      $fetch(`${apiBase}/charts`).catch(() => ({ data: [] })),
      $fetch(`${apiBase}/dj-playlists`).catch(() => ({ data: [] })),
    ])

    products = (productsRes as any)?.data || []
    labels = (labelsRes as any)?.data || []
    charts = (chartsRes as any)?.data || []
    playlists = (playlistsRes as any)?.data || []
  } catch (error) {
    console.error('Erro ao buscar dados para sitemap:', error)
  }

  // Gerar XML
  const today = new Date().toISOString().split('T')[0]
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

  // Páginas estáticas
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
  }

  // Produtos (discos)
  for (const product of products) {
    const url = product.url || `/disco/${product.artist_slug}/${product.slug}`
    const lastmod = product.updated_at?.split('T')[0] || today
    
    xml += `  <url>
    <loc>${siteUrl}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`
    
    // Adicionar imagem se disponível
    if (product.image) {
      xml += `
    <image:image>
      <image:loc>${product.image}</image:loc>
      <image:title>${escapeXml(product.title || '')}</image:title>
      <image:caption>${escapeXml(product.artist || '')} - ${escapeXml(product.title || '')}</image:caption>
    </image:image>`
    }
    
    xml += `
  </url>
`
  }

  // Gravadoras/Labels
  for (const label of labels) {
    xml += `  <url>
    <loc>${siteUrl}/gravadora/${label.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`
  }

  // Charts
  for (const chart of charts) {
    xml += `  <url>
    <loc>${siteUrl}/charts/${chart.slug}</loc>
    <lastmod>${chart.updated_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`
  }

  // DJ Playlists
  for (const playlist of playlists) {
    xml += `  <url>
    <loc>${siteUrl}/dj-playlists/${playlist.slug}</loc>
    <lastmod>${playlist.updated_at?.split('T')[0] || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`
  }

  xml += `</urlset>`

  // Definir headers
  setHeader(event, 'Content-Type', 'application/xml')
  setHeader(event, 'Cache-Control', 'public, max-age=3600') // Cache 1 hora
  
  return xml
})

// Escapar caracteres especiais para XML
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
