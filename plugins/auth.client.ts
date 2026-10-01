import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  // Inicializar autenticação ao carregar a aplicação
  await authStore.initializeAuth()
})
