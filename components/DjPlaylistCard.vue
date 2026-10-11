<template>
  <NuxtLink 
    :to="`/dj-playlists/${playlist.slug}`"
    class="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-stone-200"
  >
    <!-- Imagem do DJ -->
    <div class="relative aspect-square overflow-hidden bg-stone-100">
      <img 
        v-if="playlist.dj_image"
        :src="djImage" 
        :alt="playlist.dj_name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
        <svg class="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      
      <!-- Badge de destaque -->
      <div v-if="playlist.is_featured" class="absolute top-3 left-3">
        <span class="bg-yellow-400 text-stone-900 text-xs font-bold px-2 py-1 rounded">
          DESTAQUE
        </span>
      </div>
      
      <!-- Badge de quantidade -->
      <div class="absolute bottom-3 right-3">
        <span class="bg-stone-900/80 text-white text-xs font-medium px-2 py-1 rounded-full">
          {{ playlist.tracks_count }} faixas
        </span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="text-stone-900 font-bold text-lg truncate group-hover:text-purple-600 transition-colors">
        {{ playlist.dj_name }}
      </h3>
      <p class="text-stone-500 text-sm mt-1 truncate">{{ playlist.title }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface DjPlaylist {
  id: number
  title: string
  slug: string
  dj_name: string
  dj_image?: string
  tracks_count: number
  is_featured: boolean
}

const props = defineProps<{
  playlist: DjPlaylist
}>()

const config = useRuntimeConfig()

const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const djImage = computed(() => {
  const raw = props.playlist.dj_image || ''
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return `${backendOrigin.value}${raw.startsWith('/') ? '' : '/'}${raw}`
})

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}
</script>
