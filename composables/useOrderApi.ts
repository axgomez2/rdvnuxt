import { useAuthStore } from '~/stores/auth'

export interface PaymentStatus {
  order_number: string
  order_status: string
  payment_method: string | null
  payment_status: string | null
  payment_status_detail: string | null
  is_approved: boolean
  is_cancelled: boolean
  is_rejected: boolean
}

/**
 * Chamadas autenticadas da área de pedidos/pagamento.
 * Aguarda a auth inicializar e redireciona para o login se o token for inválido.
 */
export const useOrderApi = (orderNumber: Ref<string> | string) => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const route = useRoute()
  const number = computed(() => unref(orderNumber))

  const redirectToLogin = () => navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)

  const ensureAuth = async (): Promise<boolean> => {
    if (!authStore.authInitialized) await authStore.initializeAuth()
    let attempts = 0
    while (authStore.authLoading && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    if (!authStore.token) {
      redirectToLogin()
      return false
    }
    return true
  }

  const request = async <T>(path: string, options: Record<string, any> = {}): Promise<T> => {
    try {
      const result = await $fetch<T>(path, {
        baseURL: config.public.apiBase,
        headers: { Authorization: `Bearer ${authStore.token}` },
        ...options,
      })
      return result as T
    } catch (err: any) {
      if (err?.status === 401 || err?.response?.status === 401) redirectToLogin()
      throw err
    }
  }

  const fetchOrder = () => request<{ data: any }>(`/orders/${number.value}`).then(r => r.data)

  const fetchPaymentStatus = (paymentId?: string | null) =>
    request<{ data: PaymentStatus }>(`/orders/${number.value}/payment-status`, {
      query: paymentId ? { payment_id: paymentId } : undefined,
    }).then(r => r.data)

  const fetchPix = () => request<{ data: any }>(`/orders/${number.value}/pix`).then(r => r.data)

  const simulatePayment = () =>
    request<{ data: any }>(`/orders/${number.value}/simulate-payment`, { method: 'POST' }).then(r => r.data)

  return { ensureAuth, fetchOrder, fetchPaymentStatus, fetchPix, simulatePayment }
}

export const formatBRL = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
