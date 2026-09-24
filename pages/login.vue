<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4">
    <div class="bg-stone-800 rounded-xl p-8 w-full max-w-md shadow-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center justify-center space-x-2">
          <img
            v-if="logoSrc"
            :src="logoSrc"
            :alt="siteSettings.siteName"
            class="h-12 w-auto"
          />
          <template v-else>
            <div class="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-stone-900" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
              </svg>
            </div>
            <span class="text-2xl font-bold text-white">{{ siteSettings.siteName }}</span>
          </template>
        </NuxtLink>
        <p class="text-stone-400 mt-3">Entre na sua conta</p>
      </div>

      <!-- Erro geral -->
      <div v-if="error" class="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
        {{ error }}
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-stone-300 mb-2">E-mail</label>
          <input 
            v-model="form.email"
            type="email" 
            class="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
            placeholder="seu@email.com"
            required
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-400">{{ errors.email[0] }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-300 mb-2">Senha</label>
          <div class="relative">
            <input 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'" 
              class="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors pr-12"
              placeholder="••••••••"
              required
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
            >
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-400">{{ errors.password[0] }}</p>
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center text-stone-400 cursor-pointer">
            <input type="checkbox" v-model="form.remember" class="w-4 h-4 rounded border-stone-600 bg-stone-700 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-stone-800">
            <span class="ml-2">Lembrar de mim</span>
          </label>
          <NuxtLink to="/esqueci-senha" class="text-yellow-400 hover:text-yellow-300 transition-colors">
            Esqueceu a senha?
          </NuxtLink>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-yellow-400 text-stone-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <!-- Divisor -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-stone-600"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-stone-800 text-stone-400">ou continue com</span>
        </div>
      </div>

      <!-- Login com Google -->
      <button 
        @click="handleGoogleLogin"
        :disabled="googleLoading"
        class="w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ googleLoading ? 'Conectando...' : 'Continuar com Google' }}
      </button>

      <!-- Link para cadastro -->
      <p class="text-center text-stone-400 mt-6">
        Não tem conta? 
        <NuxtLink to="/cadastro" class="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
          Cadastre-se
        </NuxtLink>
      </p>

      <!-- Voltar -->
      <NuxtLink to="/" class="flex items-center justify-center gap-2 text-stone-500 mt-4 hover:text-stone-300 transition-colors text-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Voltar para Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useSiteSettingsStore } from '~/stores/siteSettings'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const siteSettings = useSiteSettingsStore()

const logoSrc = computed(() => siteSettings.logoWhite || siteSettings.logo || undefined)

const form = ref({
  email: '',
  password: '',
  remember: false
})
const loading = ref(false)
const googleLoading = ref(false)
const showPassword = ref(false)
const error = ref('')
const errors = ref<Record<string, string[]>>({})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  errors.value = {}

  try {
    const config = useRuntimeConfig()
    const response = await $fetch<{ token: string; user: any; requires_verification?: boolean }>('/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password
      }
    })

    authStore.setToken(response.token)
    authStore.setUser(response.user)
    
    if (response.requires_verification) {
      router.push('/verificar-email')
    } else {
      const redirect = route.query.redirect as string || '/'
      router.push(redirect)
    }
  } catch (err: any) {
    if (err.response?.status === 422) {
      errors.value = err.data?.errors || {}
      error.value = err.data?.message || 'Dados inválidos.'
    } else if (err.response?.status === 401) {
      error.value = 'E-mail ou senha incorretos.'
    } else if (err.response?.status === 403) {
      error.value = err.data?.message || 'Conta desativada.'
    } else {
      error.value = 'Erro ao fazer login. Tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true
  error.value = ''

  try {
    const config = useRuntimeConfig()
    const response = await $fetch<{ url: string }>('/auth/google', {
      baseURL: config.public.apiBase
    })
    window.location.href = response.url
  } catch (err) {
    error.value = 'Erro ao conectar com Google. Tente novamente.'
    googleLoading.value = false
  }
}

useHead({
  title: 'Login - RDV Discos'
})
</script>
