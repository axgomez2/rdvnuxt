<template>
  <div class="min-h-screen bg-stone-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/minha-conta" class="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 mb-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Voltar para Minha Conta
        </NuxtLink>
        <h1 class="text-2xl md:text-3xl font-bold text-stone-900">Minha Playlist de DJ</h1>
        <p class="text-stone-600 mt-1">Gerencie as faixas da sua playlist</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-20 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-stone-500 mt-4">Carregando...</p>
      </div>

      <!-- Não é DJ -->
      <div v-else-if="!authStore.user?.is_dj" class="py-20 text-center">
        <svg class="mx-auto h-16 w-16 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <p class="text-stone-500 mt-4">Você não tem acesso a esta área.</p>
        <p class="text-stone-400 text-sm mt-2">Entre em contato conosco para se tornar um DJ parceiro.</p>
      </div>

      <!-- Sem playlist -->
      <div v-else-if="!playlist" class="py-20 text-center">
        <svg class="mx-auto h-16 w-16 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
        </svg>
        <p class="text-stone-500 mt-4">Você ainda não tem uma playlist.</p>
        <p class="text-stone-400 text-sm mt-2">Entre em contato conosco para criar sua playlist.</p>
      </div>

      <!-- Playlist -->
      <template v-else>
        <!-- Info da Playlist -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-stone-200 mb-6">
          <div class="flex items-start gap-4">
            <div class="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
              <img 
                v-if="playlist.dj_image"
                :src="playlist.dj_image" 
                :alt="playlist.dj_name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
                <svg class="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
            </div>
            <div>
              <h2 class="text-xl font-bold text-stone-900">{{ playlist.dj_name }}</h2>
              <p class="text-purple-600">{{ playlist.title }}</p>
              <p class="text-stone-500 text-sm mt-1">{{ playlist.tracks?.length || 0 }} faixas</p>
            </div>
          </div>
        </div>

        <!-- Buscar Faixas -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-stone-200 mb-6">
          <h3 class="text-lg font-semibold text-stone-900 mb-4">Adicionar Faixa</h3>
          <div class="relative">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Buscar faixas por nome, artista ou disco..."
              class="w-full rounded-lg border-stone-300 pl-10 focus:border-purple-500 focus:ring-purple-500"
              @input="debouncedSearch"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          
          <!-- Resultados da busca -->
          <div v-if="searchResults.length > 0" class="mt-4 max-h-64 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100">
            <button
              v-for="track in searchResults"
              :key="track.id"
              @click="addTrack(track.id)"
              :disabled="addingTrack"
              class="w-full flex items-center gap-3 p-3 hover:bg-stone-50 text-left transition-colors disabled:opacity-50"
            >
              <div class="w-10 h-10 rounded bg-stone-100 flex-shrink-0 overflow-hidden">
                <img v-if="track.cover" :src="track.cover" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-stone-900 truncate">{{ track.name }}</p>
                <p class="text-sm text-stone-500 truncate">{{ track.artist }} - {{ track.vinyl_title }}</p>
              </div>
              <svg class="w-5 h-5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
          
          <p v-if="searchQuery && searchResults.length === 0 && !searching" class="mt-4 text-stone-500 text-sm text-center">
            Nenhuma faixa encontrada
          </p>
        </div>

        <!-- Lista de Faixas -->
        <div class="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div class="px-6 py-4 bg-stone-50 border-b border-stone-200">
            <h3 class="text-lg font-semibold text-stone-900">Faixas da Playlist</h3>
            <p class="text-stone-500 text-sm">Arraste para reordenar</p>
          </div>
          
          <div v-if="playlist.tracks?.length > 0" ref="tracksContainer" class="divide-y divide-stone-100">
            <div
              v-for="(track, idx) in playlist.tracks"
              :key="track.id"
              :data-track-id="track.id"
              class="flex items-center gap-4 p-4 hover:bg-stone-50 cursor-move"
            >
              <!-- Handle -->
              <div class="drag-handle w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                {{ track.position || Number(idx) + 1 }}
              </div>
              
              <!-- Cover -->
              <div class="w-12 h-12 rounded-lg bg-stone-100 flex-shrink-0 overflow-hidden">
                <img v-if="track.vinyl?.cover_image" :src="track.vinyl.cover_image" class="w-full h-full object-cover" />
              </div>
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-stone-900 truncate">{{ track.name }}</p>
                <p v-if="track.vinyl" class="text-sm text-purple-600 truncate">
                  {{ track.vinyl.artist }} - {{ track.vinyl.title }}
                </p>
              </div>
              
              <!-- Remover -->
              <button
                @click="removeTrack(track.id)"
                :disabled="removingTrack === track.id"
                class="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div v-else class="p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
            <p class="text-stone-500 mt-4">Nenhuma faixa na playlist</p>
            <p class="text-stone-400 text-sm mt-1">Use a busca acima para adicionar faixas</p>
          </div>
        </div>

        <!-- Mensagens -->
        <div v-if="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ errorMessage }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

const loading = ref(true)
const playlist = ref<any>(null)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searching = ref(false)
const addingTrack = ref(false)
const removingTrack = ref<number | null>(null)
const successMessage = ref('')
const errorMessage = ref('')
const tracksContainer = ref<HTMLElement | null>(null)

let searchTimeout: NodeJS.Timeout | null = null
let sortableInstance: any = null

// Carregar playlist
const fetchPlaylist = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ data: any }>('/dj/my-playlist', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    playlist.value = response.data
  } catch (err: any) {
    if (err?.status !== 404) {
      errorMessage.value = 'Erro ao carregar playlist'
    }
  } finally {
    loading.value = false
  }
}

// Buscar faixas
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchTracks, 300)
}

const searchTracks = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  searching.value = true
  try {
    const response = await $fetch<any[]>('/dj/search-tracks', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` },
      params: { q: searchQuery.value }
    })
    searchResults.value = response || []
  } catch {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// Adicionar faixa
const addTrack = async (trackId: number) => {
  addingTrack.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    await $fetch('/dj/tracks', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { track_id: trackId }
    })
    
    successMessage.value = 'Faixa adicionada!'
    searchQuery.value = ''
    searchResults.value = []
    await fetchPlaylist()
    
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Erro ao adicionar faixa'
  } finally {
    addingTrack.value = false
  }
}

// Remover faixa
const removeTrack = async (trackId: number) => {
  if (!confirm('Remover esta faixa da playlist?')) return
  
  removingTrack.value = trackId
  errorMessage.value = ''
  
  try {
    await $fetch(`/dj/tracks/${trackId}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    successMessage.value = 'Faixa removida!'
    await fetchPlaylist()
    
    setTimeout(() => { successMessage.value = '' }, 3000)
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Erro ao remover faixa'
  } finally {
    removingTrack.value = null
  }
}

// Reordenar faixas
const saveOrder = async (trackIds: number[]) => {
  try {
    await $fetch('/dj/tracks/reorder', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { tracks: trackIds }
    })
  } catch {
    errorMessage.value = 'Erro ao salvar ordem'
  }
}

// Inicializar Sortable
const initSortable = async () => {
  if (!tracksContainer.value || !playlist.value?.tracks?.length) return
  
  // @ts-ignore - sortablejs types
  const Sortable = (await import('sortablejs')).default
  
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  
  sortableInstance = new Sortable(tracksContainer.value, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'bg-purple-50',
    onEnd: () => {
      const items = Array.from(tracksContainer.value!.querySelectorAll('[data-track-id]'))
        .map(el => parseInt((el as HTMLElement).dataset.trackId!))
      saveOrder(items)
    }
  })
}

onMounted(async () => {
  await fetchPlaylist()
  await nextTick()
  initSortable()
})

watch(() => playlist.value?.tracks, async () => {
  await nextTick()
  initSortable()
}, { deep: true })

useHead({
  title: 'Minha Playlist - RDV Discos'
})
</script>
