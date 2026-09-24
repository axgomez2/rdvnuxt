<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-stone-900">Discos Novos</h1>
        <p class="text-stone-600 mt-2">Lançamentos e novidades em vinil</p>
      </div>

      <!-- Filtro de Categorias -->
      <div class="mb-8">
        <div class="flex flex-wrap gap-2">
          <!-- Botão "Todos" -->
          <button
            @click="clearCategory"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              !selectedCategory
                ? 'bg-yellow-400 text-stone-900'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            ]"
          >
            Todos
          </button>
          
          <!-- Categorias -->
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="selectCategory(cat.slug)"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              selectedCategory === cat.slug
                ? 'bg-yellow-400 text-stone-900'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            ]"
          >
            {{ cat.name }}
            <span class="ml-1 text-xs opacity-70">({{ cat.count }})</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-20 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-stone-500 mt-4">Carregando discos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-20 text-center">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="fetchVinyls" class="px-4 py-2 bg-yellow-400 text-stone-900 rounded-lg font-medium">
          Tentar novamente
        </button>
      </div>

      <!-- Grid de Discos -->
      <div v-else>
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
          <p>Nenhum disco encontrado nesta categoria</p>
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
interface Vinyl {
  id: number
  title: string
  artist: string
  slug?: string
  price: number
  stock?: number
  availability?: string
  is_new?: boolean
  is_preorder?: boolean
  is_promotional?: boolean
  cover_image?: string
  image_url?: string
  record_label?: string
  release_year?: number
  format?: string
  formatted_price?: string
  has_playable_tracks?: boolean
  tracks?: any[]
}

interface Category {
  id: number
  name: string
  slug: string
  icon?: string
  count: number
}

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

// State
const vinyls = ref<Vinyl[]>([])
const categories = ref<Category[]>([])
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
const SCROLL_KEY = 'discos-novos-scroll'
const lastClickedIndex = ref<number | null>(null)

// Computed
const selectedCategory = computed(() => route.query.category as string || '')

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
const fetchCategories = async () => {
  try {
    const response = await $fetch<{ data: Category[] }>('/categories', {
      baseURL: config.public.apiBase
    })
    categories.value = response.data || []
  } catch (err) {
    console.error('Erro ao carregar categorias:', err)
  }
}

const fetchVinyls = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params: Record<string, any> = {
      is_new: 'true',
      page: route.query.page || 1,
      per_page: pagination.value.perPage
    }
    
    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }
    
    const response = await $fetch<any>('/vinyls', {
      baseURL: config.public.apiBase,
      params
    })
    
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
    error.value = err.data?.message || 'Erro ao carregar discos'
    vinyls.value = []
  } finally {
    loading.value = false
  }
}

const selectCategory = (slug: string) => {
  router.push({ query: { ...route.query, category: slug, page: 1 } })
}

const clearCategory = () => {
  const query = { ...route.query }
  delete query.category
  query.page = '1'
  router.push({ query })
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
    category: selectedCategory.value,
    scrollY: window.scrollY
  }))
}

const restoreScrollPosition = () => {
  const saved = sessionStorage.getItem(SCROLL_KEY)
  if (!saved) return
  
  try {
    const data = JSON.parse(saved)
    // Só restaura se estiver na mesma página e categoria
    if (data.page === pagination.value.currentPage && data.category === selectedCategory.value) {
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
  await Promise.all([fetchCategories(), fetchVinyls()])
  restoreScrollPosition()
})

useHead({
  title: computed(() => {
    const cat = categories.value.find(c => c.slug === selectedCategory.value)
    return cat ? `${cat.name} - Discos Novos - RDV Discos` : 'Discos Novos - RDV Discos'
  }),
  meta: [
    { name: 'description', content: 'Discos de vinil novos, lançamentos e novidades. Importados e nacionais.' }
  ]
})
</script>
