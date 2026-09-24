import { defineStore } from 'pinia'

interface Track {
  id: number
  name: string
  position: string
  duration?: string
  duration_seconds?: number
  audio_url?: string
  audio_source?: 'local' | 'youtube'
  has_audio?: boolean
}

interface PlayerVinyl {
  id: number
  title: string
  artist: string
  cover_image: string
  tracks: Track[]
}

export const usePlayerStore = defineStore('player', () => {
  // Estado do player
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentVinyl = ref<PlayerVinyl | null>(null)
  const currentTrack = ref<Track | null>(null)
  const currentTrackIndex = ref(0)
  const playlist = ref<Track[]>([])
  const volume = ref(0.8)
  const isMuted = ref(false)
  const isRepeat = ref(false)
  const isShuffle = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const isMinimized = ref(false)
  const isVisible = ref(false)

  // Computed
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  const hasNext = computed(() => {
    if (playlist.value.length === 0) return false
    return currentTrackIndex.value < playlist.value.length - 1 || isRepeat.value
  })

  const hasPrevious = computed(() => {
    if (playlist.value.length === 0) return false
    return currentTrackIndex.value > 0 || isRepeat.value
  })

  const playableTracks = computed(() => {
    return playlist.value.filter(track => track.has_audio)
  })

  // Helpers
  function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Actions
  function loadVinyl(vinyl: PlayerVinyl) {
    if (!vinyl || !vinyl.tracks || vinyl.tracks.length === 0) {
      console.warn('Vinyl sem tracks para reproduzir')
      return
    }

    currentVinyl.value = vinyl
    playlist.value = vinyl.tracks.filter(track => track.has_audio)
    
    if (playlist.value.length === 0) {
      console.warn('Nenhuma track com áudio disponível')
      return
    }

    currentTrackIndex.value = 0
    currentTrack.value = playlist.value[0]
    isVisible.value = true
    isMinimized.value = false
  }

  function play() {
    if (!currentTrack.value) return
    isPlaying.value = true
  }

  function pause() {
    isPlaying.value = false
  }

  function togglePlay() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  function stop() {
    isPlaying.value = false
    currentTime.value = 0
  }

  function next() {
    if (playlist.value.length === 0) return

    if (isShuffle.value) {
      const randomIndex = Math.floor(Math.random() * playlist.value.length)
      currentTrackIndex.value = randomIndex
    } else if (currentTrackIndex.value < playlist.value.length - 1) {
      currentTrackIndex.value++
    } else if (isRepeat.value) {
      currentTrackIndex.value = 0
    } else {
      stop()
      return
    }

    currentTrack.value = playlist.value[currentTrackIndex.value]
    currentTime.value = 0
    play()
  }

  function previous() {
    if (playlist.value.length === 0) return

    // Se estiver nos primeiros 3 segundos, volta para a track anterior
    if (currentTime.value > 3) {
      currentTime.value = 0
      return
    }

    if (currentTrackIndex.value > 0) {
      currentTrackIndex.value--
    } else if (isRepeat.value) {
      currentTrackIndex.value = playlist.value.length - 1
    } else {
      currentTime.value = 0
      return
    }

    currentTrack.value = playlist.value[currentTrackIndex.value]
    currentTime.value = 0
    play()
  }

  function selectTrack(index: number) {
    if (index < 0 || index >= playlist.value.length) return
    
    currentTrackIndex.value = index
    currentTrack.value = playlist.value[index]
    currentTime.value = 0
    play()
  }

  function playTrack(track: Track) {
    if (!track || !track.audio_url) return
    
    const index = playlist.value.findIndex(t => t.id === track.id)
    
    if (index >= 0) {
      selectTrack(index)
    } else {
      currentTrack.value = track
      currentTime.value = 0
      play()
    }
  }

  function seek(time: number) {
    currentTime.value = time
  }

  function seekPercent(percent: number) {
    if (duration.value > 0) {
      currentTime.value = (percent / 100) * duration.value
    }
  }

  function setVolume(value: number) {
    volume.value = Math.max(0, Math.min(1, value))
    if (volume.value > 0) {
      isMuted.value = false
    }
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
  }

  function toggleRepeat() {
    isRepeat.value = !isRepeat.value
  }

  function toggleShuffle() {
    isShuffle.value = !isShuffle.value
  }

  function toggleMinimize() {
    isMinimized.value = !isMinimized.value
  }

  function close() {
    stop()
    isVisible.value = false
    currentVinyl.value = null
    currentTrack.value = null
    playlist.value = []
    currentTrackIndex.value = 0
  }

  function updateTime(time: number) {
    currentTime.value = time
  }

  function updateDuration(dur: number) {
    duration.value = dur
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function onTrackEnded() {
    next()
  }

  return {
    // State
    isPlaying,
    isLoading,
    currentVinyl,
    currentTrack,
    currentTrackIndex,
    playlist,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    currentTime,
    duration,
    isMinimized,
    isVisible,
    // Computed
    progress,
    formattedCurrentTime,
    formattedDuration,
    hasNext,
    hasPrevious,
    playableTracks,
    // Actions
    loadVinyl,
    play,
    pause,
    togglePlay,
    stop,
    next,
    previous,
    selectTrack,
    playTrack,
    seek,
    seekPercent,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleMinimize,
    close,
    updateTime,
    updateDuration,
    setLoading,
    onTrackEnded,
  }
})
