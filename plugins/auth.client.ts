import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  
  // Aguardar a aplicação estar pronta para evitar problemas de hydration
  nuxtApp.hook('app:mounted', async () => {
    // Inicializar autenticação após a montagem para evitar mismatch
    await authStore.initializeAuth()
  })
})
