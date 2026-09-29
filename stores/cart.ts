import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

interface CartItem {
  id: number
  vinyl_stock_id?: number
  quantity: number
  title?: string
  artist?: string
  price?: number
  originalPrice?: number
  isPromotional?: boolean
  isPreorder?: boolean
  releaseDate?: string
  format?: string
  image?: string
  vinyl?: {
    id: number
    title: string
    artist: string
    cover_image: string
    formatted_price: string
    price: number
  }
}

interface ShippingQuote {
  id: string
  name: string
  company: string
  price: number
  formatted_price: string
  delivery_time: number
  logo?: string
  preorder_note?: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  // Dados de frete
  const shippingPostalCode = ref('')
  const shippingQuotes = ref<ShippingQuote[]>([])
  const selectedShipping = ref<ShippingQuote | null>(null)
  const shippingLoading = ref(false)
  const shippingError = ref('')
  const hasPreorder = ref(false)
  const preorderDate = ref<string | null>(null)

  // Inicializar do localStorage
  if (process.client) {
    const savedPostalCode = localStorage.getItem('shipping_postal_code')
    const savedQuotes = localStorage.getItem('shipping_quotes')
    const savedShipping = localStorage.getItem('selected_shipping')
    
    if (savedPostalCode) shippingPostalCode.value = savedPostalCode
    if (savedQuotes) {
      try { shippingQuotes.value = JSON.parse(savedQuotes) } catch {}
    }
    if (savedShipping) {
      try { selectedShipping.value = JSON.parse(savedShipping) } catch {}
    }
  }

  const count = computed(() => {
    if (!Array.isArray(items.value)) return 0
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })
  
  const total = computed(() => {
    if (!Array.isArray(items.value)) return 0
    return items.value.reduce((sum, item) => {
      const price = item.price || item.vinyl?.price || 0
      return sum + (price * item.quantity)
    }, 0)
  })

  const formattedTotal = computed(() => {
    return `R$ ${total.value.toFixed(2).replace('.', ',')}`
  })

  const shippingCost = computed(() => {
    return selectedShipping.value?.price || 0
  })

  const formattedShippingCost = computed(() => {
    if (!selectedShipping.value) return 'A calcular'
    return selectedShipping.value.formatted_price
  })

  const grandTotal = computed(() => {
    return total.value + shippingCost.value
  })

  const formattedGrandTotal = computed(() => {
    return `R$ ${grandTotal.value.toFixed(2).replace('.', ',')}`
  })

  const isInCart = (vinylId: number) => {
    if (!Array.isArray(items.value)) return false
    return items.value.some(item => (item.id === vinylId || item.vinyl_stock_id === vinylId))
  }

  const saveShippingToStorage = () => {
    if (process.client) {
      localStorage.setItem('shipping_postal_code', shippingPostalCode.value)
      localStorage.setItem('shipping_quotes', JSON.stringify(shippingQuotes.value))
      localStorage.setItem('selected_shipping', JSON.stringify(selectedShipping.value))
    }
  }

  const clearShipping = () => {
    shippingQuotes.value = []
    selectedShipping.value = null
    shippingError.value = ''
    hasPreorder.value = false
    preorderDate.value = null
    saveShippingToStorage()
  }

  const fetchCart = async () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      items.value = []
      return
    }

    loading.value = true
    try {
      const response = await $fetch<{ data: any }>('/cart', {
        baseURL: config.public.apiBase,
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      
      // A API pode retornar { items: [...] } ou diretamente [...]
      const cartData = response.data
      if (cartData && Array.isArray(cartData.items)) {
        items.value = cartData.items.map((it: any) => ({
          id: it.id,
          vinyl_stock_id: it.vinyl_stock_id || it.id,
          title: it.title,
          artist: it.artist,
          price: it.price,
          originalPrice: it.originalPrice,
          isPromotional: it.isPromotional,
          isPreorder: it.isPreorder,
          releaseDate: it.releaseDate,
          format: it.format,
          image: it.image,
          quantity: it.quantity,
          vinyl: it.vinyl
        }))
      } else if (Array.isArray(cartData)) {
        items.value = cartData
      } else {
        items.value = []
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error)
      items.value = []
      if (error?.status === 401 || error?.message?.includes('Failed to fetch')) {
        return
      }
    } finally {
      loading.value = false
    }
  }

  const addItem = async (product: any, quantity: number = 1) => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) return false

    try {
      await $fetch('/cart/items', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: { vinyl_stock_id: product.id || product.vinyl_stock_id, quantity }
      })
      await fetchCart()
      clearShipping() // Limpar frete ao adicionar item
      return true
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
      await $fetch(`/cart/items/${itemId}`, {
        baseURL: config.public.apiBase,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      await fetchCart()
      clearShipping() // Limpar frete ao remover item
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) return

    const newQuantity = Math.max(1, quantity)

    try {
      await $fetch(`/cart/items/${itemId}`, {
        baseURL: config.public.apiBase,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: { quantity: newQuantity }
      })
      await fetchCart()
      clearShipping() // Limpar frete ao alterar quantidade
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  }

  const calculateShipping = async (postalCode: string) => {
    const config = useRuntimeConfig()
    
    if (!postalCode || items.value.length === 0) {
      shippingError.value = 'Informe um CEP válido'
      return
    }

    shippingLoading.value = true
    shippingError.value = ''
    shippingPostalCode.value = postalCode

    try {
      const response = await $fetch<{ success: boolean; data: any; message?: string }>('/shipping/calculate', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: {
          postal_code: postalCode,
          items: items.value.map(item => ({
            id: item.id || item.vinyl_stock_id,
            quantity: item.quantity
          }))
        }
      })

      if (response.success) {
        shippingQuotes.value = response.data.quotes || []
        hasPreorder.value = response.data.has_preorder || false
        preorderDate.value = response.data.preorder_date_formatted || null
        
        // Se tinha um frete selecionado anteriormente, tentar manter
        if (selectedShipping.value) {
          const stillAvailable = shippingQuotes.value.find(q => q.id === selectedShipping.value?.id)
          if (stillAvailable) {
            selectedShipping.value = stillAvailable
          } else {
            selectedShipping.value = null
          }
        }
        
        saveShippingToStorage()
      } else {
        shippingError.value = response.message || 'Erro ao calcular frete'
        shippingQuotes.value = []
      }
    } catch (error: any) {
      shippingError.value = error?.data?.message || 'Erro ao calcular frete. Verifique o CEP.'
      shippingQuotes.value = []
    } finally {
      shippingLoading.value = false
    }
  }

  const selectShipping = (quote: ShippingQuote) => {
    selectedShipping.value = quote
    saveShippingToStorage()
  }

  const clearCart = () => {
    items.value = []
    clearShipping()
  }

  return {
    items,
    loading,
    count,
    total,
    formattedTotal,
    shippingPostalCode,
    shippingQuotes,
    selectedShipping,
    shippingLoading,
    shippingError,
    shippingCost,
    formattedShippingCost,
    grandTotal,
    formattedGrandTotal,
    hasPreorder,
    preorderDate,
    isInCart,
    fetchCart,
    addItem,
    removeItem,
    updateQuantity,
    calculateShipping,
    selectShipping,
    clearShipping,
    clearCart
  }
})
