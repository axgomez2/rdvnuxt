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
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-stone-100 text-stone-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Aguardando Pagamento',
    paid: 'Pago',
    processing: 'Em Processamento',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  }
  return labels[status] || status
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getOrderDetailUrl = (order: any) => {
  return `/pedido/${order.order_number}`
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
        <NuxtLink 
          v-for="order in orders.data" 
          :key="order.id" 
          :to="getOrderDetailUrl(order)"
          class="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="font-semibold text-stone-900">Pedido #{{ order.order_number }}</p>
              <p class="text-sm text-stone-500">{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="['px-3 py-1 rounded-full text-sm font-medium', getStatusColor(order.status)]">
                {{ getStatusLabel(order.status) }}
              </span>
              <svg class="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
          
          <!-- Resumo dos itens -->
          <div class="flex items-center gap-3 mb-4">
            <div class="flex -space-x-2">
              <div 
                v-for="(item, idx) in order.items?.slice(0, 4)" 
                :key="item.id"
                class="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-stone-100"
                :style="{ zIndex: 4 - Number(idx) }"
              >
                <img 
                  :src="item.cover_image || '/placeholder.svg'" 
                  :alt="item.title"
                  class="w-full h-full object-cover"
                  @error="($event.target as HTMLImageElement).src = '/placeholder.svg'"
                />
              </div>
              <div 
                v-if="order.items_count > 4" 
                class="w-10 h-10 rounded-lg bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-medium text-stone-600"
              >
                +{{ order.items_count - 4 }}
              </div>
            </div>
            <span class="text-sm text-stone-500">
              {{ order.items_count }} {{ order.items_count === 1 ? 'item' : 'itens' }}
            </span>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-stone-100">
            <div class="text-sm text-stone-500">
              <span v-if="order.shipping_method">{{ order.shipping_method }}</span>
              <span v-if="order.tracking_code" class="ml-2 text-yellow-600">
                Rastreio: {{ order.tracking_code }}
              </span>
            </div>
            <span class="text-lg font-bold text-stone-900">{{ order.formatted_total }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
