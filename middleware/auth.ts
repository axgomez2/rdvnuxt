import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // Aguardar inicialização da autenticação
  if (!authStore.authInitialized) {
    await authStore.initializeAuth()
  }
  
  // Aguardar carregamento se estiver em andamento
  if (authStore.authLoading) {
    // Esperar um pouco para o carregamento completar
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Verificar se está autenticado (tem token E usuário)
  if (!authStore.isAuthenticated && !authStore.hasToken) {
    return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
  }
})
