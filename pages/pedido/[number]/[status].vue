<template>
  <div class="min-h-screen bg-stone-50">
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <!-- Loading -->
      <div v-if="loading" class="py-20 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-stone-500 mt-4">Carregando pedido...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="py-20 text-center">
        <svg class="mx-auto h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="text-stone-700 mt-4 font-medium">Pedido não encontrado</p>
        <NuxtLink to="/minha-conta/pedidos" class="text-yellow-600 hover:underline mt-2 inline-block">
          Ver meus pedidos
        </NuxtLink>
      </div>

      <template v-else-if="order">
        <!-- Status Header -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
          <!-- Sucesso -->
          <template v-if="statusType === 'sucesso'">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-stone-900">Pagamento Confirmado!</h1>
            <p class="text-stone-600 mt-2">Seu pedido foi aprovado e está sendo processado.</p>
          </template>

          <!-- Pendente -->
          <template v-else-if="statusType === 'pendente'">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-stone-900">Aguardando Pagamento</h1>
            <p class="text-stone-600 mt-2">Seu pedido foi registrado e está aguardando confirmação do pagamento.</p>
          </template>

          <!-- Cancelado -->
          <template v-else-if="statusType === 'cancelado'">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-stone-900">Pedido Cancelado</h1>
            <p class="text-stone-600 mt-2">Este pedido foi cancelado.</p>
          </template>

          <!-- Outros -->
          <template v-else>
            <div class="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-stone-900">Pedido #{{ order.order_number }}</h1>
            <p class="text-stone-600 mt-2">Status: {{ order.status }}</p>
          </template>
        </div>

        <!-- Detalhes do Pedido -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="px-6 py-4 border-b border-stone-200">
            <h2 class="font-semibold text-stone-900">Detalhes do Pedido</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex justify-between">
              <span class="text-stone-600">Número do pedido</span>
              <span class="font-medium text-stone-900">#{{ order.order_number }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600">Data</span>
              <span class="font-medium text-stone-900">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-600">Status</span>
              <span 
                class="px-2 py-1 rounded text-xs font-medium"
                :class="getStatusClass(order.status)"
              >
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <div v-if="order.payment_method" class="flex justify-between">
              <span class="text-stone-600">Forma de pagamento</span>
              <span class="font-medium text-stone-900">{{ getPaymentMethodLabel(order.payment_method) }}</span>
            </div>
          </div>
        </div>

        <!-- Itens -->
        <div v-if="order.items?.length > 0" class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="px-6 py-4 border-b border-stone-200">
            <h2 class="font-semibold text-stone-900">Itens do Pedido</h2>
          </div>
          <div class="divide-y divide-stone-100">
            <div v-for="item in order.items" :key="item.id" class="p-4 flex items-center gap-4">
              <div class="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  v-if="item.cover_image" 
                  :src="item.cover_image" 
                  :alt="item.title"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-stone-900 truncate">{{ item.title }}</p>
                <p class="text-sm text-stone-500">{{ item.artist }}</p>
                <p class="text-sm text-stone-500">Qtd: {{ item.quantity }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-stone-900">R$ {{ formatPrice(item.total_price || item.unit_price * item.quantity) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Totais -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="p-6 space-y-3">
            <div class="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>R$ {{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-stone-600">
              <span>Frete</span>
              <span>R$ {{ formatPrice(order.shipping_cost) }}</span>
            </div>
            <div v-if="order.discount > 0" class="flex justify-between text-green-600">
              <span>Desconto</span>
              <span>- R$ {{ formatPrice(order.discount) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold text-stone-900 pt-3 border-t border-stone-200">
              <span>Total</span>
              <span>R$ {{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Endereço de Entrega -->
        <div v-if="order.shipping_address" class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="px-6 py-4 border-b border-stone-200">
            <h2 class="font-semibold text-stone-900">Endereço de Entrega</h2>
          </div>
          <div class="p-6">
            <p class="text-stone-900">{{ order.shipping_address.street }}, {{ order.shipping_address.number }}</p>
            <p v-if="order.shipping_address.complement" class="text-stone-600">{{ order.shipping_address.complement }}</p>
            <p class="text-stone-600">{{ order.shipping_address.neighborhood }}</p>
            <p class="text-stone-600">{{ order.shipping_address.city }} - {{ order.shipping_address.state }}</p>
            <p class="text-stone-600">CEP: {{ order.shipping_address.zip_code || order.shipping_address.zipcode }}</p>
          </div>
        </div>

        <!-- Ações -->
        <div class="flex flex-col sm:flex-row gap-3">
          <NuxtLink 
            to="/minha-conta/pedidos" 
            class="flex-1 bg-white border border-stone-300 text-stone-700 py-3 px-6 rounded-lg font-medium text-center hover:bg-stone-50 transition-colors"
          >
            Ver Meus Pedidos
          </NuxtLink>
          <NuxtLink 
            to="/" 
            class="flex-1 bg-yellow-400 text-stone-900 py-3 px-6 rounded-lg font-medium text-center hover:bg-yellow-500 transition-colors"
          >
            Continuar Comprando
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const cartStore = useCartStore()

const orderNumber = computed(() => route.params.number as string)
const statusType = computed(() => route.params.status as string)

const loading = ref(true)
const error = ref(false)
const order = ref<any>(null)

const fetchOrder = async () => {
  loading.value = true
  error.value = false
  
  try {
    // Aguardar autenticação ser inicializada
    if (!authStore.authInitialized) {
      await authStore.initializeAuth()
    }
    
    // Aguardar um pouco para garantir que o token está disponível
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (!authStore.token) {
      console.error('Token não disponível')
      error.value = true
      return
    }
    
    console.log('Buscando pedido:', orderNumber.value)
    console.log('Token disponível:', !!authStore.token)
    
    const response = await $fetch<{ data: any }>(`/orders/${orderNumber.value}`, {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    console.log('Resposta do pedido:', response)
    order.value = response.data
    
    // Se o pedido foi pago/aprovado, limpar o carrinho
    if (statusType.value === 'sucesso' || order.value?.status === 'paid') {
      cartStore.clearCart()
    }
  } catch (err: any) {
    console.error('Erro ao carregar pedido:', err)
    console.error('Status:', err?.status)
    console.error('Data:', err?.data)
    error.value = true
  } finally {
    loading.value = false
  }
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

const formatPrice = (value: number) => {
  return (value || 0).toFixed(2).replace('.', ',')
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'pending': 'Aguardando Pagamento',
    'paid': 'Pago',
    'processing': 'Em Processamento',
    'shipped': 'Enviado',
    'delivered': 'Entregue',
    'cancelled': 'Cancelado',
    'refunded': 'Reembolsado'
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'paid': 'bg-green-100 text-green-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'refunded': 'bg-stone-100 text-stone-800'
  }
  return classes[status] || 'bg-stone-100 text-stone-800'
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    'pix': 'PIX',
    'checkout_pro': 'Mercado Pago',
    'whatsapp': 'WhatsApp',
    'credit_card': 'Cartão de Crédito',
    'boleto': 'Boleto'
  }
  return labels[method] || method
}

onMounted(() => {
  fetchOrder()
})

useHead({
  title: () => order.value ? `Pedido #${order.value.order_number} - RDV Discos` : 'Pedido - RDV Discos'
})
</script>
