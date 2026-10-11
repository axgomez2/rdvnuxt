<template>
  <section v-if="charts.length > 0" class="py-10 md:py-14 bg-stone-50">
    <div class="container mx-auto px-4">
      <!-- Charts -->
      <div class="space-y-10">
        <div v-for="chart in charts.slice(0, 3)" :key="chart.id">
          <!-- Chart Header -->
          <div class="mb-4">
            <h3 class="text-xl md:text-2xl font-bold text-stone-900">{{ chart.title }}</h3>
          </div>

          <!-- Discos Desktop - Grid -->
          <div class="hidden md:grid grid-cols-5 xl:grid-cols-10 gap-3">
            <NuxtLink 
              v-for="vinyl in chart.vinyls" 
              :key="vinyl.id"
              :to="getVinylRoute(vinyl)"
              class="group"
            >
              <div class="aspect-square rounded-lg overflow-hidden bg-stone-100 shadow-sm group-hover:shadow-md transition-shadow">
                <img 
                  v-if="vinyl.cover_image"
                  :src="getVinylCover(vinyl.cover_image)" 
                  :alt="vinyl.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-stone-200">
                  <svg class="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-xs text-stone-600 truncate">{{ vinyl.artist }}</p>
              <p class="text-xs text-stone-900 font-medium truncate">{{ vinyl.title }}</p>
            </NuxtLink>
          </div>

          <!-- Discos Mobile - Slider -->
          <div class="md:hidden">
            <div class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              <NuxtLink 
                v-for="vinyl in chart.vinyls" 
                :key="vinyl.id"
                :to="getVinylRoute(vinyl)"
                class="flex-shrink-0 w-24 snap-start"
              >
                <div class="aspect-square rounded-lg overflow-hidden bg-stone-100 shadow-sm">
                  <img 
                    v-if="vinyl.cover_image"
                    :src="getVinylCover(vinyl.cover_image)" 
                    :alt="vinyl.title"
                    class="w-full h-full object-cover"
                  />
                </div>
                <p class="mt-1 text-xs text-stone-600 truncate">{{ vinyl.artist }}</p>
                <p class="text-xs text-stone-900 font-medium truncate">{{ vinyl.title }}</p>
              </NuxtLink>
            </div>
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

const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

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
