<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const authStore = useAuthStore()

const error = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  const code = route.query.code as string
  
  if (!code) {
    error.value = 'Código de autorização não encontrado'
    loading.value = false
    setTimeout(() => router.push('/login?error=no_code'), 2000)
    return
  }

  try {
    // Enviar o código para a API Laravel processar
    const response = await $fetch<{ token: string; user: any; message?: string }>('/auth/google/callback', {
      baseURL: config.public.apiBase,
      method: 'GET',
      params: {
        code: code,
        ...route.query
      }
    })

    console.log('Google callback response:', response)

    // Salvar token e usuário
    if (response.token) {
      authStore.setToken(response.token)
      
      if (response.user) {
        authStore.setUser(response.user)
      } else {
        // Se não veio usuário, buscar
        await authStore.fetchUser()
      }
      
      loading.value = false
      router.push('/')
    } else {
      error.value = 'Token não recebido da API'
      loading.value = false
      setTimeout(() => router.push('/login?error=no_token'), 2000)
    }
  } catch (err: any) {
    console.error('Erro no callback Google:', err)
    error.value = err?.data?.message || 'Erro ao autenticar com Google'
    loading.value = false
    setTimeout(() => router.push('/login?error=google_auth_failed'), 2000)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-100">
    <div class="text-center">
      <!-- Loading -->
      <template v-if="loading">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4 text-stone-600">Autenticando com Google...</p>
      </template>
      
      <!-- Error -->
      <template v-else-if="error">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <p class="mt-4 text-red-600">{{ error }}</p>
        <p class="mt-2 text-stone-500 text-sm">Redirecionando...</p>
      </template>
      
      <!-- Success -->
      <template v-else>
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <p class="mt-4 text-green-600">Login realizado com sucesso!</p>
        <p class="mt-2 text-stone-500 text-sm">Redirecionando...</p>
      </template>
    </div>
  </div>
</template>
