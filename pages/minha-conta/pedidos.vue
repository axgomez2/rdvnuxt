<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

useHead({
  title: 'Meus Pedidos - RDV Discos'
})

const { data: orders, pending, error } = await useFetch<{ data: any[] }>('/orders', {
  baseURL: config.public.apiBase,
  headers: {
    Authorization: `Bearer ${authStore.token}`
  }
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  }
  return labels[status] || status
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
        <h1 class="text-2xl font-bold text-stone-900">Meus Pedidos</h1>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4 text-stone-500">Carregando pedidos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl">
        Erro ao carregar pedidos. Tente novamente.
      </div>

      <!-- Empty -->
      <div v-else-if="!orders?.data?.length" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 text-stone-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-stone-900">Nenhum pedido encontrado</h2>
        <p class="mt-2 text-stone-500">Você ainda não fez nenhum pedido.</p>
        <NuxtLink to="/discos-novos" class="mt-6 inline-block bg-yellow-400 text-stone-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300">
          Explorar discos
        </NuxtLink>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-4">
        <div v-for="order in orders.data" :key="order.id" class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm text-stone-500">Pedido #{{ order.id }}</p>
              <p class="text-sm text-stone-500">{{ new Date(order.created_at).toLocaleDateString('pt-BR') }}</p>
            </div>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusColor(order.status)]">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
          
          <div class="border-t pt-4">
            <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4 py-2">
              <img :src="item.vinyl?.cover_image || '/placeholder.svg'" :alt="item.vinyl?.title" class="w-12 h-12 rounded object-cover">
              <div class="flex-1">
                <p class="font-medium text-stone-900">{{ item.vinyl?.title }}</p>
                <p class="text-sm text-stone-500">{{ item.vinyl?.artist }}</p>
              </div>
              <p class="font-medium">{{ item.formatted_price }}</p>
            </div>
          </div>

          <div class="border-t pt-4 mt-4 flex justify-between items-center">
            <span class="text-stone-500">Total</span>
            <span class="text-xl font-bold text-stone-900">{{ order.formatted_total }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
