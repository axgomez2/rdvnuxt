<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Loading -->
    <div v-if="pending" class="py-20 text-center">
      <div class="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-stone-500 mt-4">Carregando...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="py-20 text-center">
      <p class="text-red-500">Playlist não encontrada</p>
      <NuxtLink to="/dj-playlists" class="text-purple-600 hover:underline mt-2 inline-block">
        Voltar para playlists
      </NuxtLink>
    </div>

    <template v-else-if="playlist">
      <!-- Header -->
      <div class="bg-white border-b border-stone-200">
        <div class="container mx-auto px-4 py-8">
          <NuxtLink to="/dj-playlists" class="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Voltar para playlists
          </NuxtLink>
          
          <div class="flex flex-col md:flex-row gap-6 items-start">
            <!-- DJ Image -->
            <div class="w-full md:w-48 flex-shrink-0">
              <div class="aspect-square rounded-xl overflow-hidden bg-stone-100 shadow-lg">
                <img 
                  v-if="playlist.dj_image"
                  :src="djImage" 
                  :alt="playlist.dj_name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
                  <svg class="w-20 h-20 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- Info -->
            <div class="flex-1">
              <h1 class="text-3xl md:text-4xl font-bold text-stone-900">{{ playlist.dj_name }}</h1>
              <p class="text-purple-600 font-medium mt-2">{{ playlist.title }}</p>
              <p v-if="playlist.dj_description" class="text-stone-600 mt-3">{{ playlist.dj_description }}</p>
              <p class="text-stone-500 text-sm mt-4">{{ playlist.tracks?.length || 0 }} faixas</p>
              
              <!-- Social Links -->
              <div v-if="hasSocialLinks" class="flex flex-wrap gap-3 mt-4">
                <a 
                  v-for="(link, key) in playlist.social_links" 
                  :key="key"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-sm text-stone-700 transition-colors"
                >
                  <span v-if="key === 'instagram'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </span>
                  <span v-else-if="key === 'soundcloud'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.05c-.05 0-.09.04-.099.1l-.181 1.1.181 1.05c.01.06.05.1.099.1.05 0 .09-.04.099-.1l.21-1.05-.21-1.1c-.01-.06-.05-.1-.099-.1zm1.8-.95c-.06 0-.11.05-.12.11l-.21 2.05.21 2c.01.06.06.11.12.11.06 0 .11-.05.12-.11l.24-2-.24-2.05c-.01-.06-.06-.11-.12-.11zm.9-.5c-.07 0-.12.05-.13.12l-.18 2.55.18 2.45c.01.07.06.12.13.12.07 0 .12-.05.13-.12l.21-2.45-.21-2.55c-.01-.07-.06-.12-.13-.12zm.9-.35c-.08 0-.14.06-.15.14l-.15 2.9.15 2.8c.01.08.07.14.15.14.08 0 .14-.06.15-.14l.18-2.8-.18-2.9c-.01-.08-.07-.14-.15-.14zm.9-.25c-.09 0-.15.07-.16.15l-.12 3.15.12 3.05c.01.09.07.15.16.15.09 0 .15-.07.16-.15l.15-3.05-.15-3.15c-.01-.09-.07-.15-.16-.15zm.9-.15c-.1 0-.17.07-.18.17l-.09 3.3.09 3.2c.01.1.08.17.18.17.1 0 .17-.07.18-.17l.12-3.2-.12-3.3c-.01-.1-.08-.17-.18-.17zm.9-.1c-.11 0-.18.08-.19.18l-.06 3.4.06 3.3c.01.11.08.18.19.18.11 0 .18-.08.19-.18l.09-3.3-.09-3.4c-.01-.11-.08-.18-.19-.18zm.9-.05c-.12 0-.2.08-.21.2l-.03 3.45.03 3.35c.01.12.09.2.21.2.12 0 .2-.08.21-.2l.06-3.35-.06-3.45c-.01-.12-.09-.2-.21-.2zm.9 0c-.13 0-.21.09-.22.21v3.45l.03 3.35c.01.13.09.21.22.21.13 0 .21-.09.22-.21l.03-3.35-.03-3.45c-.01-.13-.09-.21-.22-.21zm.9.05c-.14 0-.23.09-.24.23l.03 3.4.03 3.3c.01.14.1.23.24.23.14 0 .23-.09.24-.23l.03-3.3-.03-3.4c-.01-.14-.1-.23-.24-.23zm5.55-.85c-.36 0-.71.07-1.03.2-.21-2.39-2.22-4.27-4.68-4.27-.61 0-1.2.12-1.74.34-.21.08-.27.17-.27.34v8.5c0 .18.14.33.32.35h7.4c1.47 0 2.66-1.19 2.66-2.66s-1.19-2.8-2.66-2.8z"/></svg>
                  </span>
                  <span v-else-if="key === 'spotify'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                  </span>
                  <span v-else-if="key === 'youtube'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </span>
                  <span v-else>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                  </span>
                  {{ link.label }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Tracks -->
      <div class="container mx-auto px-4 py-8">
        <h2 class="text-xl font-bold text-stone-900 mb-4">Tracklist</h2>
        
        <div v-if="playlist.tracks?.length > 0" class="space-y-3">
          <div
            v-for="(track, idx) in playlist.tracks"
            :key="track.id"
            class="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-stone-200"
          >
            <!-- Posição -->
            <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-purple-500 text-white font-bold text-sm">
              {{ track.position || Number(idx) + 1 }}
            </div>
            
            <!-- Cover do Vinyl -->
            <NuxtLink 
              v-if="track.vinyl?.id"
              :to="getVinylRoute(track.vinyl)"
              class="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100 hover:opacity-80 transition-opacity"
            >
              <img 
                v-if="track.vinyl.cover_image"
                :src="getVinylCover(track.vinyl.cover_image)" 
                :alt="track.vinyl.title"
                class="w-full h-full object-cover"
              />
            </NuxtLink>
            <div v-else class="w-12 h-12 flex-shrink-0 rounded-lg bg-stone-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
              </svg>
            </div>
            
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-stone-900 truncate">{{ track.name }}</p>
              <p v-if="track.vinyl" class="text-purple-600 text-sm truncate">
                {{ track.vinyl.artist }} - {{ track.vinyl.title }}
              </p>
            </div>
            
            <!-- Link para o disco -->
            <NuxtLink 
              v-if="track.vinyl?.id"
              :to="getVinylRoute(track.vinyl)"
              class="flex-shrink-0 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver disco
            </NuxtLink>
          </div>
        </div>
        
        <div v-else class="py-12 text-center">
          <p class="text-stone-500">Nenhuma faixa nesta playlist ainda</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

const { data: playlistData, pending, error } = await useFetch<{ data: any }>(`/dj-playlists/${route.params.slug}`, {
  baseURL: config.public.apiBase
})

const playlist = computed(() => playlistData.value?.data)

const hasSocialLinks = computed(() => {
  return playlist.value?.social_links && Object.keys(playlist.value.social_links).length > 0
})

const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const djImage = computed(() => {
  const raw = playlist.value?.dj_image || ''
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
  title: () => playlist.value ? `${playlist.value.dj_name} - DJ Playlists - RDV Discos` : 'DJ Playlist - RDV Discos',
  meta: [
    { name: 'description', content: () => playlist.value?.dj_description || 'Playlist de DJ com seleção especial de músicas' }
  ]
})
</script>
