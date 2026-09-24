export const useApi = () => {
  const config = useRuntimeConfig()
  
  const apiBase = config.public.apiBase
  
  const $fetch = (url: string, options?: any) => {
    return $fetch(url, {
      baseURL: apiBase,
      ...options
    })
  }
  
  return {
    apiBase,
    $fetch
  }
}
