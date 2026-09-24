/**
 * Composables para buscar discos da API
 */

interface VinylResponse {
  data: any[]
  meta?: any
}

/**
 * Factory para criar composables de listagem por ProductType
 */
function createProductTypeComposable(slug: string, availability: string, limit: number = 10) {
  return () => {
    const config = useRuntimeConfig()
    const vinyls = ref<any[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchData = async () => {
      loading.value = true
      error.value = null
      try {
        const response = await $fetch<VinylResponse>(`/${slug}`, {
          baseURL: config.public.apiBase,
          params: { availability, limit }
        })
        vinyls.value = response.data || []
      } catch (err: any) {
        error.value = err.data?.message || `Erro ao carregar ${slug}`
      } finally {
        loading.value = false
      }
    }

    return { vinyls, loading, error, fetch: fetchData }
  }
}

/**
 * Home — Seção 1: Discos Novos disponíveis
 */
export const useDiscosNovosAvailable = (limit: number = 10) =>
  createProductTypeComposable('discos-novos', 'available', limit)()

/**
 * Home — Seção 2: Discos Novos em pré-venda
 */
export const useDiscosNovosPreorder = (limit: number = 10) =>
  createProductTypeComposable('discos-novos', 'preorder', limit)()

/**
 * Home — Seção 3: Discos Usados disponíveis
 */
export const useDiscosUsadosAvailable = (limit: number = 10) =>
  createProductTypeComposable('discos-usados', 'available', limit)()

/**
 * Home — Seção 4: Discos Nacionais disponíveis
 */
export const useDiscosNacionaisAvailable = (limit: number = 10) =>
  createProductTypeComposable('discos-nacionais', 'available', limit)()

/**
 * Buscar banners da home
 */
export function useHomeBanners() {
  const config = useRuntimeConfig()
  const banners = ref<any[]>([])
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      const response = await $fetch<{ data: any[] }>('/home-banners', {
        baseURL: config.public.apiBase
      })
      banners.value = response.data || []
    } catch {
      banners.value = []
    } finally {
      loading.value = false
    }
  }

  return { banners, loading, fetch: fetchData }
}

/**
 * Buscar seções da home (configuradas no painel admin)
 */
export function useHomeSections() {
  const config = useRuntimeConfig()
  const sections = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchData = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ data: any[] }>('/home-sections', {
        baseURL: config.public.apiBase
      })
      sections.value = response.data || []
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar seções'
      sections.value = []
    } finally {
      loading.value = false
    }
  }

  // Buscar seção específica por type (discos_novos, pre_venda, discos_usados)
  const getSection = (type: string) => {
    return sections.value.find(s => s.type === type)
  }

  return { sections, loading, error, fetch: fetchData, getSection }
}

/**
 * Buscar detalhes de um vinil
 */
export function useVinylDetails() {
  const config = useRuntimeConfig()
  const vinyl = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchData = async (id: string | number) => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<{ data: any }>(`/vinyls/${id}`, {
        baseURL: config.public.apiBase
      })
      vinyl.value = response.data
    } catch (err: any) {
      error.value = err.data?.message || 'Erro ao carregar disco'
    } finally {
      loading.value = false
    }
  }

  return { vinyl, loading, error, fetch: fetchData }
}
