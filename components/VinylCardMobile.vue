<template>
  <div class="bg-white rounded-xl overflow-hidden shadow-md border border-stone-200">
    <NuxtLink :to="vinylDetailRoute" class="block">
      <!-- Imagem -->
      <div class="relative aspect-square overflow-hidden bg-stone-100">
        <img 
          :src="coverImage" 
          :alt="vinyl.title"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        
        <!-- Badges -->
        <div class="absolute top-2 left-2 flex flex-col gap-1">
          <span v-if="isPreorder" class="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            EM BREVE
          </span>
          <span v-else-if="vinyl.is_promotional && inStock" class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            OFERTA
          </span>
          <span v-else-if="!inStock" class="bg-stone-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            ESGOTADO
          </span>
        </div>

        <!-- Data de lançamento para pré-venda -->
        <div v-if="isPreorder && vinyl.formatted_release_date" class="absolute bottom-2 left-2 right-2">
          <div class="bg-purple-600/90 text-white text-[10px] font-medium px-2 py-1 rounded text-center">
            Estoque em: {{ vinyl.formatted_release_date }}
          </div>
        </div>
        
        <!-- Overlay para indisponível -->
        <div v-if="!inStock && !isPreorder" class="absolute inset-0 bg-black/20"></div>
      </div>

      <!-- Info -->
      <div class="p-3">
        <p class="text-yellow-600 text-xs font-medium truncate">{{ vinyl.artist }}</p>
        <h3 class="text-stone-900 text-sm font-semibold truncate mt-0.5" :title="vinyl.title">{{ vinyl.title }}</h3>
        
        <!-- Preço -->
        <div class="flex items-center gap-1 mt-2">
          <span class="text-stone-900 font-bold">{{ formattedPrice }}</span>
          <span v-if="vinyl.is_promotional && vinyl.formatted_original_price" class="text-stone-400 text-xs line-through">
            {{ vinyl.formatted_original_price }}
          </span>
        </div>
      </div>
    </NuxtLink>
    
    <!-- Ações -->
    <div class="flex items-center justify-between px-3 pb-3 gap-2">
      <!-- Play -->
      <button 
        @click.stop="openPlayer"
        :disabled="!hasPlayableTracks"
        class="w-8 h-8 rounded-full flex items-center justify-center"
        :class="hasPlayableTracks 
          ? 'bg-stone-100 text-stone-600' 
          : 'bg-stone-50 text-stone-300 cursor-not-allowed'"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
      
      <!-- Wishlist/Wantlist -->
      <button 
        @click.stop="toggleList"
        class="w-8 h-8 rounded-full flex items-center justify-center"
        :class="listButtonClass"
      >
        <svg v-if="showWishlist" class="w-4 h-4" :fill="isInWishlist ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
      </button>
      
      <!-- Carrinho ou Notificar -->
      <button 
        v-if="canBuy"
        @click.stop="addToCart"
        class="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium"
        :class="cartButtonClass"
      >
        <svg v-if="!isInCart" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <svg v-else class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        {{ isInCart ? 'No carrinho' : (isPreorder ? 'Reservar' : 'Comprar') }}
      </button>
      
      <!-- Notificar quando indisponível -->
      <button 
        v-else
        @click.stop="notifyWhenAvailable"
        class="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium"
        :class="isInWantlist ? 'bg-purple-500 text-white' : 'bg-stone-200 text-stone-600'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        {{ isInWantlist ? 'Avisando' : 'Avise-me' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { usePlayerStore } from '~/stores/player'
import { useWishlistStore } from '~/stores/wishlist'
import { useWantlistStore } from '~/stores/wantlist'
import { useAuthStore } from '~/stores/auth'
import type { Vinyl } from '~/types'

const props = defineProps<{
  vinyl: Vinyl
}>()

const config = useRuntimeConfig()
const authStore = useAuthStore()
const cartStore = useCartStore()
const playerStore = usePlayerStore()
const wishlistStore = useWishlistStore()
const wantlistStore = useWantlistStore()

// Computed - Estados
const inStock = computed(() => props.vinyl.in_stock ?? (props.vinyl.stock ?? 0) > 0)
const isPreorder = computed(() => props.vinyl.availability === 'preorder' || props.vinyl.is_preorder)
const canBuy = computed(() => props.vinyl.can_buy ?? (inStock.value || isPreorder.value))
const showWishlist = computed(() => props.vinyl.show_wishlist ?? (inStock.value || isPreorder.value))
const hasPlayableTracks = computed(() => props.vinyl.has_playable_tracks || (props.vinyl.tracks?.length ?? 0) > 0)

// Computed - Stores
const isInWishlist = computed(() => wishlistStore.isInWishlist(props.vinyl.id))
const isInWantlist = computed(() => wantlistStore.isInWantlist(props.vinyl.id))
const isInCart = computed(() => cartStore.items.some(item => item.vinyl_stock_id === props.vinyl.id))

// Computed - Imagem
const backendOrigin = computed(() =>
  (config.public.apiBase as string || '').replace(/\/api\/?$/, '')
)

const coverImage = computed(() => {
  const raw = props.vinyl.cover_image || props.vinyl.image_url || ''
  if (!raw) return PLACEHOLDER_IMG
  if (/^https?:\/\//i.test(raw)) return raw
  return `${backendOrigin.value}${raw.startsWith('/') ? '' : '/'}${raw}`
})

// Computed - Formatação
const formattedPrice = computed(() => {
  if (props.vinyl.formatted_price) return props.vinyl.formatted_price
  if (props.vinyl.price != null) return `R$ ${props.vinyl.price.toFixed(2).replace('.', ',')}`
  return 'R$ 0,00'
})

// Computed - Rota
const generateSlug = (text?: string) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const vinylDetailRoute = computed(() => {
  const artistSlug = generateSlug(props.vinyl.artist) || 'artista'
  const titleSlug = generateSlug(props.vinyl.title) || 'disco'
  return `/disco/${artistSlug}/${titleSlug}-${props.vinyl.id}`
})

// Computed - Botões
const listButtonClass = computed(() => {
  if (showWishlist.value) {
    return isInWishlist.value ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-600'
  }
  return isInWantlist.value ? 'bg-purple-500 text-white' : 'bg-stone-100 text-stone-600'
})

const cartButtonClass = computed(() => {
  return isInCart.value ? 'bg-green-500 text-white' : 'bg-yellow-400 text-stone-900'
})

// Placeholder
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f5f5f4"/><circle cx="200" cy="200" r="120" fill="#e7e5e4"/><circle cx="200" cy="200" r="40" fill="#d6d3d1"/><circle cx="200" cy="200" r="8" fill="#a8a29e"/></svg>`
)

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target.dataset.fallback === '1') return
  target.dataset.fallback = '1'
  target.src = PLACEHOLDER_IMG
}

// Actions
const toggleList = async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  if (showWishlist.value) {
    await wishlistStore.toggle(props.vinyl.id)
  } else {
    await wantlistStore.toggle(props.vinyl.id)
  }
}

const openPlayer = () => {
  if (hasPlayableTracks.value) {
    playerStore.loadVinyl({
      id: props.vinyl.id,
      title: props.vinyl.title,
      artist: props.vinyl.artist,
      cover_image: coverImage.value,
      tracks: props.vinyl.tracks || []
    })
    playerStore.play()
  }
}

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  if (canBuy.value) {
    if (isInCart.value) {
      const item = cartStore.items.find(i => i.vinyl_stock_id === props.vinyl.id)
      if (item) await cartStore.removeItem(item.id)
    } else {
      await cartStore.addItem(props.vinyl.id)
    }
  }
}

const notifyWhenAvailable = async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
    return
  }
  
  await wantlistStore.toggle(props.vinyl.id)
}
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
