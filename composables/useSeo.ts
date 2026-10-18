/**
 * Composable para SEO dinâmico
 * Gerencia meta tags, Open Graph, Twitter Cards e Schema.org
 */

interface SeoOptions {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  noindex?: boolean
}

interface ProductSeoOptions {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  sku?: string
  brand?: string
  artist?: string
  releaseYear?: string
  condition?: 'NewCondition' | 'UsedCondition'
  url: string
}

export function useSeo() {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteUrl = config.public.siteUrl || 'https://rdvdiscos.com.br'

  /**
   * Define meta tags básicas para uma página
   */
  function setPageSeo(options: SeoOptions) {
    const fullUrl = options.url || `${siteUrl}${route.fullPath}`
    const imageUrl = options.image || `${siteUrl}/og-image.jpg`

    useHead({
      title: options.title,
      meta: [
        { name: 'description', content: options.description },
        { name: 'robots', content: options.noindex ? 'noindex, nofollow' : 'index, follow' },
        // Open Graph
        { property: 'og:title', content: options.title },
        { property: 'og:description', content: options.description },
        { property: 'og:image', content: imageUrl },
        { property: 'og:url', content: fullUrl },
        { property: 'og:type', content: options.type || 'website' },
        // Twitter
        { name: 'twitter:title', content: options.title },
        { name: 'twitter:description', content: options.description },
        { name: 'twitter:image', content: imageUrl },
      ],
      link: [
        { rel: 'canonical', href: fullUrl },
      ],
    })
  }

  /**
   * Define SEO completo para página de produto com Schema.org
   */
  function setProductSeo(options: ProductSeoOptions) {
    const fullUrl = `${siteUrl}${options.url}`
    const title = `${options.artist ? options.artist + ' - ' : ''}${options.name} | RDV Discos`
    const description = options.description || `Compre ${options.name}${options.artist ? ' de ' + options.artist : ''} na RDV Discos. ${options.availability === 'InStock' ? 'Em estoque, envio imediato.' : options.availability === 'PreOrder' ? 'Disponível para pré-venda.' : 'Produto esgotado.'}`

    // Meta tags
    useHead({
      title: options.name,
      titleTemplate: options.artist ? `${options.artist} - %s | RDV Discos` : '%s | RDV Discos',
      meta: [
        { name: 'description', content: description },
        { name: 'robots', content: 'index, follow' },
        // Open Graph - Product
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:image', content: options.image },
        { property: 'og:image:alt', content: `Capa do disco ${options.name}` },
        { property: 'og:url', content: fullUrl },
        { property: 'og:type', content: 'product' },
        { property: 'product:price:amount', content: String(options.price) },
        { property: 'product:price:currency', content: options.currency || 'BRL' },
        { property: 'product:availability', content: options.availability === 'InStock' ? 'in stock' : options.availability === 'PreOrder' ? 'preorder' : 'out of stock' },
        { property: 'product:condition', content: options.condition === 'NewCondition' ? 'new' : 'used' },
        { property: 'product:brand', content: options.brand || 'RDV Discos' },
        // Twitter
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: options.image },
        { name: 'twitter:label1', content: 'Preço' },
        { name: 'twitter:data1', content: `R$ ${options.price.toFixed(2).replace('.', ',')}` },
        { name: 'twitter:label2', content: 'Disponibilidade' },
        { name: 'twitter:data2', content: options.availability === 'InStock' ? 'Em estoque' : options.availability === 'PreOrder' ? 'Pré-venda' : 'Esgotado' },
      ],
      link: [
        { rel: 'canonical', href: fullUrl },
      ],
      script: [
        // Schema.org Product
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': options.name,
            'description': description,
            'image': options.image,
            'url': fullUrl,
            'sku': options.sku,
            'brand': {
              '@type': 'Brand',
              'name': options.brand || (options.artist || 'RDV Discos'),
            },
            'category': 'Discos de Vinil',
            'itemCondition': options.condition === 'NewCondition' 
              ? 'https://schema.org/NewCondition' 
              : 'https://schema.org/UsedCondition',
            'offers': {
              '@type': 'Offer',
              'url': fullUrl,
              'priceCurrency': options.currency || 'BRL',
              'price': options.price,
              'availability': options.availability === 'InStock' 
                ? 'https://schema.org/InStock' 
                : options.availability === 'PreOrder'
                  ? 'https://schema.org/PreOrder'
                  : 'https://schema.org/OutOfStock',
              'seller': {
                '@type': 'Organization',
                'name': 'RDV Discos',
              },
              'shippingDetails': {
                '@type': 'OfferShippingDetails',
                'shippingDestination': {
                  '@type': 'DefinedRegion',
                  'addressCountry': 'BR',
                },
                'deliveryTime': {
                  '@type': 'ShippingDeliveryTime',
                  'handlingTime': {
                    '@type': 'QuantitativeValue',
                    'minValue': 1,
                    'maxValue': 3,
                    'unitCode': 'DAY',
                  },
                  'transitTime': {
                    '@type': 'QuantitativeValue',
                    'minValue': 3,
                    'maxValue': 15,
                    'unitCode': 'DAY',
                  },
                },
              },
            },
            // Dados específicos de música
            ...(options.artist && {
              'byArtist': {
                '@type': 'MusicGroup',
                'name': options.artist,
              },
            }),
            ...(options.releaseYear && {
              'datePublished': options.releaseYear,
            }),
          }),
        },
        // BreadcrumbList
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': siteUrl,
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': options.condition === 'NewCondition' ? 'Discos Novos' : 'Discos Usados',
                'item': `${siteUrl}/${options.condition === 'NewCondition' ? 'discos-novos' : 'discos-usados'}`,
              },
              {
                '@type': 'ListItem',
                'position': 3,
                'name': options.name,
                'item': fullUrl,
              },
            ],
          }),
        },
      ],
    })
  }

  /**
   * Define SEO para página de listagem/categoria
   */
  function setListingSeo(options: {
    title: string
    description: string
    url: string
    totalItems?: number
  }) {
    const fullUrl = `${siteUrl}${options.url}`

    useHead({
      title: options.title,
      meta: [
        { name: 'description', content: options.description },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: `${options.title} | RDV Discos` },
        { property: 'og:description', content: options.description },
        { property: 'og:url', content: fullUrl },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'canonical', href: fullUrl },
      ],
      script: [
        // Schema.org CollectionPage
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': options.title,
            'description': options.description,
            'url': fullUrl,
            ...(options.totalItems && {
              'numberOfItems': options.totalItems,
            }),
            'isPartOf': {
              '@type': 'WebSite',
              'name': 'RDV Discos',
              'url': siteUrl,
            },
          }),
        },
      ],
    })
  }

  return {
    setPageSeo,
    setProductSeo,
    setListingSeo,
    siteUrl,
  }
}
