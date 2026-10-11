<template>
  <NuxtLink 
    :to="`/charts/${chart.slug}`"
    class="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-stone-200"
  >
    <!-- Imagem de capa -->
    <div class="relative aspect-square overflow-hidden bg-stone-100">
      <img 
        v-if="chart.cover_image"
        :src="coverImage" 
        :alt="chart.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600">
        <svg class="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
        </svg>
      </div>
      
      <!-- Badge de quantidade -->
      <div class="absolute bottom-3 right-3">
        <span class="bg-stone-900/80 text-white text-xs font-medium px-2 py-1 rounded-full">
          {{ chart.vinyls_count }} discos
        </span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="text-stone-900 font-bold text-lg truncate group-hover:text-yellow-600 transition-colors">
        {{ chart.title }}
      </h3>
      <p v-if="chart.period" class="text-stone-500 text-sm mt-1">{{ chart.period }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Chart {
  id: number
  title: string
  slug: string
  period?: string
  cover_image?: string
  vinyls_count: number
}

const props = defineProps<{
  chart: Chart
}>()

const config = useRuntimeConfig()

const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const coverImage = computed(() => {
  const raw = props.chart.cover_image || ''
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${backendOrigin.value}${raw.startsWith('/') ? '' : '/'}${raw}`
})

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
