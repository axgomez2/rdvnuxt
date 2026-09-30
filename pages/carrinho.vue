<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

useHead({
  title: 'Carrinho - RDV Discos'
})

const postalCodeInput = ref(cartStore.shippingPostalCode || '')
const quantityError = ref<string | null>(null)
const updatingItem = ref<number | null>(null)

const handleCalculateShipping = () => {
  if (postalCodeInput.value) {
    cartStore.calculateShipping(postalCodeInput.value.replace(/\D/g, ''))
  }
}

// Resolver URL da imagem
const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '/placeholder.svg'
  if (url.startsWith('http')) return url
  return `${config.public.apiBase.replace('/api', '')}${url}`
}

// Formatar preço
const formatPrice = (price: number) => {
  return `R$ ${price.toFixed(2).replace('.', ',')}`
}

// Verificar se pode aumentar quantidade (considerando estoque)
const canIncreaseQuantity = (item: any) => {
  // Se é pré-venda, não tem limite
  if (item.isPreorder) return true
  // Verifica estoque disponível
  const stock = item.stock || item.vinyl?.stock || 999
  return item.quantity < stock
}

// Obter estoque do item
const getItemStock = (item: any) => {
  return item.stock || item.vinyl?.stock || null
}

// Atualizar quantidade com validação
const updateQuantity = async (item: any, newQuantity: number) => {
  const stock = getItemStock(item)
  
  // Validar quantidade mínima
  if (newQuantity < 1) return
  
  // Validar estoque (se não for pré-venda)
  if (!item.isPreorder && stock && newQuantity > stock) {
    quantityError.value = `Quantidade máxima disponível: ${stock}`
    setTimeout(() => quantityError.value = null, 3000)
    return
  }
  
  updatingItem.value = item.id
  try {
    await cartStore.updateQuantity(item.id, newQuantity)
  } catch (error: any) {
    quantityError.value = error?.data?.message || 'Erro ao atualizar quantidade'
    setTimeout(() => quantityError.value = null, 3000)
  } finally {
    updatingItem.value = null
  }
}

// Buscar endereço padrão do cliente
const fetchDefaultAddress = async () => {
  if (!authStore.isAuthenticated) return
  
  try {
    const response = await $fetch<{ data: any[] }>('/addresses', {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    const addresses = response.data || []
    const defaultAddress = addresses.find((a: any) => a.is_default) || addresses[0]
    
    if (defaultAddress?.zip_code) {
      postalCodeInput.value = defaultAddress.zip_code
      cartStore.calculateShipping(defaultAddress.zip_code.replace(/\D/g, ''))
    }
  } catch (error) {
    console.error('Erro ao buscar endereço:', error)
  }
}

onMounted(async () => {
  // Buscar carrinho
  await cartStore.fetchCart()
  
  // Se já tem CEP salvo, usar ele
  if (cartStore.shippingPostalCode) {
    postalCodeInput.value = cartStore.shippingPostalCode
    return
  }

  // Se está logado, buscar endereço padrão
  await fetchDefaultAddress()
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <h1 class="text-3xl font-bold text-stone-900 mb-8">Carrinho</h1>
      
      <!-- Carrinho Vazio -->
      <div v-if="!cartStore.items?.length" class="text-center py-16 bg-white rounded-xl shadow-sm">
        <div class="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-stone-900 mb-2">Seu carrinho está vazio</h2>
        <p class="text-stone-500 mb-6">Adicione alguns discos incríveis!</p>
        <NuxtLink to="/discos-novos" class="inline-block bg-yellow-400 text-stone-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors">
          Ver Discos
        </NuxtLink>
      </div>
      
      <!-- Carrinho com Itens -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Lista de Itens -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Erro de quantidade -->
          <div v-if="quantityError" class="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            {{ quantityError }}
          </div>
          
          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="bg-white rounded-xl shadow-sm p-4 flex gap-4"
          >
            <!-- Imagem -->
            <div class="w-24 h-24 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden">
              <img 
                :src="resolveImageUrl(item.image || item.vinyl?.cover_image)" 
                :alt="item.title || item.vinyl?.title"
                class="w-full h-full object-cover"
                @error="($event.target as HTMLImageElement).src = '/placeholder.svg'"
              />
            </div>
            
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2">
                <h3 class="font-semibold text-stone-900 truncate">{{ item.title || item.vinyl?.title }}</h3>
                <span v-if="item.isPreorder" class="flex-shrink-0 text-xs bg-purple-600 text-white px-2 py-0.5 rounded">Pré-venda</span>
              </div>
              <p class="text-stone-500 text-sm">{{ item.artist || item.vinyl?.artist }}</p>
              <div class="mt-1 flex items-center gap-2">
                <p class="text-yellow-600 font-semibold">
                  {{ formatPrice(item.price || item.vinyl?.price || 0) }}
                </p>
                <p v-if="item.isPromotional && item.originalPrice" class="text-stone-400 text-sm line-through">
                  {{ formatPrice(item.originalPrice) }}
                </p>
              </div>
              <!-- Info de estoque -->
              <p v-if="getItemStock(item) && !item.isPreorder" class="text-xs text-stone-400 mt-1">
                {{ getItemStock(item) }} em estoque
              </p>
            </div>
            
            <!-- Quantidade -->
            <div class="flex flex-col items-center gap-1">
              <div class="flex items-center gap-2">
                <button 
                  @click="updateQuantity(item, item.quantity - 1)"
                  class="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-200 transition-colors disabled:opacity-50"
                  :disabled="item.quantity <= 1 || updatingItem === item.id"
                >
                  -
                </button>
                <span class="w-8 text-center text-stone-900">
                  <template v-if="updatingItem === item.id">
                    <svg class="w-4 h-4 animate-spin mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  </template>
                  <template v-else>{{ item.quantity }}</template>
                </span>
                <button 
                  @click="updateQuantity(item, item.quantity + 1)"
                  class="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-700 hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!canIncreaseQuantity(item) || updatingItem === item.id"
                  :title="!canIncreaseQuantity(item) ? 'Quantidade máxima atingida' : ''"
                >
                  +
                </button>
              </div>
              <!-- Aviso de limite -->
              <span v-if="!canIncreaseQuantity(item)" class="text-xs text-orange-500">
                Máx. atingido
              </span>
            </div>
            
            <!-- Remover -->
            <button 
              @click="cartStore.removeItem(item.id)"
              class="p-2 text-stone-400 hover:text-red-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>

          <!-- Simulador de Frete -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              Calcular Frete
            </h3>

            <!-- Input CEP -->
            <div class="flex gap-3 mb-4">
              <div class="flex-1">
                <input
                  v-model="postalCodeInput"
                  type="text"
                  maxlength="9"
                  placeholder="Digite seu CEP"
                  class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                  @keyup.enter="handleCalculateShipping"
                />
              </div>
              <button
                @click="handleCalculateShipping"
                :disabled="cartStore.shippingLoading || !postalCodeInput"
                class="px-6 py-3 bg-yellow-400 text-stone-900 rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg v-if="cartStore.shippingLoading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ cartStore.shippingLoading ? 'Calculando...' : 'Calcular' }}
              </button>
            </div>

            <!-- Link para buscar CEP -->
            <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" class="text-sm text-stone-500 hover:text-yellow-600 transition-colors">
              Não sei meu CEP
            </a>

            <!-- Erro -->
            <div v-if="cartStore.shippingError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {{ cartStore.shippingError }}
            </div>

            <!-- Aviso de Pré-venda -->
            <div v-if="cartStore.hasPreorder && cartStore.preorderDate" class="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 text-sm">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <p class="font-medium">Pedido contém itens em pré-venda</p>
                  <p class="mt-1">O envio será realizado após {{ cartStore.preorderDate }}. Os prazos já consideram esta data.</p>
                </div>
              </div>
            </div>

            <!-- Lista de Opções de Frete -->
            <div v-if="cartStore.shippingQuotes.length > 0" class="mt-4 space-y-3">
              <label
                v-for="quote in cartStore.shippingQuotes"
                :key="quote.id"
                class="flex items-center gap-4 p-4 bg-stone-50 rounded-lg cursor-pointer transition-colors hover:bg-stone-100"
                :class="{ 'ring-2 ring-yellow-400 bg-yellow-50': cartStore.selectedShipping?.id === quote.id }"
              >
                <input
                  type="radio"
                  :value="quote.id"
                  :checked="cartStore.selectedShipping?.id === quote.id"
                  @change="cartStore.selectShipping(quote)"
                  class="w-4 h-4 text-yellow-500 bg-stone-100 border-stone-300 focus:ring-yellow-400"
                />
                <img v-if="quote.logo" :src="quote.logo" :alt="quote.company" class="w-10 h-10 object-contain rounded" />
                <div class="flex-1">
                  <p class="font-medium text-stone-900">{{ quote.name }}</p>
                  <p class="text-sm text-stone-500">{{ quote.company }} • {{ quote.delivery_time }} dias úteis</p>
                  <p v-if="quote.preorder_note" class="text-xs text-purple-600 mt-1">{{ quote.preorder_note }}</p>
                </div>
                <span class="font-bold text-yellow-600">{{ quote.formatted_price }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Resumo -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h3 class="text-lg font-semibold text-stone-900 mb-4">Resumo do Pedido</h3>
            
            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-stone-500">
                <span>Subtotal ({{ cartStore.count }} {{ cartStore.count === 1 ? 'item' : 'itens' }})</span>
                <span class="text-stone-900">{{ cartStore.formattedTotal }}</span>
              </div>
              <div class="flex justify-between text-stone-500">
                <span>Frete</span>
                <span :class="{ 'text-yellow-600 font-medium': cartStore.selectedShipping }">{{ cartStore.formattedShippingCost }}</span>
              </div>
            </div>
            
            <hr class="my-4 border-stone-200">
            
            <div class="flex justify-between text-lg font-semibold text-stone-900 mb-6">
              <span>Total</span>
              <span class="text-yellow-600">{{ cartStore.selectedShipping ? cartStore.formattedGrandTotal : cartStore.formattedTotal }}</span>
            </div>

            <!-- Info do frete selecionado -->
            <div v-if="cartStore.selectedShipping" class="mb-4 p-3 bg-stone-50 rounded-lg text-sm">
              <p class="text-stone-600">
                <span class="font-medium text-stone-900">{{ cartStore.selectedShipping.name }}</span>
                <br>
                Entrega em até {{ cartStore.selectedShipping.delivery_time }} dias úteis
              </p>
            </div>
            
            <NuxtLink 
              to="/checkout"
              class="block w-full bg-yellow-400 text-stone-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors text-center"
              :class="{ 'opacity-50 pointer-events-none': !cartStore.selectedShipping }"
            >
              Finalizar Compra
            </NuxtLink>

            <p v-if="!cartStore.selectedShipping" class="text-xs text-stone-500 text-center mt-2">
              Calcule o frete para continuar
            </p>
            
            <NuxtLink 
              to="/discos-novos" 
              class="block text-center text-stone-500 hover:text-yellow-600 mt-4 text-sm transition-colors"
            >
              Continuar comprando
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
