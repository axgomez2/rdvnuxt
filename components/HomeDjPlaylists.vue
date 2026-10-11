<template>
  <section v-if="playlists.length > 0" class="py-10 md:py-14">
    <div class="container mx-auto px-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-stone-900">DJ Playlists</h2>
          <p class="text-stone-600 mt-1">Seleções dos melhores DJs</p>
        </div>
        <NuxtLink
          to="/dj-playlists"
          class="hidden sm:flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          Ver todos
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </NuxtLink>
      </div>

      <!-- Grid Desktop -->
      <div class="hidden md:grid grid-cols-3 gap-6">
        <DjPlaylistCard 
          v-for="playlist in playlists.slice(0, 3)" 
          :key="playlist.id" 
          :playlist="playlist"
        />
      </div>

      <!-- Slider Mobile -->
      <div class="md:hidden">
        <div class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <div 
            v-for="playlist in playlists.slice(0, 3)" 
            :key="playlist.id"
            class="flex-shrink-0 w-[70%] snap-start"
          >
            <DjPlaylistCard :playlist="playlist" />
          </div>
        </div>
      </div>

      <!-- Link mobile -->
      <NuxtLink
        to="/dj-playlists"
        class="sm:hidden flex items-center justify-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium transition-colors"
      >
        Ver todas as playlists
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const { data: playlistsData } = await useFetch<{ data: any[] }>('/dj-playlists', {
  baseURL: config.public.apiBase,
  default: () => ({ data: [] })
})

const playlists = computed(() => playlistsData.value?.data || [])
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
