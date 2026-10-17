<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const orderNumber = computed(() => route.params.number as string)
const cartStore = useCartStore()
const api = useOrderApi(orderNumber)

useHead({ title: () => `Pagamento PIX #${orderNumber.value} - RDV Discos`, meta: [{ name: 'robots', content: 'noindex' }] })

const POLL_INTERVAL = 5000

const loading = ref(true)
const loadError = ref<string | null>(null)
const pix = ref<any>(null)
const copied = ref(false)
const copyFailed = ref(false)
const checking = ref(false)
const simulating = ref(false)
const now = ref(Date.now())
const clockOffset = ref(0) // diferença entre relógio do servidor e do aparelho
const codeBox = ref<HTMLTextAreaElement | null>(null)

let pollTimer: ReturnType<typeof setInterval> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

const expiresAt = computed(() => (pix.value?.expiration ? new Date(pix.value.expiration).getTime() : null))
const secondsLeft = computed(() => {
  if (!expiresAt.value) return null
  return Math.max(0, Math.floor((expiresAt.value - (now.value + clockOffset.value)) / 1000))
})
const isExpired = computed(() => secondsLeft.value === 0)
const countdown = computed(() => {
  const s = secondsLeft.value ?? 0
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

const goTo = (status: 'sucesso' | 'erro') => navigateTo(`/pedido/${orderNumber.value}/${status}`, { replace: true })

const handleStatus = (data: { is_approved?: boolean; is_cancelled?: boolean; order_status?: string }) => {
  if (data.is_approved) {
    stopPolling()
    goTo('sucesso')
    return true
  }
  if (data.is_cancelled || data.order_status === 'cancelled') {
    stopPolling()
    goTo('erro')
    return true
  }
  return false
}

const checkStatus = async () => {
  if (checking.value) return
  checking.value = true
  try {
    handleStatus(await api.fetchPaymentStatus())
  } catch (err) {
    console.error('Erro ao verificar pagamento:', err)
  } finally {
    checking.value = false
  }
}

const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') checkStatus()
  }, POLL_INTERVAL)
}

const stopPolling = () => {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
}

// Quando o cliente volta do app do banco, verifica na hora
const onVisibilityChange = () => {
  if (document.visibilityState === 'visible' && pix.value) checkStatus()
}

const copyCode = async () => {
  const code = pix.value?.qr_code
  if (!code) return
  copyFailed.value = false
  try {
    await navigator.clipboard.writeText(code)
  } catch {
    // Fallback para navegadores internos (Instagram, WhatsApp) e HTTP
    const el = codeBox.value
    if (!el) return
    el.focus()
    el.select()
    el.setSelectionRange(0, code.length)
    if (!document.execCommand('copy')) {
      copyFailed.value = true
      return
    }
  }
  copied.value = true
  setTimeout(() => (copied.value = false), 3000)
}

const simulate = async () => {
  simulating.value = true
  try {
    await api.simulatePayment()
    await checkStatus()
  } catch (err) {
    console.error('Erro ao simular pagamento:', err)
  } finally {
    simulating.value = false
  }
}

onMounted(async () => {
  if (!(await api.ensureAuth())) return
  cartStore.clearCart()

  try {
    pix.value = await api.fetchPix()
    
    // Debug temporário
    console.log('PIX Response:', {
      expiration: pix.value.expiration,
      server_time: pix.value.server_time,
      is_expired: pix.value.is_expired,
      qr_code: pix.value.qr_code ? 'presente' : 'ausente'
    })
    
    if (pix.value.server_time) clockOffset.value = new Date(pix.value.server_time).getTime() - Date.now()
    if (handleStatus(pix.value)) return

    clockTimer = setInterval(() => (now.value = Date.now()), 1000)
    startPolling()
    document.addEventListener('visibilitychange', onVisibilityChange)
  } catch (err: any) {
    loadError.value = err?.data?.error || 'Não foi possível carregar o pagamento PIX.'
  } finally {
    loading.value = false
  }
})

// Ao expirar, faz uma última verificação e para o polling
watch(isExpired, async (expired) => {
  if (!expired) return
  await checkStatus()
  stopPolling()
})

onBeforeUnmount(() => {
  stopPolling()
  if (clockTimer) clearInterval(clockTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <div class="max-w-lg mx-auto px-4 py-6 sm:py-10">
      <!-- Loading -->
      <div v-if="loading" class="py-24 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-stone-500 mt-4">Carregando pagamento...</p>
      </div>

      <!-- Erro ao carregar -->
      <div v-else-if="loadError" class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <p class="text-stone-800 font-medium">{{ loadError }}</p>
        <div class="mt-6 flex flex-col gap-3">
          <NuxtLink :to="`/pedido/${orderNumber}`" class="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold">Ver pedido</NuxtLink>
          <NuxtLink to="/" class="w-full text-stone-600 py-2 text-sm">Voltar para a loja</NuxtLink>
        </div>
      </div>

      <template v-else-if="pix">
        <!-- Cabeçalho -->
        <div class="text-center mb-5">
          <p class="text-sm text-stone-500">Pedido #{{ pix.order_number }}</p>
          <h1 class="text-2xl font-bold text-stone-900 mt-1">Pague com PIX</h1>
          <p class="text-3xl font-extrabold text-stone-900 mt-2">{{ pix.formatted_total || formatBRL(pix.total) }}</p>
        </div>

        <!-- PIX expirado -->
        <div v-if="isExpired" class="bg-white rounded-2xl shadow-sm p-6 text-center">
          <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-stone-900">O código PIX expirou</h2>
          <p class="text-stone-600 text-sm mt-2">
            O prazo de 30 minutos para pagamento terminou e o pedido será cancelado automaticamente.
            Se você já pagou, toque em "Já paguei" para verificarmos.
          </p>
          <div class="mt-6 flex flex-col gap-3">
            <button @click="checkStatus" :disabled="checking" class="w-full bg-stone-900 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              {{ checking ? 'Verificando...' : 'Já paguei' }}
            </button>
            <NuxtLink to="/" class="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold">Fazer um novo pedido</NuxtLink>
            <NuxtLink to="/minha-conta/pedidos" class="w-full text-stone-600 py-2 text-sm">Ver meus pedidos</NuxtLink>
          </div>
        </div>

        <template v-else>
          <!-- Contagem + status -->
          <div class="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
            <div class="flex items-center gap-2 text-amber-800 text-sm">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              Aguardando pagamento
            </div>
            <div v-if="secondsLeft !== null" class="text-sm text-amber-900">
              Expira em <span class="font-mono font-bold">{{ countdown }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <!-- Copia e cola: primeiro no celular -->
            <div class="bg-white rounded-2xl shadow-sm p-5 order-1 sm:order-2">
              <h2 class="font-semibold text-stone-900 mb-1">PIX Copia e Cola</h2>
              <p class="text-sm text-stone-500 mb-3">Copie o código e cole no app do seu banco.</p>

              <textarea
                ref="codeBox"
                readonly
                :value="pix.qr_code"
                rows="3"
                class="w-full text-xs font-mono text-stone-700 bg-stone-100 border-0 rounded-lg p-3 resize-none focus:ring-2 focus:ring-yellow-400"
                @focus="($event.target as HTMLTextAreaElement).select()"
              ></textarea>

              <button
                @click="copyCode"
                class="mt-3 w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                :class="copied ? 'bg-green-500 text-white' : 'bg-yellow-400 text-stone-900 active:bg-yellow-500'"
              >
                <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ copied ? 'Código copiado!' : 'Copiar código PIX' }}
              </button>
              <p v-if="copyFailed" class="text-xs text-red-600 mt-2 text-center">
                Não foi possível copiar automaticamente. Toque no código acima, selecione tudo e copie.
              </p>

              <ol class="mt-5 space-y-2 text-sm text-stone-600">
                <li class="flex gap-3"><span class="w-6 h-6 shrink-0 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">1</span>Abra o app do seu banco</li>
                <li class="flex gap-3"><span class="w-6 h-6 shrink-0 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">2</span>Escolha <strong class="text-stone-800">PIX Copia e Cola</strong></li>
                <li class="flex gap-3"><span class="w-6 h-6 shrink-0 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">3</span>Cole o código e confirme o pagamento</li>
              </ol>
            </div>

            <!-- QR Code: primeiro no desktop -->
            <div v-if="pix.qr_code_base64" class="bg-white rounded-2xl shadow-sm p-5 text-center order-2 sm:order-1">
              <h2 class="font-semibold text-stone-900 mb-3">
                <span class="sm:hidden">Pagando por outro aparelho?</span>
                <span class="hidden sm:inline">Escaneie o QR Code</span>
              </h2>
              <img
                :src="`data:image/png;base64,${pix.qr_code_base64}`"
                alt="QR Code PIX"
                class="w-48 h-48 sm:w-56 sm:h-56 mx-auto"
              >
              <p class="text-xs text-stone-500 mt-3">Aponte a câmera do app do banco para o código</p>
            </div>
          </div>

          <!-- Confirmação automática -->
          <div class="mt-4 bg-white rounded-2xl shadow-sm p-5 text-center">
            <p class="text-sm text-stone-600">
              Assim que o pagamento for confirmado, esta página será atualizada automaticamente.
            </p>
            <button @click="checkStatus" :disabled="checking" class="mt-3 w-full border border-stone-300 text-stone-800 py-3 rounded-xl font-medium disabled:opacity-50">
              {{ checking ? 'Verificando...' : 'Já paguei' }}
            </button>
            <button
              v-if="pix.is_sandbox"
              @click="simulate"
              :disabled="simulating"
              class="mt-2 w-full bg-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {{ simulating ? 'Simulando...' : 'Simular pagamento (sandbox)' }}
            </button>
          </div>

          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <NuxtLink to="/minha-conta/pedidos" class="flex-1 text-center bg-white border border-stone-300 text-stone-700 py-3 rounded-xl font-medium">
              Meus pedidos
            </NuxtLink>
            <NuxtLink to="/" class="flex-1 text-center text-stone-600 py-3 text-sm">
              Voltar para a loja
            </NuxtLink>
          </div>
          <p class="text-xs text-stone-400 text-center mt-3">
            Você pode sair desta página: o PIX continua disponível em Meus Pedidos até expirar.
          </p>
        </template>
      </template>
    </div>
  </div>
</template>
