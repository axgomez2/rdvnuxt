<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Loading -->
    <div v-if="pending" class="py-20 text-center">
      <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-stone-500 mt-4">Carregando...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-20 text-center">
      <p class="text-red-500">Chart não encontrado</p>
      <NuxtLink to="/charts" class="text-yellow-600 hover:underline mt-2 inline-block">
        Voltar para charts
      </NuxtLink>
    </div>

    <template v-else-if="chart">
      <!-- Header -->
      <div class="bg-white border-b border-stone-200">
        <div class="container mx-auto px-4 py-8">
          <NuxtLink to="/charts" class="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Voltar para charts
          </NuxtLink>
          
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <!-- Cover -->
            <div class="w-full md:w-48 flex-shrink-0">
              <div class="aspect-square rounded-xl overflow-hidden bg-stone-100 shadow-lg">
                <img 
                  v-if="chart.cover_image"
                  :src="coverImage" 
                  :alt="chart.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
                  <svg class="w-20 h-20 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Info -->
            <div class="flex-1">
              <h1 class="text-3xl md:text-4xl font-bold text-stone-900">{{ chart.title }}</h1>
              <p v-if="chart.period" class="text-yellow-600 font-medium mt-2">{{ chart.period }}</p>
              <p v-if="chart.description" class="text-stone-600 mt-3">{{ chart.description }}</p>
              <p class="text-stone-500 text-sm mt-4">{{ chart.vinyls?.length || 0 }} discos nesta seleção</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Discos -->
      <div class="container mx-auto px-4 py-8">
        <div v-if="chart.vinyls?.length > 0" class="space-y-3">
          <NuxtLink
            v-for="(vinyl, idx) in chart.vinyls"
            :key="vinyl.id"
            :to="getVinylRoute(vinyl)"
            class="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-stone-200 hover:shadow-md hover:border-yellow-300 transition-all"
          >
            <!-- Posição -->
            <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-yellow-400 text-stone-900 font-bold text-sm">
              {{ vinyl.position || Number(idx) + 1 }}
            </div>
            
            <!-- Cover -->
            <div class="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
              <img 
                v-if="vinyl.cover_image"
                :src="getVinylCover(vinyl.cover_image)" 
                :alt="vinyl.title"
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-stone-900 truncate">{{ vinyl.title }}</p>
              <p class="text-yellow-600 text-sm truncate">{{ vinyl.artist }}</p>
              <p v-if="vinyl.catalog_number" class="text-stone-400 text-xs mt-1">{{ vinyl.catalog_number }}</p>
            </div>
            
            <!-- Arrow -->
            <svg class="w-5 h-5 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
        
        <div v-else class="py-12 text-center">
          <p class="text-stone-500">Nenhum disco neste chart ainda</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const { data: chartData, pending, error } = await useFetch<{ data: any }>(`/charts/${route.params.slug}`, {
  baseURL: config.public.apiBase
})

const chart = computed(() => chartData.value?.data)

const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const coverImage = computed(() => {
  const raw = chart.value?.cover_image || ''
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${backendOrigin.value}${raw.startsWith('/') ? '' : '/'}${raw}`
})

const getVinylCover = (url: string) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${backendOrigin.value}${url.startsWith('/') ? '' : '/'}${url}`
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

useHead({
  title: () => chart.value ? `${chart.value.title} - Charts - RDV Discos` : 'Chart - RDV Discos',
  meta: [
    { name: 'description', content: () => chart.value?.description || 'Seleção especial de discos de vinil' }
  ]
})
</script>
