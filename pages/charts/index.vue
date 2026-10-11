<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Header -->
    <div class="bg-white border-b border-stone-200">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl md:text-4xl font-bold text-stone-900">Charts</h1>
        <p class="text-stone-600 mt-2">Seleções especiais de discos por estilo e categoria</p>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="pending" class="py-20 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-stone-500 mt-4">Carregando charts...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-20 text-center">
        <p class="text-red-500">Erro ao carregar charts</p>
      </div>

      <!-- Empty -->
      <div v-else-if="charts.length === 0" class="py-20 text-center">
        <svg class="mx-auto h-16 w-16 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
        </svg>
        <p class="text-stone-500 mt-4">Nenhum chart disponível no momento</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ChartCard 
          v-for="chart in charts" 
          :key="chart.id" 
          :chart="chart"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const { data: chartsData, pending, error } = await useFetch<{ data: any[] }>('/charts', {
  baseURL: config.public.apiBase,
  default: () => ({ data: [] })
})

const charts = computed(() => chartsData.value?.data || [])

useHead({
  title: 'Charts - RDV Discos',
  meta: [
    { name: 'description', content: 'Explore nossos charts com seleções especiais de discos de vinil por estilo e categoria.' }
  ]
})
</script>
