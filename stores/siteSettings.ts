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
  // Chaves como a API realmente devolve (site_settings.key)
  site_name?: string
  logo_white?: string
  site_whatsapp?: string
  footer_whatsapp?: string
  footer_email?: string
  footer_address?: string
  footer_phone?: string
  social_instagram?: string
  social_facebook?: string
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

  // A API devolve chaves snake_case (site_name, logo_white, footer_whatsapp)
  const siteName = computed(() => settings.value.site_name || settings.value.siteName)
  const logo = computed(() => settings.value.logo)
  const logoWhite = computed(() => settings.value.logo_white || settings.value.logoWhite)
  const whatsappNumber = computed(() => settings.value.site_whatsapp || settings.value.footer_whatsapp || '')

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
    whatsappNumber,
    fetchSettings
  }
})
