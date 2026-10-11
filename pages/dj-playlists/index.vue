<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Header -->
    <div class="bg-white border-b border-stone-200">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl md:text-4xl font-bold text-stone-900">DJ Playlists</h1>
        <p class="text-stone-600 mt-2">Seleções musicais dos melhores DJs</p>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="pending" class="py-20 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-stone-500 mt-4">Carregando playlists...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-20 text-center">
        <p class="text-red-500">Erro ao carregar playlists</p>
      </div>

      <!-- Empty -->
      <div v-else-if="playlists.length === 0" class="py-20 text-center">
        <svg class="mx-auto h-16 w-16 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <p class="text-stone-500 mt-4">Nenhuma playlist disponível no momento</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <DjPlaylistCard 
          v-for="playlist in playlists" 
          :key="playlist.id" 
          :playlist="playlist"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const { data: playlistsData, pending, error } = await useFetch<{ data: any[] }>('/dj-playlists', {
  baseURL: config.public.apiBase,
  default: () => ({ data: [] })
})

const playlists = computed(() => playlistsData.value?.data || [])

useHead({
  title: 'DJ Playlists - RDV Discos',
  meta: [
    { name: 'description', content: 'Explore as playlists dos melhores DJs com seleções especiais de músicas.' }
  ]
})
</script>
