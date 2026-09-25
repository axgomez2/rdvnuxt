<script setup lang="ts">
import type { Vinyl } from '~/types'

const route = useRoute()
const config = useRuntimeConfig()

const searchQuery = computed(() => (route.query.q as string) || '')

useHead({
  title: computed(() => searchQuery.value ? `Busca: ${searchQuery.value} - RDV Discos` : 'Busca - RDV Discos')
})

// Estado
const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<{
  vinyls: Vinyl[]
  artists: any[]
  labels: any[]
  tracks: any[]
}>({
  vinyls: [],
  artists: [],
  labels: [],
  tracks: []
})

const hasResults = computed(() => {
  return results.value.vinyls.length > 0 ||
         results.value.artists.length > 0 ||
         results.value.labels.length > 0 ||
         results.value.tracks.length > 0
})

const totalResults = computed(() => {
  return results.value.vinyls.length +
         results.value.artists.length +
         results.value.labels.length +
         results.value.tracks.length
})

// Buscar resultados
const search = async () => {
  if (!searchQuery.value.trim()) {
    results.value = { vinyls: [], artists: [], labels: [], tracks: [] }
    return
  }

  loading.value = true
  error.value = null

  try {
    // A API retorna diretamente os vinyls no campo data
    const response = await $fetch<{
      data: Vinyl[]
      meta?: { total: number; query: string }
    }>('/search', {
      baseURL: config.public.apiBase,
      params: { q: searchQuery.value, per_page: 50 }
    })

    results.value = {
      vinyls: Array.isArray(response.data) ? response.data : [],
      artists: [],
      labels: [],
      tracks: []
    }
  } catch (err: any) {
    console.error('Erro na busca:', err)
    error.value = 'Erro ao realizar a busca. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// Gerar slug para URL do disco
const generateSlug = (vinyl: Vinyl) => {
  const artistSlug = (vinyl.artist || 'artista').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const titleSlug = (vinyl.title || 'disco').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `/disco/${artistSlug}/${titleSlug}-${vinyl.id}`
}

// Resolver URL da imagem
const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '/placeholder.svg'
  if (url.startsWith('http')) return url
  return `${config.public.apiBase.replace('/api', '')}${url}`
}

// Buscar quando a query mudar
watch(() => route.query.q, () => {
  search()
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-stone-900">Resultados da Busca</h1>
        <p v-if="searchQuery" class="mt-2 text-stone-600">
          Buscando por: <span class="font-semibold text-stone-900">"{{ searchQuery }}"</span>
          <span v-if="!loading && hasResults" class="ml-2 text-stone-500">({{ totalResults }} resultado{{ totalResults !== 1 ? 's' : '' }})</span>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4 text-stone-500">Buscando...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-xl text-center">
        {{ error }}
      </div>

      <!-- No Query -->
      <div v-else-if="!searchQuery" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 text-stone-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-stone-900">Digite algo para buscar</h2>
        <p class="mt-2 text-stone-500">Busque por artistas, títulos, faixas ou selos.</p>
      </div>

      <!-- No Results -->
      <div v-else-if="!hasResults" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 text-stone-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-stone-900">Nenhum resultado encontrado</h2>
        <p class="mt-2 text-stone-500">Tente buscar com outros termos.</p>
      </div>

      <!-- Results -->
      <div v-else class="space-y-8">
        <!-- Discos -->
        <section v-if="results.vinyls.length > 0">
          <h2 class="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
            Discos ({{ results.vinyls.length }})
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              v-for="vinyl in results.vinyls"
              :key="vinyl.id"
              :to="generateSlug(vinyl)"
              class="bg-white rounded-xl shadow-sm p-4 flex gap-4 hover:shadow-md transition-shadow"
            >
              <img
                :src="resolveImageUrl(vinyl.cover_image || vinyl.image_url)"
                :alt="vinyl.title"
                class="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                @error="($event.target as HTMLImageElement).src = '/placeholder.svg'"
              >
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-stone-900 truncate">{{ vinyl.title }}</h3>
                <p class="text-stone-500 truncate">{{ vinyl.artist }}</p>
                <p class="mt-1 font-bold text-yellow-600">{{ vinyl.formatted_price || `R$ ${vinyl.price?.toFixed(2).replace('.', ',')}` }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Artistas -->
        <section v-if="results.artists.length > 0">
          <h2 class="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Artistas ({{ results.artists.length }})
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NuxtLink
              v-for="artist in results.artists"
              :key="artist.id"
              :to="`/artista/${artist.slug || artist.id}`"
              class="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <img
                  v-if="artist.image_url"
                  :src="resolveImageUrl(artist.image_url)"
                  :alt="artist.name"
                  class="w-14 h-14 rounded-full object-cover"
                >
                <span v-else class="text-xl font-bold text-purple-600">{{ artist.name?.charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-stone-900 truncate">{{ artist.name }}</h3>
                <p v-if="artist.vinyls_count" class="text-sm text-stone-500">{{ artist.vinyls_count }} disco{{ artist.vinyls_count !== 1 ? 's' : '' }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Selos / Gravadoras -->
        <section v-if="results.labels.length > 0">
          <h2 class="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            Selos / Gravadoras ({{ results.labels.length }})
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NuxtLink
              v-for="label in results.labels"
              :key="label.id"
              :to="`/gravadora/${label.slug || label.id}`"
              class="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  v-if="label.logo_url || label.image_url"
                  :src="resolveImageUrl(label.logo_url || label.image_url)"
                  :alt="label.name"
                  class="w-full h-full object-contain"
                >
                <span v-else class="text-xl font-bold text-blue-600">{{ label.name?.charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-stone-900 truncate">{{ label.name }}</h3>
                <p v-if="label.vinyls_count" class="text-sm text-stone-500">{{ label.vinyls_count }} disco{{ label.vinyls_count !== 1 ? 's' : '' }}</p>
              </div>
            </NuxtLink>
          </div>
        </section>

        <!-- Faixas -->
        <section v-if="results.tracks.length > 0">
          <h2 class="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
            Faixas ({{ results.tracks.length }})
          </h2>
          <div class="bg-white rounded-xl shadow-sm divide-y divide-stone-100">
            <NuxtLink
              v-for="track in results.tracks"
              :key="track.id"
              :to="track.vinyl ? generateSlug(track.vinyl) : '#'"
              class="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors"
            >
              <img
                v-if="track.vinyl"
                :src="resolveImageUrl(track.vinyl.cover_image || track.vinyl.image_url)"
                :alt="track.vinyl.title"
                class="w-12 h-12 rounded object-cover flex-shrink-0"
                @error="($event.target as HTMLImageElement).src = '/placeholder.svg'"
              >
              <div class="w-12 h-12 bg-stone-100 rounded flex items-center justify-center flex-shrink-0" v-else>
                <svg class="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-stone-900 truncate">{{ track.title || track.name }}</h3>
                <p class="text-sm text-stone-500 truncate">
                  {{ track.vinyl?.artist || track.artist }} - {{ track.vinyl?.title || 'Disco' }}
                </p>
              </div>
              <span v-if="track.duration" class="text-sm text-stone-400">{{ track.duration }}</span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
