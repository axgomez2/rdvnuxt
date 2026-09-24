<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="loading" class="py-20 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-stone-500 mt-4">Carregando...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-20 text-center">
        <svg class="w-16 h-16 text-stone-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
        <h2 class="text-xl font-semibold text-stone-600 mb-2">Gravadora não encontrada</h2>
        <p class="text-stone-400 mb-6">{{ error }}</p>
        <NuxtLink to="/" class="inline-flex items-center gap-2 bg-yellow-400 text-stone-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Voltar à Home
        </NuxtLink>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Header da Gravadora -->
        <div class="mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Logo -->
          <div class="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              v-if="label?.logo"
              :src="resolveImageUrl(label.logo)"
              :alt="label.name"
              class="max-w-full max-h-full object-contain"
              @error="handleImageError"
            />
            <svg v-else class="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h1 class="text-3xl md:text-4xl font-bold text-stone-900">{{ label?.name }}</h1>
            <p v-if="label?.description" class="text-stone-600 mt-2 max-w-2xl">{{ label.description }}</p>
            <div class="flex items-center gap-4 mt-3">
              <span class="text-stone-500 text-sm">
                {{ pagination.total }} {{ pagination.total === 1 ? 'disco' : 'discos' }}
              </span>
              <a
                v-if="label?.website"
                :href="label.website"
                target="_blank"
                rel="noopener noreferrer"
                class="text-yellow-600 hover:text-yellow-700 text-sm font-medium inline-flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Site oficial
              </a>
            </div>
          </div>
        </div>

        <!-- Grid de Discos -->
        <div 
          v-if="vinyls.length > 0" 
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          <div
            v-for="(vinyl, index) in vinyls"
            :key="vinyl.id"
            :data-index="index"
            @click="saveScrollPosition(index)"
          >
            <VinylCard :vinyl="vinyl" />
          </div>
        </div>

        <!-- Sem resultados -->
        <div v-else class="py-20 text-center text-stone-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <path stroke-linecap="round" stroke-width="2" d="M8 12h8"/>
          </svg>
          <p>Nenhum disco disponível desta gravadora</p>
        </div>

        <!-- Paginação -->
        <div v-if="pagination.lastPage > 1" class="mt-10 flex justify-center items-center gap-2">
          <button
            @click="goToPage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage === 1"
            class="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 transition-colors"
          >
            Anterior
          </button>
          
          <div class="flex gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'w-10 h-10 rounded-lg font-medium transition-colors',
                page === pagination.currentPage
                  ? 'bg-yellow-400 text-stone-900'
                  : 'border border-stone-300 text-stone-700 hover:bg-stone-100'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button
            @click="goToPage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage === pagination.lastPage"
            class="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 transition-colors"
          >
            Próxima
          </button>
        </div>
        
        <!-- Info de paginação -->
        <p v-if="pagination.total > 0" class="text-center text-stone-500 text-sm mt-4">
          Mostrando {{ pagination.from }}-{{ pagination.to }} de {{ pagination.total }} discos
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Vinyl } from '~/types'

interface Label {
  id: number
  name: string
  slug: string
  logo?: string
  description?: string
  website?: string
}

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

// State
const label = ref<Label | null>(null)
const vinyls = ref<Vinyl[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0,
  from: 0,
  to: 0,
  perPage: 20
})

// Scroll restoration
const SCROLL_KEY = 'gravadora-scroll'

// Placeholder
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f5f5f4"/><path d="M100 40v120M40 100h120" stroke="#d6d3d1" stroke-width="8" stroke-linecap="round"/></svg>`
)

// Resolver URL de imagem
const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const resolveImageUrl = (raw?: string | null) => {
  if (!raw) return PLACEHOLDER_IMG
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('data:')) return raw
  return `${backendOrigin.value}${raw.startsWith('/') ? '' : '/'}${raw}`
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target.dataset.fallback === '1') return
  target.dataset.fallback = '1'
  target.src = PLACEHOLDER_IMG
}

// Computed
const visiblePages = computed(() => {
  const current = pagination.value.currentPage
  const last = pagination.value.lastPage
  const pages: number[] = []
  
  let start = Math.max(1, current - 2)
  let end = Math.min(last, current + 2)
  
  if (end - start < 4) {
    if (start === 1) end = Math.min(last, 5)
    else start = Math.max(1, last - 4)
  }
  
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Methods
const fetchVinyls = async () => {
  loading.value = true
  error.value = null
  
  try {
    const slug = route.params.slug as string
    const response = await $fetch<any>(`/labels/${slug}/vinyls`, {
      baseURL: config.public.apiBase,
      params: {
        page: route.query.page || 1,
        per_page: pagination.value.perPage
      }
    })
    
    label.value = response.label
    vinyls.value = response.data || []
    pagination.value = {
      currentPage: response.current_page || 1,
      lastPage: response.last_page || 1,
      total: response.total || 0,
      from: response.from || 0,
      to: response.to || 0,
      perPage: response.per_page || 20
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Gravadora não encontrada'
    vinyls.value = []
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (page < 1 || page > pagination.value.lastPage) return
  router.push({ query: { ...route.query, page } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const saveScrollPosition = (index: number) => {
  sessionStorage.setItem(SCROLL_KEY, JSON.stringify({
    index,
    page: pagination.value.currentPage,
    slug: route.params.slug,
    scrollY: window.scrollY
  }))
}

const restoreScrollPosition = () => {
  const saved = sessionStorage.getItem(SCROLL_KEY)
  if (!saved) return
  
  try {
    const data = JSON.parse(saved)
    if (data.page === pagination.value.currentPage && data.slug === route.params.slug) {
      nextTick(() => {
        window.scrollTo({ top: data.scrollY, behavior: 'instant' })
      })
    }
  } catch (e) {
    console.error('Erro ao restaurar scroll:', e)
  }
}

// Watchers
watch(
  () => route.fullPath,
  () => {
    fetchVinyls()
  }
)

// Lifecycle
onMounted(async () => {
  await fetchVinyls()
  restoreScrollPosition()
})

useHead({
  title: computed(() => label.value ? `${label.value.name} - RDV Discos` : 'Gravadora - RDV Discos'),
  meta: [
    { name: 'description', content: computed(() => label.value?.description || `Discos da gravadora ${label.value?.name || ''} disponíveis na RDV Discos.`) }
  ]
})
</script>
