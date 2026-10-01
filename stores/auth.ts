import { defineStore } from 'pinia'
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const authLoading = ref(false)
  const authInitialized = ref(false)
  
  // Cookie para persistir token (30 dias)
  const tokenCookie = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })
  
  // Autenticado = tem token E tem usuário carregado
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  // Tem token mas ainda não carregou usuário
  const hasToken = computed(() => !!token.value)
  
  const userInitials = computed(() => {
    if (!user.value?.name) return ''
    const names = user.value.name.split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase()
    }
    return names[0].substring(0, 2).toUpperCase()
  })

  const login = async (credentials: LoginRequest) => {
    const config = useRuntimeConfig()
    const response = await $fetch<AuthResponse>('/auth/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: credentials
    })
    
    token.value = response.token
    user.value = response.user
    
    // Salvar token no cookie e localStorage
    tokenCookie.value = response.token
    if (process.client) {
      localStorage.setItem('auth_token', response.token)
    }
    
    return response
  }

  const register = async (data: RegisterRequest) => {
    const config = useRuntimeConfig()
    const response = await $fetch<AuthResponse>('/auth/register', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: data
    })
    
    token.value = response.token
    user.value = response.user
    
    // Salvar token no cookie e localStorage
    tokenCookie.value = response.token
    if (process.client) {
      localStorage.setItem('auth_token', response.token)
    }
    
    return response
  }

  const logout = async () => {
    const config = useRuntimeConfig()
    try {
      await $fetch('/auth/logout', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      tokenCookie.value = null
      
      if (process.client) {
        localStorage.removeItem('auth_token')
      }
    }
  }

  const fetchUser = async () => {
    const config = useRuntimeConfig()
    try {
      const response = await $fetch<{ user: User }>('/auth/user', {
        baseURL: config.public.apiBase,
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      // A API retorna { user: {...} }
      user.value = response.user
      return response.user
    } catch (error: any) {
      // Se o token for inválido (401) ou houver redirect, limpar sessão
      if (error?.status === 401 || error?.response?.status === 401 || error?.message?.includes('Failed to fetch')) {
        clearSession()
      }
      throw error
    }
  }

  const clearSession = () => {
    token.value = null
    user.value = null
    tokenCookie.value = null
    if (process.client) {
      localStorage.removeItem('auth_token')
    }
  }

  const initializeAuth = async () => {
    // Evitar inicialização duplicada
    if (authInitialized.value) return
    authInitialized.value = true
    
    // Tentar recuperar token do cookie ou localStorage
    const savedToken = tokenCookie.value || (process.client ? localStorage.getItem('auth_token') : null)
    
    if (savedToken) {
      // Setar loading ANTES de setar o token
      authLoading.value = true
      token.value = savedToken
      
      // Sincronizar cookie se veio do localStorage
      if (!tokenCookie.value && process.client) {
        tokenCookie.value = savedToken
      }
      
      try {
        await fetchUser()
      } catch (error) {
        // Token inválido, já foi limpo no fetchUser
        console.error('Token inválido, sessão limpa')
      } finally {
        authLoading.value = false
      }
    }
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    tokenCookie.value = newToken
    if (process.client) {
      localStorage.setItem('auth_token', newToken)
    }
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  return {
    user,
    token,
    authLoading,
    authInitialized,
    isAuthenticated,
    hasToken,
    userInitials,
    login,
    register,
    logout,
    fetchUser,
    initializeAuth,
    setToken,
    setUser,
    clearSession
  }
})
