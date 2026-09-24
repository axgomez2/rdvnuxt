<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const authStore = useAuthStore()

onMounted(async () => {
  const code = route.query.code as string
  
  if (!code) {
    router.push('/login?error=no_code')
    return
  }

  try {
    // Enviar o código para a API Laravel processar
    const response = await $fetch<{ token: string; user: any }>('/auth/google/callback', {
      baseURL: config.public.apiBase,
      method: 'GET',
      params: {
        code: code,
        ...route.query
      }
    })

    // Salvar token e usuário
    if (response.token) {
      authStore.setToken(response.token)
      authStore.setUser(response.user)
      router.push('/')
    }
  } catch (error: any) {
    console.error('Erro no callback Google:', error)
    router.push('/login?error=google_auth_failed')
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-stone-100">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
      <p class="mt-4 text-stone-600">Autenticando com Google...</p>
    </div>
  </div>
</template>
