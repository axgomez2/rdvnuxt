<template>
  <section v-if="labels.length > 0" class="py-10 bg-white">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-stone-900">Selos em Destaque</h2>
          <p class="text-stone-600 mt-1">As melhores gravadoras do mundo</p>
        </div>
      </div>

      <!-- Desktop: Grid 4 colunas -->
      <div class="hidden md:grid md:grid-cols-4 gap-6">
        <NuxtLink
          v-for="label in labels"
          :key="label.id"
          :to="`/gravadora/${label.slug}`"
          class="group bg-stone-50 rounded-xl p-6 border border-stone-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
        >
          <!-- Logo -->
          <div class="w-24 h-24 rounded-xl bg-white border border-stone-200 flex items-center justify-center overflow-hidden mb-4 group-hover:border-yellow-400 transition-colors">
            <img
              v-if="label.logo"
              :src="resolveImageUrl(label.logo)"
              :alt="label.name"
              class="max-w-full max-h-full object-contain"
              @error="handleImageError"
            />
            <svg v-else class="w-10 h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>

          <!-- Nome -->
          <h3 class="font-semibold text-stone-900 group-hover:text-yellow-700 transition-colors">{{ label.name }}</h3>
          
          <!-- Ver discos -->
          <span class="mt-2 text-sm text-yellow-600 group-hover:text-yellow-700 font-medium inline-flex items-center gap-1">
            Ver discos
            <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </NuxtLink>
      </div>

      <!-- Mobile: Carrossel deslizante -->
      <div class="md:hidden relative">
        <div 
          ref="carouselRef"
          class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
        >
          <NuxtLink
            v-for="label in labels"
            :key="label.id"
            :to="`/gravadora/${label.slug}`"
            class="flex-shrink-0 w-40 snap-start bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col items-center text-center active:bg-stone-100"
          >
            <!-- Logo -->
            <div class="w-20 h-20 rounded-lg bg-white border border-stone-200 flex items-center justify-center overflow-hidden mb-3">
              <img
                v-if="label.logo"
                :src="resolveImageUrl(label.logo)"
                :alt="label.name"
                class="max-w-full max-h-full object-contain"
                @error="handleImageError"
              />
              <svg v-else class="w-8 h-8 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>

            <!-- Nome -->
            <h3 class="font-medium text-stone-900 text-sm truncate w-full">{{ label.name }}</h3>
          </NuxtLink>
        </div>

        <!-- Indicador de scroll (seta) -->
        <div class="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none bg-gradient-to-l from-white via-white to-transparent w-12 h-full flex items-center justify-end pr-2">
          <svg class="w-5 h-5 text-stone-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface FeaturedLabel {
  id: number
  name: string
  slug: string
  logo?: string
  description?: string
}

const config = useRuntimeConfig()
const labels = ref<FeaturedLabel[]>([])
const carouselRef = ref<HTMLElement | null>(null)

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

const fetchLabels = async () => {
  try {
    const response = await $fetch<{ data: FeaturedLabel[] }>('/featured-labels', {
      baseURL: config.public.apiBase
    })
    labels.value = response.data || []
  } catch (error) {
    console.error('Erro ao carregar selos em destaque:', error)
    labels.value = []
  }
}

onMounted(() => {
  fetchLabels()
})
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
