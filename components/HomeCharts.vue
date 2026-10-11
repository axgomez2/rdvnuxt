<template>
  <section v-if="charts.length > 0" class="py-10 md:py-14 bg-stone-50">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-stone-900">Charts</h2>
          <p class="text-stone-600 mt-1">Seleções especiais por estilo</p>
        </div>
        <NuxtLink
          to="/charts"
          class="hidden sm:flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
        >
          Ver todos
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </NuxtLink>
      </div>

      <!-- Grid Desktop -->
      <div class="hidden md:grid grid-cols-3 gap-6">
        <NuxtLink 
          v-for="chart in charts.slice(0, 3)" 
          :key="chart.id" 
          :to="`/charts/${chart.slug}`"
          class="bg-white rounded-xl p-5 shadow-sm border border-stone-200 hover:shadow-md hover:border-yellow-300 transition-all"
        >
          <h3 class="text-lg font-bold text-stone-900 mb-1">{{ chart.title }}</h3>
          <p class="text-sm text-stone-500">{{ chart.vinyls_count }} discos</p>
        </NuxtLink>
      </div>

      <!-- Slider Mobile -->
      <div class="md:hidden">
        <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <NuxtLink 
            v-for="chart in charts.slice(0, 3)" 
            :key="chart.id"
            :to="`/charts/${chart.slug}`"
            class="flex-shrink-0 w-[70%] snap-start bg-white rounded-xl p-4 shadow-sm border border-stone-200"
          >
            <h3 class="text-base font-bold text-stone-900 mb-1">{{ chart.title }}</h3>
            <p class="text-sm text-stone-500">{{ chart.vinyls_count }} discos</p>
          </NuxtLink>
        </div>
      </div>

      <!-- Link mobile -->
      <NuxtLink
        to="/charts"
        class="sm:hidden flex items-center justify-center gap-2 mt-4 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
      >
        Ver todos os charts
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </NuxtLink>
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
