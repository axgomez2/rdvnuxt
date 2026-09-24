import { defineStore } from 'pinia'
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  
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
    
    // Store token in localStorage
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
      
      if (process.client) {
        localStorage.removeItem('auth_token')
      }
    }
  }

  const fetchUser = async () => {
    const config = useRuntimeConfig()
    const response = await $fetch<User>('/auth/user', {
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
    
    user.value = response
    return response
  }

  const initializeAuth = () => {
    if (process.client) {
      const savedToken = localStorage.getItem('auth_token')
      if (savedToken) {
        token.value = savedToken
        fetchUser()
      }
    }
  }

  const setToken = (newToken: string) => {
    token.value = newToken
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
    isAuthenticated,
    userInitials,
    login,
    register,
    logout,
    fetchUser,
    initializeAuth,
    setToken,
    setUser
  }
})
