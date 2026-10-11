<template>
  <section v-if="charts.length > 0" class="py-10 md:py-14 bg-stone-50">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl md:text-3xl font-bold text-stone-900">Charts</h2>
        <p class="text-stone-600 mt-1">Seleções especiais por estilo</p>
      </div>

      <!-- Desktop: 3 charts em row -->
      <div class="hidden md:grid grid-cols-3 gap-6">
        <div 
          v-for="chart in charts.slice(0, 3)" 
          :key="chart.id"
          class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden"
        >
          <!-- Chart Header -->
          <div class="px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-between">
            <h3 class="font-bold text-stone-900">{{ chart.title }}</h3>
            <svg class="w-5 h-5 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
          
          <!-- Lista de discos -->
          <div class="divide-y divide-stone-100">
            <NuxtLink 
              v-for="(vinyl, idx) in chart.vinyls?.slice(0, 10)" 
              :key="vinyl.id"
              :to="getVinylRoute(vinyl)"
              class="flex items-center gap-3 px-3 py-2 hover:bg-stone-50 transition-colors"
            >
              <!-- Posição -->
              <span 
                class="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-sm font-bold"
                :class="Number(idx) === 0 ? 'bg-yellow-400 text-stone-900' : 'bg-stone-100 text-stone-600'"
              >
                {{ Number(idx) + 1 }}
              </span>
              
              <!-- Capa -->
              <div class="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-stone-100">
                <img 
                  v-if="vinyl.cover_image"
                  :src="getVinylCover(vinyl.cover_image)" 
                  :alt="vinyl.title"
                  class="w-full h-full object-cover"
                />
              </div>
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-stone-900 text-sm truncate">{{ vinyl.artist }}</p>
                <p class="text-xs text-stone-500 truncate">{{ vinyl.title }}</p>
                <p v-if="vinyl.label" class="text-xs text-stone-400 truncate">{{ vinyl.label }}</p>
              </div>
              
              <!-- Preço -->
              <span v-if="vinyl.price" class="text-sm font-semibold text-yellow-600 flex-shrink-0">
                R$ {{ formatPrice(vinyl.price) }}
              </span>
              
              <!-- Ícone carrinho -->
              <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors">
                <svg class="w-4 h-4 text-stone-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Mobile: 1 chart por row com collapse -->
      <div class="md:hidden space-y-4">
        <div 
          v-for="(chart, chartIdx) in charts.slice(0, 3)" 
          :key="chart.id"
          class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden"
        >
          <!-- Chart Header (clicável para expandir) -->
          <button 
            @click="toggleChart(chartIdx)"
            class="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-between"
          >
            <h3 class="font-bold text-stone-900">{{ chart.title }}</h3>
            <svg 
              class="w-5 h-5 text-stone-800 transition-transform duration-200"
              :class="{ 'rotate-90': expandedCharts.includes(chartIdx) }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          
          <!-- Lista de discos (colapsável) -->
          <div 
            v-show="expandedCharts.includes(chartIdx)"
            class="divide-y divide-stone-100"
          >
            <NuxtLink 
              v-for="(vinyl, idx) in chart.vinyls?.slice(0, 10)" 
              :key="vinyl.id"
              :to="getVinylRoute(vinyl)"
              class="flex items-center gap-3 px-3 py-2 hover:bg-stone-50 transition-colors"
            >
              <!-- Posição -->
              <span 
                class="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-sm font-bold"
                :class="Number(idx) === 0 ? 'bg-yellow-400 text-stone-900' : 'bg-stone-100 text-stone-600'"
              >
                {{ Number(idx) + 1 }}
              </span>
              
              <!-- Capa -->
              <div class="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-stone-100">
                <img 
                  v-if="vinyl.cover_image"
                  :src="getVinylCover(vinyl.cover_image)" 
                  :alt="vinyl.title"
                  class="w-full h-full object-cover"
                />
              </div>
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-stone-900 text-sm truncate">{{ vinyl.artist }}</p>
                <p class="text-xs text-stone-500 truncate">{{ vinyl.title }}</p>
                <p v-if="vinyl.label" class="text-xs text-stone-400 truncate">{{ vinyl.label }}</p>
              </div>
              
              <!-- Preço -->
              <span v-if="vinyl.price" class="text-sm font-semibold text-yellow-600 flex-shrink-0">
                R$ {{ formatPrice(vinyl.price) }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const { data: chartsData } = await useFetch<{ data: any[] }>('/charts', {
  baseURL: config.public.apiBase,
  default: () => ({ data: [] })
})

const charts = computed(() => chartsData.value?.data || [])

// Estado para controlar quais charts estão expandidos no mobile
const expandedCharts = ref<number[]>([0]) // Primeiro chart começa expandido

const toggleChart = (idx: number) => {
  const index = expandedCharts.value.indexOf(idx)
  if (index > -1) {
    expandedCharts.value.splice(index, 1)
  } else {
    expandedCharts.value.push(idx)
  }
}

const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const getVinylCover = (url: string) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${backendOrigin.value}${url.startsWith('/') ? '' : '/'}${url}`
}

const formatPrice = (value: number) => {
  return (value || 0).toFixed(2).replace('.', ',')
}

const generateSlug = (text?: string) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const getVinylRoute = (vinyl: any) => {
  const artistSlug = generateSlug(vinyl.artist) || 'artista'
  const titleSlug = generateSlug(vinyl.title) || 'disco'
  return `/disco/${artistSlug}/${titleSlug}-${vinyl.id}`
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
