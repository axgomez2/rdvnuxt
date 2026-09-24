<template>
  <Teleport to="body">
    <div 
      v-if="player.isVisible"
      class="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 border-t border-stone-700 shadow-2xl transition-all duration-300"
      :class="{ 'h-20': player.isMinimized, 'h-auto': !player.isMinimized }"
    >
      <!-- Player Principal -->
      <div class="container mx-auto px-4">
        <!-- Barra de Progresso (clicável) -->
        <div 
          class="h-1 bg-stone-700 cursor-pointer group relative -mt-0.5"
          @click="handleProgressClick"
        >
          <div 
            class="h-full bg-yellow-400 transition-all duration-100"
            :style="{ width: `${player.progress}%` }"
          ></div>
          <div 
            class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{ left: `${player.progress}%`, transform: 'translate(-50%, -50%)' }"
          ></div>
        </div>

        <!-- Conteúdo do Player -->
        <div class="flex items-center gap-4 py-3">
          <!-- Capa do Disco -->
          <div class="relative w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-stone-800">
            <img 
              v-if="player.currentVinyl?.cover_image"
              :src="player.currentVinyl.cover_image" 
              :alt="player.currentVinyl.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-stone-600">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
              </svg>
            </div>
            <!-- Loading Spinner -->
            <div v-if="player.isLoading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
              <svg class="w-6 h-6 animate-spin text-yellow-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>

          <!-- Info da Track -->
          <div class="flex-1 min-w-0 hidden sm:block">
            <p class="text-white font-medium truncate text-sm">
              {{ player.currentTrack?.name || 'Nenhuma faixa selecionada' }}
            </p>
            <p class="text-yellow-400 text-xs truncate">
              {{ player.currentVinyl?.artist }} - {{ player.currentVinyl?.title }}
            </p>
            <p class="text-stone-500 text-xs">
              {{ player.playableTracks.length }} faixas disponíveis
            </p>
          </div>

          <!-- Controles Principais -->
          <div class="flex items-center gap-2">
            <!-- Previous -->
            <button 
              @click="player.previous"
              :disabled="!player.hasPrevious"
              class="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <!-- Play/Pause -->
            <button 
              @click="player.togglePlay"
              :disabled="!player.currentTrack"
              class="w-12 h-12 flex items-center justify-center bg-yellow-400 text-stone-900 rounded-full hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg v-if="player.isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
              <svg v-else class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>

            <!-- Next -->
            <button 
              @click="player.next"
              :disabled="!player.hasNext"
              class="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          <!-- Tempo -->
          <div class="hidden md:flex items-center gap-2 text-xs text-stone-400 min-w-[100px]">
            <span>{{ player.formattedCurrentTime }}</span>
            <span>/</span>
            <span>{{ player.formattedDuration }}</span>
          </div>

          <!-- Controles Secundários -->
          <div class="hidden lg:flex items-center gap-1">
            <!-- Shuffle -->
            <button 
              @click="player.toggleShuffle"
              class="w-8 h-8 flex items-center justify-center transition-colors"
              :class="player.isShuffle ? 'text-yellow-400' : 'text-stone-400 hover:text-white'"
              title="Aleatório"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
              </svg>
            </button>

            <!-- Repeat -->
            <button 
              @click="player.toggleRepeat"
              class="w-8 h-8 flex items-center justify-center transition-colors"
              :class="player.isRepeat ? 'text-yellow-400' : 'text-stone-400 hover:text-white'"
              title="Repetir"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
            </button>
          </div>

          <!-- Volume -->
          <div class="hidden lg:flex items-center gap-2">
            <button 
              @click="player.toggleMute"
              class="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
            >
              <svg v-if="player.isMuted || player.volume === 0" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
              <svg v-else-if="player.volume < 0.5" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              :value="player.volume"
              @input="handleVolumeChange"
              class="w-20 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>

          <!-- Botão Fechar -->
          <button 
            @click="player.close"
            class="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
            title="Fechar player"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Audio Element (invisível) -->
      <audio 
        ref="audioElement"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @ended="handleEnded"
        @playing="handlePlaying"
        @pause="handlePause"
        @waiting="handleWaiting"
        @canplay="handleCanPlay"
        @error="handleError"
      ></audio>

      <!-- YouTube Player (invisível) -->
      <div ref="youtubeContainer" class="hidden">
        <div ref="youtubePlayerEl"></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/player'

const player = usePlayerStore()

const audioElement = ref<HTMLAudioElement | null>(null)
const youtubeContainer = ref<HTMLDivElement | null>(null)
const youtubePlayerEl = ref<HTMLDivElement | null>(null)

let ytPlayer: any = null
let ytApiLoaded = false
let ytApiLoading = false
let ytTimeInterval: ReturnType<typeof setInterval> | null = null

// Carregar YouTube API
const loadYouTubeApi = (): Promise<void> => {
  return new Promise((resolve) => {
    if (ytApiLoaded) {
      resolve()
      return
    }

    if (ytApiLoading) {
      const checkInterval = setInterval(() => {
        if (ytApiLoaded) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
      return
    }

    ytApiLoading = true

    if ((window as any).YT && (window as any).YT.Player) {
      ytApiLoaded = true
      resolve()
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)

    ;(window as any).onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true
      resolve()
    }
  })
}

// Extrair ID do vídeo do YouTube
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[7].length === 11) ? match[7] : null
}

// Criar player do YouTube
const createYouTubePlayer = async (videoId: string): Promise<any> => {
  await loadYouTubeApi()
  
  return new Promise((resolve) => {
    if (ytPlayer) {
      ytPlayer.destroy()
    }

    ytPlayer = new (window as any).YT.Player(youtubePlayerEl.value, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(player.volume * 100)
          resolve(event.target)
        },
        onStateChange: (event: any) => {
          const YT = (window as any).YT
          switch (event.data) {
            case YT.PlayerState.PLAYING:
              player.setLoading(false)
              player.play()
              break
            case YT.PlayerState.PAUSED:
              player.pause()
              break
            case YT.PlayerState.ENDED:
              player.onTrackEnded()
              break
            case YT.PlayerState.BUFFERING:
              player.setLoading(true)
              break
          }
        },
        onError: () => {
          console.error('Erro no player do YouTube')
          player.setLoading(false)
          player.next()
        }
      }
    })
  })
}

// Atualizar tempo do YouTube
const startYouTubeTimeUpdate = () => {
  stopYouTubeTimeUpdate()
  ytTimeInterval = setInterval(() => {
    if (ytPlayer && ytPlayer.getCurrentTime) {
      player.updateTime(ytPlayer.getCurrentTime())
      if (ytPlayer.getDuration) {
        player.updateDuration(ytPlayer.getDuration())
      }
    }
  }, 250)
}

const stopYouTubeTimeUpdate = () => {
  if (ytTimeInterval) {
    clearInterval(ytTimeInterval)
    ytTimeInterval = null
  }
}

// Handlers de áudio local
const handleTimeUpdate = () => {
  if (audioElement.value) {
    player.updateTime(audioElement.value.currentTime)
  }
}

const handleLoadedMetadata = () => {
  if (audioElement.value) {
    player.updateDuration(audioElement.value.duration)
  }
}

const handleEnded = () => {
  player.onTrackEnded()
}

const handlePlaying = () => {
  player.setLoading(false)
}

const handlePause = () => {
  // Estado controlado pelo store
}

const handleWaiting = () => {
  player.setLoading(true)
}

const handleCanPlay = () => {
  player.setLoading(false)
}

const handleError = (e: Event) => {
  console.error('Erro no áudio:', e)
  player.setLoading(false)
  player.next()
}

// Handler de progresso
const handleProgressClick = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = ((e.clientX - rect.left) / rect.width) * 100
  player.seekPercent(percent)
  
  if (player.currentTrack?.audio_source === 'local' && audioElement.value) {
    audioElement.value.currentTime = (percent / 100) * audioElement.value.duration
  } else if (player.currentTrack?.audio_source === 'youtube' && ytPlayer) {
    ytPlayer.seekTo((percent / 100) * ytPlayer.getDuration())
  }
}

// Handler de volume
const handleVolumeChange = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value)
  player.setVolume(value)
}

// Watch para mudança de track
watch(() => player.currentTrack, async (newTrack) => {
  if (!newTrack) return

  player.setLoading(true)
  stopYouTubeTimeUpdate()

  // Parar áudio anterior
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
  }
  if (ytPlayer) {
    ytPlayer.stopVideo()
  }

  await nextTick()

  if (newTrack.audio_source === 'local') {
    // Reproduzir áudio local
    if (audioElement.value && newTrack.audio_url) {
      audioElement.value.src = newTrack.audio_url
      audioElement.value.load()
      if (player.isPlaying) {
        audioElement.value.play().catch(console.error)
      }
    }
  } else if (newTrack.audio_source === 'youtube') {
    // Reproduzir via YouTube
    const videoId = extractYouTubeId(newTrack.audio_url || '')
    if (videoId) {
      await createYouTubePlayer(videoId)
      startYouTubeTimeUpdate()
    }
  }
}, { immediate: true })

// Watch para play/pause
watch(() => player.isPlaying, (isPlaying) => {
  if (!player.currentTrack) return

  if (player.currentTrack.audio_source === 'local') {
    if (audioElement.value) {
      if (isPlaying) {
        audioElement.value.play().catch(console.error)
      } else {
        audioElement.value.pause()
      }
    }
  } else if (player.currentTrack.audio_source === 'youtube') {
    if (ytPlayer) {
      if (isPlaying) {
        ytPlayer.playVideo()
      } else {
        ytPlayer.pauseVideo()
      }
    }
  }
})

// Watch para volume
watch(() => player.volume, (newVolume) => {
  if (audioElement.value) {
    audioElement.value.volume = newVolume
  }
  if (ytPlayer) {
    ytPlayer.setVolume(newVolume * 100)
  }
})

// Watch para mute
watch(() => player.isMuted, (isMuted) => {
  if (audioElement.value) {
    audioElement.value.muted = isMuted
  }
  if (ytPlayer) {
    if (isMuted) {
      ytPlayer.mute()
    } else {
      ytPlayer.unMute()
    }
  }
})

// Watch para seek
watch(() => player.currentTime, (newTime, oldTime) => {
  // Só aplicar seek se a diferença for grande (usuário clicou na barra)
  if (Math.abs(newTime - oldTime) > 1) {
    if (player.currentTrack?.audio_source === 'local' && audioElement.value) {
      if (Math.abs(audioElement.value.currentTime - newTime) > 1) {
        audioElement.value.currentTime = newTime
      }
    }
  }
})

onMounted(() => {
  // Pré-carregar YouTube API
  loadYouTubeApi()
})

onUnmounted(() => {
  stopYouTubeTimeUpdate()
  if (ytPlayer) {
    ytPlayer.destroy()
  }
})
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #facc15;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #facc15;
  cursor: pointer;
  border: none;
}
</style>
