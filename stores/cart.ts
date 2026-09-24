import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface CartItem {
  id: number
  vinyl_stock_id: number
  quantity: number
  vinyl?: {
    id: number
    title: string
    artist: string
    cover_image: string
    formatted_price: string
    price: number
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  
  const total = computed(() => {
    return items.value.reduce((sum, item) => {
      const price = item.vinyl?.price || 0
      return sum + (price * item.quantity)
    }, 0)
  })

  const formattedTotal = computed(() => {
    return `R$ ${total.value.toFixed(2).replace('.', ',')}`
  })

  const fetchCart = async () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      items.value = []
      return
    }

    loading.value = true
    try {
      const response = await $fetch<{ data: CartItem[] }>('/cart', {
        baseURL: config.public.apiBase,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      items.value = response.data || []
    } catch (error) {
      console.error('Error fetching cart:', error)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const addItem = async (vinylStockId: number, quantity: number = 1) => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) return

    try {
      await $fetch('/cart', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: { vinyl_stock_id: vinylStockId, quantity }
      })
      await fetchCart()
    } catch (error) {
      console.error('Error adding to cart:', error)
      throw error
    }
  }

  const removeItem = async (itemId: number) => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) return

    try {
      await $fetch(`/cart/${itemId}`, {
        baseURL: config.public.apiBase,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      await fetchCart()
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    }
  }

  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    loading,
    count,
    total,
    formattedTotal,
    fetchCart,
    addItem,
    removeItem,
    clearCart
  }
})
