export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const api = $fetch.create({
    baseURL: config.public.apiBase as string,
    onRequest({ options }) {
      const token = useCookie('auth_token')
      if (token.value) {
        const headers = options.headers || {}
        if (headers instanceof Headers) {
          headers.set('Authorization', `Bearer ${token.value}`)
        } else {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${token.value}`
        }
        options.headers = headers
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        navigateTo('/login')
      }
    }
  })
  
  return {
    provide: {
      api
    }
  }
})
