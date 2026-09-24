import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface WishlistItem {
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

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref<WishlistItem[]>([])
  const loading = ref(false)

  const count = computed(() => items.value.length)

  const isInWishlist = (vinylStockId: number) => {
    return items.value.some(item => item.vinyl_stock_id === vinylStockId)
  }

  const fetchWishlist = async () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      items.value = []
      return
    }

    loading.value = true
    try {
      const response = await $fetch<{ data: WishlistItem[] }>('/wishlist', {
        baseURL: config.public.apiBase,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      items.value = response.data || []
    } catch (error) {
      console.error('Error fetching wishlist:', error)
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
      await $fetch('/wishlist/toggle', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: { vinyl_stock_id: vinylStockId }
      })
      await fetchWishlist()
    } catch (error) {
      console.error('Error toggling wishlist:', error)
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
    isInWishlist,
    fetchWishlist,
    toggle,
    clear
  }
})
