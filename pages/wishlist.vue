<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useWishlistStore } from '~/stores/wishlist'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

useHead({
  title: 'Wishlist - RDV Discos'
})

onMounted(() => {
  if (authStore.isAuthenticated) {
    wishlistStore.fetchWishlist()
  }
})

const removeFromWishlist = async (vinylStockId: number) => {
  await wishlistStore.toggle(vinylStockId)
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/minha-conta" class="p-2 hover:bg-stone-200 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-stone-900">Wishlist</h1>
          <p class="text-stone-500">Discos que você deseja comprar</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="wishlistStore.loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4 text-stone-500">Carregando wishlist...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!wishlistStore.items?.length" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 text-stone-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-stone-900">Sua wishlist está vazia</h2>
        <p class="mt-2 text-stone-500">Adicione discos que você deseja comprar.</p>
        <NuxtLink to="/discos-novos" class="mt-6 inline-block bg-yellow-400 text-stone-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300">
          Explorar discos
        </NuxtLink>
      </div>

      <!-- Wishlist Items -->
      <div v-else class="space-y-4">
        <div v-for="item in wishlistStore.items" :key="item.id" class="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <img :src="item.vinyl?.cover_image || '/placeholder.svg'" :alt="item.vinyl?.title" class="w-20 h-20 rounded-lg object-cover">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-stone-900 truncate">{{ item.vinyl?.title }}</h3>
            <p class="text-stone-500 truncate">{{ item.vinyl?.artist }}</p>
            <p class="mt-1 font-bold text-stone-900">{{ item.vinyl?.formatted_price }}</p>
          </div>
          <div class="flex gap-2">
            <button class="bg-yellow-400 text-stone-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300">
              Comprar
            </button>
            <button @click="removeFromWishlist(item.vinyl_stock_id)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
