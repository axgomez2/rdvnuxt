import { defineStore } from 'pinia'

interface SiteSettings {
  siteName: string
  logo?: string
  logoWhite?: string
  favicon?: string
  primaryColor: string
  whatsappNumber?: string
  instagramUrl?: string
  facebookUrl?: string
  email?: string
  address?: string
  phone?: string
}

export const useSiteSettingsStore = defineStore('siteSettings', () => {
  const settings = ref<SiteSettings>({
    siteName: 'RDV Discos',
    logo: undefined,
    logoWhite: undefined,
    favicon: undefined,
    primaryColor: '#facc15',
    whatsappNumber: undefined,
    instagramUrl: undefined,
    facebookUrl: undefined,
    email: undefined,
    address: undefined,
    phone: undefined
  })
  const loading = ref(false)
  const loaded = ref(false)

  const siteName = computed(() => settings.value.siteName)
  const logo = computed(() => settings.value.logo)
  const logoWhite = computed(() => settings.value.logoWhite)

  const fetchSettings = async () => {
    if (loaded.value) return

    const config = useRuntimeConfig()
    loading.value = true
    
    try {
      const response = await $fetch<{ data: SiteSettings }>('/site-settings', {
        baseURL: config.public.apiBase
      })
      settings.value = { ...settings.value, ...response.data }
      loaded.value = true
    } catch (error) {
      console.error('Error fetching site settings:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    loaded,
    siteName,
    logo,
    logoWhite,
    fetchSettings
  }
})
