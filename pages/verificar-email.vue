<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()

useHead({
  title: 'Verificar Email - RDV Discos'
})

const code = ref('')
const loading = ref(false)
const resending = ref(false)
const error = ref('')
const success = ref(false)
const resendCooldown = ref(0)
const notLoggedIn = ref(false)

let cooldownInterval: NodeJS.Timeout | null = null

const startCooldown = (seconds: number = 60) => {
  resendCooldown.value = seconds
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

const verify = async () => {
  if (code.value.length !== 6) {
    error.value = 'Digite o código de 6 dígitos.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await $fetch<{ user: any; message: string }>('/auth/email/verify', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { code: code.value }
    })

    authStore.setUser(response.user)
    success.value = true

    setTimeout(() => {
      router.push('/minha-conta')
    }, 2000)
  } catch (err: any) {
    console.error('Erro ao verificar:', err)
    const errors = err.data?.errors
    if (errors) {
      error.value = Object.values(errors).flat().join(' ')
    } else {
      error.value = err.data?.message || 'Código inválido ou expirado.'
    }
  } finally {
    loading.value = false
  }
}

const resend = async () => {
  if (resendCooldown.value > 0) return

  resending.value = true
  error.value = ''

  try {
    await $fetch('/auth/email/send-verification', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    startCooldown(60)
  } catch (err: any) {
    error.value = err.data?.message || 'Erro ao reenviar código.'
  } finally {
    resending.value = false
  }
}

const onCodeInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  code.value = target.value.replace(/\D/g, '').slice(0, 6)
  
  // Auto-submit quando completar 6 dígitos
  if (code.value.length === 6) {
    verify()
  }
}

onMounted(async () => {
  // Aguardar autenticação
  if (!authStore.authInitialized) {
    await authStore.initializeAuth()
  }

  let attempts = 0
  while (authStore.authLoading && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  if (!authStore.token) {
    notLoggedIn.value = true
    return
  }

  // Se veio com código na URL (link do email), preencher
  const urlCode = route.query.code as string
  if (urlCode && /^\d{6}$/.test(urlCode)) {
    code.value = urlCode
    verify()
  }
})

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="text-3xl font-bold text-stone-900">
          RDV <span class="text-yellow-500">Discos</span>
        </NuxtLink>
      </div>

      <!-- Não logado -->
      <div v-if="notLoggedIn" class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <svg class="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <h1 class="text-xl font-bold text-stone-900 mb-2">Faça login primeiro</h1>
        <p class="text-stone-500 text-sm mb-6">Para verificar seu email, você precisa estar logado.</p>
        <NuxtLink to="/login?redirect=/verificar-email" class="block w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold hover:bg-yellow-300">
          Ir para Login
        </NuxtLink>
      </div>

      <!-- Sucesso -->
      <div v-else-if="success" class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 class="text-xl font-bold text-stone-900 mb-2">Email verificado!</h1>
        <p class="text-stone-500 text-sm mb-6">Sua conta foi verificada com sucesso. Redirecionando...</p>
      </div>

      <!-- Formulário -->
      <div v-else class="bg-white rounded-2xl shadow-sm p-8">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-stone-900 mb-2">Verifique seu email</h1>
          <p class="text-stone-500 text-sm">
            Enviamos um código de 6 dígitos para<br>
            <strong class="text-stone-700">{{ authStore.user?.email }}</strong>
          </p>
        </div>

        <!-- Error -->
        <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center">
          {{ error }}
        </div>

        <!-- Code Input -->
        <div class="mb-6">
          <input
            :value="code"
            @input="onCodeInput"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            :disabled="loading"
            class="w-full px-4 py-4 text-center text-3xl font-mono font-bold tracking-[0.5em] border-2 border-stone-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 disabled:opacity-50"
          />
          <p class="text-xs text-stone-400 text-center mt-2">Digite o código recebido por email</p>
        </div>

        <!-- Submit -->
        <button
          @click="verify"
          :disabled="loading || code.length !== 6"
          class="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {{ loading ? 'Verificando...' : 'Verificar Email' }}
        </button>

        <!-- Resend -->
        <div class="text-center">
          <p class="text-sm text-stone-500 mb-2">Não recebeu o código?</p>
          <button
            @click="resend"
            :disabled="resending || resendCooldown > 0"
            class="text-sm font-medium text-yellow-600 hover:text-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="resendCooldown > 0">Reenviar em {{ resendCooldown }}s</span>
            <span v-else-if="resending">Enviando...</span>
            <span v-else>Reenviar código</span>
          </button>
        </div>

        <!-- Dica -->
        <div class="mt-6 pt-6 border-t border-stone-100 text-center">
          <p class="text-xs text-stone-400">
            Verifique também a pasta de spam. O código expira em 30 minutos.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
