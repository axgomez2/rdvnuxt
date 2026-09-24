import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface WantlistItem {
  id: number
  vinyl_stock_id: number
  vinyl?: {
    id: number
    title: string
    artist: string
    cover_image: string
    formatted_price: string
  }
}

export const useWantlistStore = defineStore('wantlist', () => {
  const items = ref<WantlistItem[]>([])
  const loading = ref(false)

  const count = computed(() => items.value.length)

  const isInWantlist = (vinylStockId: number) => {
    return items.value.some(item => item.vinyl_stock_id === vinylStockId)
  }

  const fetchWantlist = async () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      items.value = []
      return
    }

    loading.value = true
    try {
      const response = await $fetch<{ data: WantlistItem[] }>('/wantlist', {
        baseURL: config.public.apiBase,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      items.value = response.data || []
    } catch (error) {
      console.error('Error fetching wantlist:', error)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const toggle = async (vinylStockId: number) => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) return

    try {
      await $fetch('/wantlist/toggle', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: { vinyl_stock_id: vinylStockId }
      })
      await fetchWantlist()
    } catch (error) {
      console.error('Error toggling wantlist:', error)
      throw error
    }
  }

  const clear = () => {
    items.value = []
  }

  return {
    items,
    loading,
    count,
    isInWantlist,
    fetchWantlist,
    toggle,
    clear
  }
})
