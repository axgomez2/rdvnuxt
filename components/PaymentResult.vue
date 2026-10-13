<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import type { PaymentStatus } from '~/composables/useOrderApi'

type Expected = 'sucesso' | 'pendente' | 'erro'
type State = 'loading' | 'confirming' | 'approved' | 'pending' | 'failed' | 'cancelled' | 'error'

const props = defineProps<{ orderNumber: string; expected: Expected }>()

const route = useRoute()
const cartStore = useCartStore()
const api = useOrderApi(toRef(props, 'orderNumber'))

const state = ref<State>('loading')
const order = ref<any>(null)
const status = ref<PaymentStatus | null>(null)

// Parâmetros que o Mercado Pago adiciona no retorno do Checkout Pro
const paymentId = computed(() => (route.query.payment_id || route.query.collection_id || null) as string | null)

let timer: ReturnType<typeof setTimeout> | null = null
let attempts = 0

const REJECTION_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount: 'O cartão não tem limite suficiente.',
  cc_rejected_bad_filled_security_code: 'O código de segurança (CVV) está incorreto.',
  cc_rejected_bad_filled_date: 'A data de validade do cartão está incorreta.',
  cc_rejected_bad_filled_card_number: 'O número do cartão está incorreto.',
  cc_rejected_bad_filled_other: 'Algum dado do cartão está incorreto.',
  cc_rejected_call_for_authorize: 'O banco emissor precisa autorizar o pagamento. Ligue para o seu banco.',
  cc_rejected_card_disabled: 'O cartão não está ativo. Ligue para o seu banco.',
  cc_rejected_duplicated_payment: 'Já existe um pagamento igual realizado recentemente.',
  cc_rejected_high_risk: 'O pagamento foi recusado por segurança. Tente outro meio de pagamento.',
  cc_rejected_max_attempts: 'Limite de tentativas atingido. Tente outro cartão.',
  cc_rejected_blacklist: 'Não foi possível processar o pagamento com este cartão.',
  cc_rejected_other_reason: 'O banco emissor recusou o pagamento.',
}

const rejectionMessage = computed(() =>
  REJECTION_MESSAGES[status.value?.payment_status_detail || ''] || 'O pagamento não foi aprovado pelo Mercado Pago.')

const paymentMethod = computed(() => order.value?.payment?.method || status.value?.payment_method)
const checkoutUrl = computed(() => order.value?.payment?.checkout_url as string | null)
const canPayPix = computed(() => paymentMethod.value === 'pix' && order.value?.status === 'pending' && !order.value?.payment?.pix_expired)

const resolveState = (s: PaymentStatus): State | null => {
  if (s.is_approved) return 'approved'
  if (s.is_cancelled) return 'cancelled'
  if (s.is_rejected) return 'failed'
  return null
}

const poll = async (interval: number, maxAttempts: number, onTimeout: State) => {
  timer = setTimeout(async () => {
    attempts++
    try {
      status.value = await api.fetchPaymentStatus(paymentId.value)
      const resolved = resolveState(status.value)
      if (resolved) return finish(resolved)
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err)
    }
    if (attempts >= maxAttempts) {
      state.value = onTimeout
      return
    }
    poll(interval, maxAttempts, onTimeout)
  }, interval)
}

const finish = async (final: State) => {
  state.value = final
  if (final === 'approved') cartStore.clearCart()
  // Recarrega o pedido para refletir o status final
  try { order.value = await api.fetchOrder() } catch {}
}

onMounted(async () => {
  if (!(await api.ensureAuth())) return

  try {
    // payment-status sincroniza com o Mercado Pago antes de responder
    const [s, o] = await Promise.all([api.fetchPaymentStatus(paymentId.value), api.fetchOrder()])
    status.value = s
    order.value = o
  } catch (err: any) {
    state.value = 'error'
    return
  }

  const resolved = resolveState(status.value!)
  if (resolved) return finish(resolved)

  // Pedido ainda pendente no nosso sistema
  if (props.expected === 'sucesso') {
    // O Mercado Pago aprovou, mas a confirmação pode levar alguns segundos
    state.value = 'confirming'
    poll(3000, 20, 'pending')
  } else if (props.expected === 'erro') {
    state.value = 'failed'
  } else {
    state.value = 'pending'
    poll(10000, 30, 'pending')
  }
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <div class="max-w-lg mx-auto px-4 py-8 sm:py-12">
      <!-- Carregando -->
      <div v-if="state === 'loading'" class="py-24 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-stone-500 mt-4">Verificando seu pagamento...</p>
      </div>

      <!-- Erro ao carregar -->
      <div v-else-if="state === 'error'" class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <h1 class="text-xl font-bold text-stone-900">Não encontramos este pedido</h1>
        <p class="text-stone-600 text-sm mt-2">Verifique se você está logado na conta usada na compra.</p>
        <div class="mt-6 flex flex-col gap-3">
          <NuxtLink to="/minha-conta/pedidos" class="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold">Meus pedidos</NuxtLink>
          <NuxtLink to="/" class="w-full text-stone-600 py-2 text-sm">Voltar para a loja</NuxtLink>
        </div>
      </div>

      <template v-else>
        <div class="bg-white rounded-2xl shadow-sm p-6 sm:p-8 text-center">
          <!-- Confirmando -->
          <template v-if="state === 'confirming'">
            <div class="w-16 h-16 rounded-full border-4 border-green-500 border-t-transparent animate-spin mx-auto mb-5"></div>
            <h1 class="text-2xl font-bold text-stone-900">Confirmando seu pagamento</h1>
            <p class="text-stone-600 mt-2">Isso leva só alguns segundos. Não feche esta página.</p>
          </template>

          <!-- Aprovado -->
          <template v-else-if="state === 'approved'">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-stone-900">Pagamento confirmado!</h1>
            <p class="text-stone-600 mt-2">Obrigado pela compra. Enviamos a confirmação para o seu e-mail e já estamos separando seu pedido.</p>
          </template>

          <!-- Pendente -->
          <template v-else-if="state === 'pending'">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-stone-900">Pagamento pendente</h1>
            <p v-if="canPayPix" class="text-stone-600 mt-2">Seu pedido foi criado e está aguardando o pagamento via PIX.</p>
            <p v-else-if="status?.payment_status === 'preference' && checkoutUrl" class="text-stone-600 mt-2">
              O pagamento ainda não foi concluído no Mercado Pago.
            </p>
            <p v-else class="text-stone-600 mt-2">
              Seu pagamento está em análise pelo Mercado Pago. Boletos podem levar até 3 dias úteis para compensar.
              Avisaremos por e-mail assim que for aprovado.
            </p>
          </template>

          <!-- Recusado -->
          <template v-else-if="state === 'failed'">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-stone-900">Pagamento não aprovado</h1>
            <p class="text-stone-600 mt-2">
              {{ status?.is_rejected ? rejectionMessage : 'O pagamento não foi concluído.' }}
              Nenhum valor foi cobrado.
            </p>
          </template>

          <!-- Cancelado -->
          <template v-else-if="state === 'cancelled'">
            <div class="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg class="w-8 h-8 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-stone-900">Pedido cancelado</h1>
            <p class="text-stone-600 mt-2">O pagamento não foi realizado dentro do prazo e o pedido foi cancelado. Você pode fazer um novo pedido quando quiser.</p>
          </template>

          <!-- Resumo -->
          <div v-if="order" class="mt-6 bg-stone-50 rounded-xl p-4 text-left text-sm space-y-2">
            <div class="flex justify-between"><span class="text-stone-500">Pedido</span><span class="font-semibold text-stone-900">#{{ order.order_number }}</span></div>
            <div class="flex justify-between"><span class="text-stone-500">Itens</span><span class="text-stone-900">{{ order.items_count }}</span></div>
            <div v-if="order.shipping_method" class="flex justify-between"><span class="text-stone-500">Envio</span><span class="text-stone-900 text-right">{{ order.shipping_method }}</span></div>
            <div class="flex justify-between pt-2 border-t border-stone-200"><span class="text-stone-700 font-medium">Total</span><span class="font-bold text-stone-900">{{ order.formatted_total || formatBRL(order.total) }}</span></div>
          </div>

          <!-- Ações principais por estado -->
          <div class="mt-6 flex flex-col gap-3">
            <NuxtLink v-if="state === 'pending' && canPayPix" :to="`/pedido/${orderNumber}/pagamento`" class="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold">
              Ver código PIX
            </NuxtLink>
            <a v-if="(state === 'failed' || (state === 'pending' && status?.payment_status === 'preference')) && checkoutUrl" :href="checkoutUrl" class="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold">
              {{ state === 'failed' ? 'Tentar novamente' : 'Concluir pagamento' }}
            </a>
            <NuxtLink v-if="state === 'cancelled' || (state === 'failed' && !checkoutUrl)" to="/" class="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold">
              Fazer um novo pedido
            </NuxtLink>

            <template v-if="state !== 'confirming'">
              <div class="flex flex-col sm:flex-row gap-3">
                <NuxtLink to="/minha-conta/pedidos" class="flex-1 bg-white border border-stone-300 text-stone-700 py-3 rounded-xl font-medium">
                  Meus pedidos
                </NuxtLink>
                <NuxtLink
                  to="/"
                  class="flex-1 py-3 rounded-xl font-medium"
                  :class="state === 'approved' ? 'bg-yellow-400 text-stone-900' : 'bg-white border border-stone-300 text-stone-700'"
                >
                  {{ state === 'approved' ? 'Continuar comprando' : 'Página inicial' }}
                </NuxtLink>
              </div>
              <NuxtLink :to="`/pedido/${orderNumber}`" class="text-sm text-stone-500 hover:text-stone-800">
                Ver detalhes do pedido
              </NuxtLink>
            </template>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
