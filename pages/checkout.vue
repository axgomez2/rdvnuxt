<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

useHead({
  title: 'Finalizar Compra - RDV Discos'
})

// Estados
const loading = ref(true)
const submitting = ref(false)
const loadingShipping = ref(false)
const searchingCep = ref(false)
const savingAddress = ref(false)
const error = ref<string | null>(null)

// Dados
const addresses = ref<any[]>([])
const selectedAddressId = ref<number | null>(null)
const showNewAddressForm = ref(false)
const newAddress = ref({
  zip_code: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  label: ''
})

const shippingOptions = ref<any[]>([])
const selectedShippingId = ref<string | null>(null)

const paymentMethod = ref('pix')
const customerNotes = ref('')

// Modal PIX
const showPixModal = ref(false)
const pixData = ref<any>({})
const orderNumber = ref('')
const pixCopied = ref(false)
const simulatingPayment = ref(false)

// Modal WhatsApp
const showWhatsAppModal = ref(false)
const whatsAppOrderNumber = ref('')
const submittingWhatsApp = ref(false)

// Computeds
const cartItems = computed(() => cartStore.items || [])
const subtotal = computed(() => cartStore.total)
const hasPreorderItems = computed(() => cartItems.value.some((item: any) => item.isPreorder))
const latestPreorderDate = computed(() => {
  const preorderItems = cartItems.value.filter((item: any) => item.isPreorder && item.releaseDate)
  if (preorderItems.length === 0) return null
  const dates = preorderItems.map((item: any) => new Date(item.releaseDate).getTime())
  const latest = new Date(Math.max(...dates))
  return latest.toLocaleDateString('pt-BR')
})

const selectedAddress = computed(() => addresses.value.find(a => a.id === selectedAddressId.value))
const selectedShipping = computed(() => shippingOptions.value.find(s => s.id === selectedShippingId.value))

const total = computed(() => {
  const shipping = selectedShipping.value?.price || 0
  return subtotal.value + shipping
})

const canSubmit = computed(() => {
  return selectedAddressId.value && selectedShippingId.value && paymentMethod.value && cartItems.value.length > 0
})

// Funções
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '/placeholder.svg'
  if (url.startsWith('http')) return url
  return `${config.public.apiBase.replace('/api', '')}${url}`
}

const fetchAddresses = async () => {
  try {
    const response = await $fetch<{ data: any[] }>('/addresses', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    addresses.value = response.data || []
    const defaultAddress = addresses.value.find(a => a.is_default)
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id
    }
  } catch (err) {
    console.error('Erro ao buscar endereços:', err)
  }
}

const searchCep = async () => {
  const cep = newAddress.value.zip_code.replace(/\D/g, '')
  if (cep.length < 8) return
  
  searchingCep.value = true
  try {
    const response = await $fetch<{ data: any }>('/cep/search', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { cep }
    })
    const data = response.data
    newAddress.value.street = data.street || ''
    newAddress.value.neighborhood = data.neighborhood || ''
    newAddress.value.city = data.city || ''
    newAddress.value.state = data.state || ''
  } catch (err) {
    console.error('Erro ao buscar CEP:', err)
  } finally {
    searchingCep.value = false
  }
}

const saveNewAddress = async () => {
  savingAddress.value = true
  try {
    const response = await $fetch<{ data: any }>('/addresses', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: newAddress.value
    })
    addresses.value.push(response.data)
    selectedAddressId.value = response.data.id
    showNewAddressForm.value = false
    newAddress.value = { zip_code: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', label: '' }
  } catch (err: any) {
    console.error('Erro ao salvar endereço:', err)
    error.value = err?.data?.message || 'Erro ao salvar endereço. Verifique os dados.'
  } finally {
    savingAddress.value = false
  }
}

const fetchShippingOptions = async () => {
  if (!selectedAddress.value) return

  loadingShipping.value = true
  shippingOptions.value = []
  selectedShippingId.value = null

  try {
    const response = await $fetch<{ success: boolean; data: any }>('/shipping/calculate', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: {
        postal_code: selectedAddress.value.zip_code,
        items: cartItems.value.map((item: any) => ({
          id: item.id,
          quantity: item.quantity || 1,
        })),
      }
    })

    if (response.success) {
      shippingOptions.value = response.data.quotes || []
      if (shippingOptions.value.length > 0) {
        // Mantém o frete previamente selecionado no carrinho, se ainda disponível
        const prev = cartStore.selectedShipping
        const stillAvailable = prev && shippingOptions.value.find(o => o.id === prev.id)
        selectedShippingId.value = stillAvailable ? prev.id : shippingOptions.value[0].id
      }
    }
  } catch (err) {
    console.error('Erro ao calcular frete:', err)
  } finally {
    loadingShipping.value = false
  }
}

const submitOrder = async () => {
  if (!canSubmit.value) return
  
  submitting.value = true
  error.value = null
  
  try {
    const response = await $fetch<{ data: any }>('/checkout/order', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        items: cartItems.value.map((item: any) => ({ id: item.id, quantity: item.quantity || 1 })),
        shipping_address_id: selectedAddressId.value,
        shipping_service_id: selectedShipping.value.id,
        shipping_service_name: selectedShipping.value.name,
        shipping_cost: selectedShipping.value.price,
        shipping_deadline: selectedShipping.value.delivery_time,
        payment_method: paymentMethod.value,
        customer_notes: customerNotes.value
      }
    })

    const orderData = response.data
    orderNumber.value = orderData.order_number

    if (paymentMethod.value === 'pix' && orderData.payment) {
      pixData.value = orderData.payment
      showPixModal.value = true
      cartStore.clearCart()
    } else if (paymentMethod.value === 'checkout_pro' && orderData.payment?.init_point) {
      cartStore.clearCart()
      window.location.href = orderData.payment.init_point
    }
  } catch (err: any) {
    console.error('Erro ao criar pedido:', err)
    error.value = err?.data?.error || err?.data?.message || 'Erro ao processar pedido. Tente novamente.'
  } finally {
    submitting.value = false
  }
}

const copyPixCode = async () => {
  try {
    await navigator.clipboard.writeText(pixData.value.qr_code)
    pixCopied.value = true
    setTimeout(() => pixCopied.value = false, 2000)
  } catch (err) {
    console.error('Erro ao copiar:', err)
  }
}

const goToPendingPage = () => {
  showPixModal.value = false
  router.push(`/pedido/${orderNumber.value}/pendente`)
}

const goToHome = () => {
  showPixModal.value = false
  router.push('/')
}

const simulatePayment = async () => {
  simulatingPayment.value = true
  try {
    const response = await $fetch<{ data: any }>(`/orders/${orderNumber.value}/simulate-payment`, {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    if (response.data.payment_status === 'approved') {
      showPixModal.value = false
      router.push(`/pedido/${orderNumber.value}/sucesso`)
    }
  } catch (err: any) {
    console.error('Erro ao simular pagamento:', err)
    error.value = 'Erro ao simular pagamento: ' + (err?.data?.error || err.message)
  } finally {
    simulatingPayment.value = false
  }
}

// Finalizar no WhatsApp
const submitWhatsAppOrder = async () => {
  if (!canSubmit.value) return
  
  submittingWhatsApp.value = true
  error.value = null
  
  try {
    const response = await $fetch<{ data: any }>('/checkout/order', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        items: cartItems.value.map((item: any) => ({ id: item.id, quantity: item.quantity || 1 })),
        shipping_address_id: selectedAddressId.value,
        shipping_service_id: selectedShipping.value.id,
        shipping_service_name: selectedShipping.value.name,
        shipping_cost: selectedShipping.value.price,
        shipping_deadline: selectedShipping.value.delivery_time,
        payment_method: 'whatsapp', // Método especial para WhatsApp
        customer_notes: customerNotes.value
      }
    })

    const orderData = response.data
    whatsAppOrderNumber.value = orderData.order_number
    showWhatsAppModal.value = true
    cartStore.clearCart()
  } catch (err: any) {
    console.error('Erro ao criar pedido:', err)
    error.value = err?.data?.error || err?.data?.message || 'Erro ao processar pedido. Tente novamente.'
  } finally {
    submittingWhatsApp.value = false
  }
}

const openWhatsApp = () => {
  const phone = '5511947159293'
  const message = encodeURIComponent(
    `Olá! Acabei de fazer o pedido #${whatsAppOrderNumber.value} no site e gostaria de combinar o pagamento.\n\n` +
    `Total: ${formatPrice(total.value)}\n` +
    `Frete: ${selectedShipping.value?.name || 'A combinar'}`
  )
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
}

const closeWhatsAppModal = () => {
  showWhatsAppModal.value = false
  router.push('/')
}

const checkRequirements = async () => {
  try {
    const response = await $fetch<{ can_proceed: boolean; missing: string[] }>('/checkout/requirements', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    if (!response.can_proceed) {
      router.replace('/completar-cadastro')
      return false
    }
    
    return true
  } catch (err) {
    console.error('Erro ao verificar requisitos:', err)
    return true
  }
}

// Watchers
watch(selectedAddressId, () => {
  fetchShippingOptions()
})

watch(selectedShippingId, (id) => {
  const opt = shippingOptions.value.find(o => o.id === id)
  if (opt) cartStore.selectShipping(opt)
})

// Inicialização
onMounted(async () => {
  // Verificar se tem todos os dados necessários
  const canProceed = await checkRequirements()
  if (!canProceed) return
  
  // Buscar carrinho e endereços
  await Promise.all([
    cartStore.fetchCart(),
    fetchAddresses()
  ])
  
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-stone-100">
    <!-- Header -->
    <div class="bg-white border-b border-stone-200">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold text-stone-900">Finalizar Compra</h1>
        <p class="text-stone-600 mt-1">Complete os dados para finalizar seu pedido</p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>

      <!-- Carrinho Vazio -->
      <div v-else-if="cartItems.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
        <svg class="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
        <h2 class="text-xl font-semibold text-stone-900 mb-2">Seu carrinho está vazio</h2>
        <p class="text-stone-600 mb-4">Adicione alguns discos para continuar</p>
        <NuxtLink to="/discos-novos" class="inline-flex items-center gap-2 bg-yellow-400 text-stone-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-300 transition-colors">
          Explorar Loja
        </NuxtLink>
      </div>

      <!-- Checkout Form -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Coluna Principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Erro Global -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <!-- Etapa 1: Endereço -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-yellow-400 text-stone-900 flex items-center justify-center font-bold text-sm">1</span>
                <h2 class="text-lg font-semibold text-stone-900">Endereço de Entrega</h2>
              </div>
              <span v-if="selectedAddress" class="text-green-600 text-sm font-medium flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Selecionado
              </span>
            </div>
            <div class="p-6">
              <!-- Lista de Endereços -->
              <div v-if="addresses.length > 0" class="space-y-3 mb-4">
                <label
                  v-for="address in addresses"
                  :key="address.id"
                  class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors"
                  :class="selectedAddressId === address.id ? 'border-yellow-400 bg-yellow-50' : 'border-stone-200 hover:border-stone-300'"
                >
                  <input
                    type="radio"
                    v-model="selectedAddressId"
                    :value="address.id"
                    class="mt-1 text-yellow-500 focus:ring-yellow-400"
                  >
                  <div class="flex-1">
                    <p class="font-medium text-stone-900">{{ address.label || 'Endereço' }}</p>
                    <p class="text-sm text-stone-600">{{ address.full_address }}</p>
                    <p class="text-sm text-stone-500">CEP: {{ address.formatted_zip_code || address.zip_code }}</p>
                  </div>
                  <span v-if="address.is_default" class="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded">Padrão</span>
                </label>
              </div>

              <!-- Adicionar Novo Endereço -->
              <button
                @click="showNewAddressForm = !showNewAddressForm"
                class="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                {{ showNewAddressForm ? 'Cancelar' : 'Adicionar novo endereço' }}
              </button>

              <!-- Formulário Novo Endereço -->
              <div v-if="showNewAddressForm" class="mt-4 p-4 bg-stone-50 rounded-lg space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="col-span-2 sm:col-span-1">
                    <label class="block text-sm font-medium text-stone-700 mb-1">CEP</label>
                    <div class="flex gap-2">
                      <input
                        v-model="newAddress.zip_code"
                        @blur="searchCep"
                        type="text"
                        maxlength="9"
                        placeholder="00000-000"
                        class="flex-1 rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400"
                      >
                      <button
                        @click="searchCep"
                        :disabled="searchingCep"
                        class="px-3 py-2 bg-stone-200 text-stone-700 rounded-lg text-sm hover:bg-stone-300 disabled:opacity-50"
                      >
                        {{ searchingCep ? '...' : 'Buscar' }}
                      </button>
                    </div>
                  </div>
                  <div class="col-span-2 sm:col-span-1">
                    <label class="block text-sm font-medium text-stone-700 mb-1">Apelido (opcional)</label>
                    <input v-model="newAddress.label" type="text" placeholder="Ex: Casa, Trabalho" class="w-full rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400">
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-stone-700 mb-1">Rua</label>
                    <input v-model="newAddress.street" type="text" class="w-full rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-stone-700 mb-1">Número</label>
                    <input v-model="newAddress.number" type="text" class="w-full rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-stone-700 mb-1">Complemento</label>
                    <input v-model="newAddress.complement" type="text" class="w-full rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-stone-700 mb-1">Bairro</label>
                    <input v-model="newAddress.neighborhood" type="text" class="w-full rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-stone-700 mb-1">Cidade</label>
                    <input v-model="newAddress.city" type="text" class="w-full rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-stone-700 mb-1">Estado</label>
                    <input v-model="newAddress.state" type="text" maxlength="2" class="w-full rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400">
                  </div>
                </div>
                <button
                  @click="saveNewAddress"
                  :disabled="savingAddress"
                  class="w-full bg-yellow-400 text-stone-900 py-2 rounded-lg font-medium hover:bg-yellow-300 disabled:opacity-50"
                >
                  {{ savingAddress ? 'Salvando...' : 'Salvar Endereço' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Etapa 2: Frete -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-yellow-400 text-stone-900 flex items-center justify-center font-bold text-sm">2</span>
                <h2 class="text-lg font-semibold text-stone-900">Opções de Frete</h2>
              </div>
              <span v-if="selectedShipping" class="text-green-600 text-sm font-medium flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Selecionado
              </span>
            </div>
            <div class="p-6">
              <div v-if="!selectedAddress" class="text-center py-4 text-stone-500">
                Selecione um endereço para ver as opções de frete
              </div>
              <div v-else-if="loadingShipping" class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              </div>
              <div v-else-if="shippingOptions.length === 0" class="text-center py-4 text-stone-500">
                Nenhuma opção de frete disponível para este endereço
              </div>
              <div v-else class="space-y-3">
                <label
                  v-for="option in shippingOptions"
                  :key="option.id"
                  class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors"
                  :class="selectedShippingId === option.id ? 'border-yellow-400 bg-yellow-50' : 'border-stone-200 hover:border-stone-300'"
                >
                  <input
                    type="radio"
                    v-model="selectedShippingId"
                    :value="option.id"
                    class="text-yellow-500 focus:ring-yellow-400"
                  >
                  <img v-if="option.logo" :src="option.logo" :alt="option.company" class="w-12 h-12 object-contain">
                  <div class="flex-1">
                    <p class="font-medium text-stone-900">{{ option.name }}</p>
                    <p class="text-sm text-stone-500">{{ option.company }} • {{ option.delivery_time }} dias úteis</p>
                  </div>
                  <span class="font-bold text-stone-900">{{ option.formatted_price }}</span>
                </label>
              </div>

              <!-- Aviso de Pré-venda -->
              <div v-if="hasPreorderItems" class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <div>
                    <p class="font-medium text-amber-800">Pedido contém itens em pré-venda</p>
                    <p class="text-sm text-amber-700 mt-1">
                      O envio será realizado após a disponibilidade de todos os itens.
                      <template v-if="latestPreorderDate">Data estimada: <strong>{{ latestPreorderDate }}</strong></template>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Etapa 3: Pagamento -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 border-b border-stone-200 flex items-center gap-3">
              <span class="w-8 h-8 rounded-full bg-yellow-400 text-stone-900 flex items-center justify-center font-bold text-sm">3</span>
              <h2 class="text-lg font-semibold text-stone-900">Forma de Pagamento</h2>
            </div>
            <div class="p-6 space-y-3">
              <label
                class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors"
                :class="paymentMethod === 'pix' ? 'border-yellow-400 bg-yellow-50' : 'border-stone-200 hover:border-stone-300'"
              >
                <input type="radio" v-model="paymentMethod" value="pix" class="text-yellow-500 focus:ring-yellow-400">
                <div class="flex-1">
                  <p class="font-medium text-stone-900">PIX</p>
                  <p class="text-sm text-stone-500">Pagamento instantâneo</p>
                </div>
                <span class="text-green-600 text-sm font-medium">Aprovação imediata</span>
              </label>

              <label
                class="flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors"
                :class="paymentMethod === 'checkout_pro' ? 'border-yellow-400 bg-yellow-50' : 'border-stone-200 hover:border-stone-300'"
              >
                <input type="radio" v-model="paymentMethod" value="checkout_pro" class="text-yellow-500 focus:ring-yellow-400">
                <div class="flex-1">
                  <p class="font-medium text-stone-900">Cartão de Crédito / Boleto</p>
                  <p class="text-sm text-stone-500">Via Mercado Pago</p>
                </div>
                <span class="text-stone-500 text-sm">Até 12x</span>
              </label>
            </div>
          </div>

          <!-- Observações -->
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="px-6 py-4 border-b border-stone-200">
              <h2 class="text-lg font-semibold text-stone-900">Observações (opcional)</h2>
            </div>
            <div class="p-6">
              <textarea
                v-model="customerNotes"
                rows="3"
                placeholder="Alguma observação sobre o pedido?"
                class="w-full rounded-lg border-stone-300 text-sm focus:border-yellow-400 focus:ring-yellow-400"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Resumo do Pedido -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow sticky top-4">
            <div class="px-6 py-4 border-b border-stone-200">
              <h2 class="text-lg font-semibold text-stone-900">Resumo do Pedido</h2>
            </div>
            <div class="p-6">
              <!-- Itens -->
              <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                <div v-for="item in cartItems" :key="item.id" class="flex gap-3">
                  <img 
                    :src="resolveImageUrl(item.image)" 
                    :alt="item.title" 
                    class="w-12 h-12 object-cover rounded"
                    @error="($event.target as HTMLImageElement).src = '/placeholder.svg'"
                  >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-stone-900 truncate">{{ item.title }}</p>
                    <p class="text-xs text-stone-500">{{ item.artist }}</p>
                    <p class="text-sm text-stone-900">{{ formatPrice(item.price || 0) }} x {{ item.quantity }}</p>
                  </div>
                  <span v-if="item.isPreorder" class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded h-fit">Pré-venda</span>
                </div>
              </div>

              <!-- Totais -->
              <div class="border-t border-stone-200 pt-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-stone-600">Subtotal</span>
                  <span class="text-stone-900">{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-stone-600">Frete</span>
                  <span class="text-stone-900">{{ selectedShipping ? selectedShipping.formatted_price : '-' }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold pt-2 border-t border-stone-200">
                  <span class="text-stone-900">Total</span>
                  <span class="text-yellow-600">{{ formatPrice(total) }}</span>
                </div>
              </div>

              <!-- Botão Finalizar Online -->
              <button
                @click="submitOrder"
                :disabled="!canSubmit || submitting || submittingWhatsApp"
                class="w-full mt-6 bg-yellow-400 text-stone-900 py-3 rounded-lg font-bold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg v-if="submitting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ submitting ? 'Processando...' : 'Finalizar Pedido' }}
              </button>

              <!-- Divisor -->
              <div class="flex items-center gap-3 my-4">
                <div class="flex-1 h-px bg-stone-200"></div>
                <span class="text-xs text-stone-400">ou</span>
                <div class="flex-1 h-px bg-stone-200"></div>
              </div>

              <!-- Botão WhatsApp -->
              <button
                @click="submitWhatsAppOrder"
                :disabled="!canSubmit || submitting || submittingWhatsApp"
                class="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg v-if="submittingWhatsApp" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {{ submittingWhatsApp ? 'Processando...' : 'Finalizar no WhatsApp' }}
              </button>

              <p v-if="!canSubmit" class="text-xs text-stone-500 text-center mt-3">
                Preencha todos os campos para continuar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal PIX -->
    <Teleport to="body">
      <div v-if="showPixModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-stone-900">Pedido Criado!</h3>
            <p class="text-sm text-stone-600 mt-1">Pedido <strong>#{{ orderNumber }}</strong></p>
          </div>

          <!-- QR Code -->
          <div class="text-center">
            <p class="text-sm font-medium text-stone-700 mb-3">Escaneie o QR Code para pagar:</p>
            <div class="bg-white border-2 border-stone-200 rounded-xl p-4 inline-block mb-4">
              <img v-if="pixData.qr_code_base64" :src="'data:image/png;base64,' + pixData.qr_code_base64" alt="QR Code PIX" class="w-48 h-48">
            </div>
            
            <!-- Código PIX -->
            <p class="text-xs text-stone-500 mb-2">Ou copie o código PIX:</p>
            <div class="bg-stone-100 p-3 rounded-lg mb-4 max-h-20 overflow-y-auto">
              <p class="text-xs text-stone-700 break-all font-mono select-all">{{ pixData.qr_code }}</p>
            </div>
            
            <button
              @click="copyPixCode"
              class="w-full bg-yellow-400 text-stone-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              {{ pixCopied ? 'Copiado!' : 'Copiar Código PIX' }}
            </button>
            
            <!-- Timer -->
            <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p class="text-xs text-amber-800">
                <strong>Atenção:</strong> O código PIX expira em 30 minutos. 
                Após o pagamento, você receberá a confirmação por e-mail.
              </p>
            </div>
          </div>

          <!-- Botões -->
          <div class="mt-6 space-y-2">
            <!-- Botão de simular pagamento (apenas sandbox) -->
            <button 
              v-if="pixData.is_sandbox"
              @click="simulatePayment"
              :disabled="simulatingPayment"
              class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg v-if="simulatingPayment" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ simulatingPayment ? 'Processando...' : 'Simular Pagamento (Sandbox)' }}
            </button>
            
            <button 
              @click="goToPendingPage" 
              class="w-full bg-stone-100 text-stone-700 py-3 rounded-lg font-medium hover:bg-stone-200 transition-colors"
            >
              Acompanhar Pedido
            </button>
            <button 
              @click="goToHome" 
              class="w-full text-stone-500 hover:text-stone-700 py-2 text-sm transition-colors"
            >
              Voltar para o Site
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal WhatsApp -->
    <Teleport to="body">
      <div v-if="showWhatsAppModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-stone-900">Pedido Criado!</h3>
            <p class="text-sm text-stone-600 mt-1">Pedido <strong>#{{ whatsAppOrderNumber }}</strong></p>
          </div>

          <!-- Mensagem -->
          <div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p class="text-green-800 text-center">
              Seu pedido foi registrado e está <strong>aguardando pagamento</strong>.
            </p>
            <p class="text-green-700 text-sm text-center mt-2">
              Em breve você receberá contato de nossa equipe para combinar o pagamento.
            </p>
          </div>

          <!-- Botões -->
          <div class="space-y-3">
            <button 
              @click="openWhatsApp"
              class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Abrir WhatsApp
            </button>
            
            <button 
              @click="closeWhatsAppModal" 
              class="w-full bg-stone-100 text-stone-700 py-3 rounded-lg font-medium hover:bg-stone-200 transition-colors"
            >
              Voltar para o Site
            </button>
          </div>

          <!-- Info -->
          <p class="text-xs text-stone-500 text-center mt-4">
            Você também pode acompanhar seu pedido na área "Meus Pedidos"
          </p>
        </div>
      </div>
    </Teleport>
  </div>
</template>
