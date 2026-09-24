<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useWantlistStore } from '~/stores/wantlist'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const wantlistStore = useWantlistStore()

useHead({
  title: 'Wantlist - RDV Discos'
})

onMounted(() => {
  if (authStore.isAuthenticated) {
    wantlistStore.fetchWantlist()
  }
})

const removeFromWantlist = async (vinylStockId: number) => {
  await wantlistStore.toggle(vinylStockId)
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
          <h1 class="text-2xl font-bold text-stone-900">Wantlist</h1>
          <p class="text-stone-500">Discos que você quer ser notificado quando disponíveis</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="wantlistStore.loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4 text-stone-500">Carregando wantlist...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!wantlistStore.items?.length" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 text-stone-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-stone-900">Sua wantlist está vazia</h2>
        <p class="mt-2 text-stone-500">Adicione discos para ser notificado quando estiverem disponíveis.</p>
        <NuxtLink to="/discos-usados" class="mt-6 inline-block bg-yellow-400 text-stone-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300">
          Explorar discos usados
        </NuxtLink>
      </div>

      <!-- Wantlist Items -->
      <div v-else class="space-y-4">
        <div v-for="item in wantlistStore.items" :key="item.id" class="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <img :src="item.vinyl?.cover_image || '/placeholder.svg'" :alt="item.vinyl?.title" class="w-20 h-20 rounded-lg object-cover">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-stone-900 truncate">{{ item.vinyl?.title }}</h3>
            <p class="text-stone-500 truncate">{{ item.vinyl?.artist }}</p>
            <p class="mt-1 text-sm text-orange-600">Aguardando disponibilidade</p>
          </div>
          <button @click="removeFromWantlist(item.vinyl_stock_id)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
