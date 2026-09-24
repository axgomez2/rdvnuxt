<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useWantlistStore } from '~/stores/wantlist'
import { useSiteSettingsStore } from '~/stores/siteSettings'

const authStore = useAuthStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const wantlistStore = useWantlistStore()
const siteSettings = useSiteSettingsStore()
const route = useRoute()
const router = useRouter()

const logoSrc = computed(() => siteSettings.logoWhite || '/images/logo.png')

const mobileMenuOpen = ref(false)
const searchOpen = ref(false)
const userDropdownOpen = ref(false)
const searchQuery = ref('')

const closeDropdowns = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.user-dropdown')) {
    userDropdownOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', closeDropdowns)
  siteSettings.fetchSettings()
  authStore.initializeAuth()
  
  // Carregar dados do usuário autenticado
  if (authStore.isAuthenticated) {
    await Promise.all([
      cartStore.fetchCart(),
      wishlistStore.fetchWishlist(),
      wantlistStore.fetchWantlist()
    ])
  }
})

// Watch para carregar dados quando usuário logar
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    await Promise.all([
      cartStore.fetchCart(),
      wishlistStore.fetchWishlist(),
      wantlistStore.fetchWantlist()
    ])
  } else {
    cartStore.clearCart()
    wishlistStore.clear()
    wantlistStore.clear()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/busca', query: { q: searchQuery.value } })
    searchOpen.value = false
    searchQuery.value = ''
  }
}

const handleLogout = async () => {
  await authStore.logout()
  closeMobileMenu()
  router.push('/')
}

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="sticky top-0 z-50">
    <!-- DESKTOP NAVBAR -->
    <nav class="hidden lg:block bg-stone-900">
      <!-- Parte Superior: Logo, Busca, Login/Cadastro ou Área do Cliente + Carrinho -->
      <div class="border-b border-stone-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <NuxtLink to="/" class="flex items-center flex-shrink-0">
              <img :src="logoSrc" :alt="siteSettings.siteName" class="h-11 w-auto" />
            </NuxtLink>

            <!-- Campo de Busca -->
            <div class="flex-1 max-w-xl mx-8">
              <form @submit.prevent="handleSearch" class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Buscar discos, artistas, gêneros..."
                  class="w-full bg-stone-800 border border-stone-700 rounded-lg pl-4 pr-12 py-2.5 text-white placeholder-stone-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                />
                <button
                  type="submit"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-yellow-400 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </form>
            </div>

            <!-- Área do Usuário + Carrinho -->
            <div class="flex items-center space-x-4">
              <template v-if="authStore.isAuthenticated">
                <!-- Dropdown Área do Cliente -->
                <div class="relative user-dropdown">
                  <button
                    @click="userDropdownOpen = !userDropdownOpen"
                    class="flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors"
                  >
                    <div class="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span class="text-stone-900 font-semibold text-sm">{{ authStore.userInitials }}</span>
                    </div>
                    <span class="font-medium hidden xl:inline">{{ authStore.user?.name?.split(' ')[0] }}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  <!-- Dropdown Menu -->
                  <Transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="transform opacity-0 scale-95"
                    enter-to-class="transform opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="transform opacity-100 scale-100"
                    leave-to-class="transform opacity-0 scale-95"
                  >
                    <div
                      v-show="userDropdownOpen"
                      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <div class="px-4 py-2 border-b border-gray-100">
                        <p class="font-medium text-gray-900">{{ authStore.user?.name }}</p>
                        <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
                      </div>
                      <NuxtLink to="/minha-conta" class="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Minha Conta
                      </NuxtLink>
                      <NuxtLink to="/minha-conta/pedidos" class="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                        Meus Pedidos
                      </NuxtLink>
                      <NuxtLink to="/wishlist" class="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg class="w-5 h-5 mr-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Wishlist
                        <span v-if="wishlistStore.count > 0" class="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {{ wishlistStore.count }}
                        </span>
                      </NuxtLink>
                      <NuxtLink to="/wantlist" class="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg class="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        </svg>
                        Wantlist
                        <span v-if="wantlistStore.count > 0" class="ml-auto bg-purple-100 text-purple-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {{ wantlistStore.count }}
                        </span>
                      </NuxtLink>
                      <NuxtLink to="/minha-conta/enderecos" class="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Endereços
                      </NuxtLink>
                      <hr class="my-2 border-gray-100">
                      <button
                        @click="handleLogout"
                        class="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Sair
                      </button>
                    </div>
                  </Transition>
                </div>

                <!-- Carrinho -->
                <NuxtLink to="/carrinho" class="relative p-2 text-white hover:text-yellow-400 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span
                    v-if="cartStore.count > 0"
                    class="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-stone-900 text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {{ cartStore.count > 9 ? '9+' : cartStore.count }}
                  </span>
                </NuxtLink>
              </template>

              <template v-else>
                <!-- Login e Cadastro -->
                <NuxtLink
                  to="/login"
                  class="text-white hover:text-yellow-400 transition-colors font-medium"
                >
                  Entrar
                </NuxtLink>
                <NuxtLink
                  to="/cadastro"
                  class="bg-yellow-400 text-stone-900 px-5 py-2 rounded-lg hover:bg-yellow-300 transition-colors font-semibold"
                >
                  Cadastrar
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Parte Inferior: Links de Navegação -->
      <div class="bg-stone-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center space-x-6 h-12">
            <NuxtLink
              to="/"
              class="font-medium text-sm uppercase tracking-wide transition-colors"
              :class="isActive('/') && route.path === '/' ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/discos-novos"
              class="font-medium text-sm uppercase tracking-wide transition-colors"
              :class="isActive('/discos-novos') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
            >
              Discos Novos
            </NuxtLink>
            <NuxtLink
              to="/discos-usados"
              class="font-medium text-sm uppercase tracking-wide transition-colors"
              :class="isActive('/discos-usados') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
            >
              Discos Usados
            </NuxtLink>
            <NuxtLink
              to="/produtos"
              class="font-medium text-sm uppercase tracking-wide transition-colors"
              :class="isActive('/produtos') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
            >
              Produtos
            </NuxtLink>
            <NuxtLink
              to="/charts-playlists"
              class="font-medium text-sm uppercase tracking-wide transition-colors"
              :class="isActive('/charts-playlists') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
            >
              Charts & Playlists
            </NuxtLink>
            <NuxtLink
              to="/ofertas"
              class="font-medium text-sm uppercase tracking-wide transition-colors"
              :class="isActive('/ofertas') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
            >
              Ofertas
            </NuxtLink>
            <NuxtLink
              to="/noticias"
              class="font-medium text-sm uppercase tracking-wide transition-colors"
              :class="isActive('/noticias') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
            >
              Notícias
            </NuxtLink>
            <NuxtLink
              to="/eventos"
              class="font-medium text-sm uppercase tracking-wide transition-colors"
              :class="isActive('/eventos') ? 'text-yellow-400' : 'text-white hover:text-yellow-400'"
            >
              Eventos
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- MOBILE NAVBAR -->
    <nav class="lg:hidden bg-stone-900">
      <div class="px-4 h-14 flex items-center justify-between">
        <!-- Menu Hamburger -->
        <button
          @click="mobileMenuOpen = true"
          class="p-2 text-white hover:text-yellow-400 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Logo Central -->
        <NuxtLink to="/" class="flex items-center">
          <img :src="logoSrc" :alt="siteSettings.siteName" class="h-9 w-auto" />
        </NuxtLink>

        <!-- Ações à Direita -->
        <div class="flex items-center space-x-1">
          <!-- Botão de Busca -->
          <button
            @click="searchOpen = !searchOpen"
            class="p-2 text-white hover:text-yellow-400 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>

          <!-- Usuário ou Login -->
          <template v-if="authStore.isAuthenticated">
            <NuxtLink to="/carrinho" class="relative p-2 text-white hover:text-yellow-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span
                v-if="cartStore.count > 0"
                class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-stone-900 text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {{ cartStore.count > 9 ? '9+' : cartStore.count }}
              </span>
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="p-2 text-white hover:text-yellow-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </NuxtLink>
          </template>
        </div>
      </div>

      <!-- Barra de Busca Mobile (expansível) -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-show="searchOpen" class="px-4 pb-3 bg-stone-900 border-t border-stone-800">
          <form @submit.prevent="handleSearch" class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar discos..."
              class="w-full bg-stone-800 border border-stone-700 rounded-lg pl-4 pr-10 py-2.5 text-white placeholder-stone-400 focus:outline-none focus:border-yellow-400"
            />
            <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </form>
        </div>
      </Transition>
    </nav>

    <!-- MOBILE DRAWER -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-show="mobileMenuOpen"
          class="fixed inset-0 z-50 lg:hidden"
        >
          <!-- Overlay -->
          <div
            class="absolute inset-0 bg-black/60"
            @click="mobileMenuOpen = false"
          ></div>

          <!-- Drawer -->
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="-translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="translate-x-0"
            leave-to-class="-translate-x-full"
          >
            <div
              v-show="mobileMenuOpen"
              class="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-stone-900 shadow-2xl flex flex-col"
            >
              <!-- Header do Drawer -->
              <div class="flex items-center justify-between p-4 border-b border-stone-800">
                <NuxtLink to="/" @click="closeMobileMenu" class="flex items-center">
                  <img :src="logoSrc" :alt="siteSettings.siteName" class="h-9 w-auto" />
                </NuxtLink>
                <button
                  @click="mobileMenuOpen = false"
                  class="p-2 text-stone-400 hover:text-white transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Links de Navegação -->
              <nav class="flex-1 overflow-y-auto py-4">
                <div class="px-4 space-y-1">
                  <NuxtLink
                    to="/"
                    @click="closeMobileMenu"
                    class="flex items-center px-4 py-3 rounded-lg font-medium transition-colors"
                    :class="isActive('/') && route.path === '/' ? 'bg-stone-800 text-yellow-400' : 'text-white hover:bg-stone-800 hover:text-yellow-400'"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Home
                  </NuxtLink>
                  <NuxtLink
                    to="/discos-novos"
                    @click="closeMobileMenu"
                    class="flex items-center px-4 py-3 rounded-lg font-medium transition-colors"
                    :class="isActive('/discos-novos') ? 'bg-stone-800 text-yellow-400' : 'text-white hover:bg-stone-800 hover:text-yellow-400'"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke-width="2" fill="none"/>
                      <circle cx="12" cy="12" r="3" stroke-width="2" fill="none"/>
                    </svg>
                    Discos Novos
                  </NuxtLink>
                  <NuxtLink
                    to="/discos-usados"
                    @click="closeMobileMenu"
                    class="flex items-center px-4 py-3 rounded-lg font-medium transition-colors"
                    :class="isActive('/discos-usados') ? 'bg-stone-800 text-yellow-400' : 'text-white hover:bg-stone-800 hover:text-yellow-400'"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke-width="2" fill="none"/>
                      <circle cx="12" cy="12" r="3" stroke-width="2" fill="none"/>
                    </svg>
                    Discos Usados
                  </NuxtLink>
                  <NuxtLink
                    to="/produtos"
                    @click="closeMobileMenu"
                    class="flex items-center px-4 py-3 rounded-lg font-medium transition-colors"
                    :class="isActive('/produtos') ? 'bg-stone-800 text-yellow-400' : 'text-white hover:bg-stone-800 hover:text-yellow-400'"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    Produtos
                  </NuxtLink>
                  <NuxtLink
                    to="/charts-playlists"
                    @click="closeMobileMenu"
                    class="flex items-center px-4 py-3 rounded-lg font-medium transition-colors"
                    :class="isActive('/charts-playlists') ? 'bg-stone-800 text-yellow-400' : 'text-white hover:bg-stone-800 hover:text-yellow-400'"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                    </svg>
                    Charts & Playlists
                  </NuxtLink>
                  <NuxtLink
                    to="/ofertas"
                    @click="closeMobileMenu"
                    class="flex items-center px-4 py-3 rounded-lg font-medium transition-colors"
                    :class="isActive('/ofertas') ? 'bg-stone-800 text-yellow-400' : 'text-white hover:bg-stone-800 hover:text-yellow-400'"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    Ofertas
                  </NuxtLink>
                  <NuxtLink
                    to="/noticias"
                    @click="closeMobileMenu"
                    class="flex items-center px-4 py-3 rounded-lg font-medium transition-colors"
                    :class="isActive('/noticias') ? 'bg-stone-800 text-yellow-400' : 'text-white hover:bg-stone-800 hover:text-yellow-400'"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                    Notícias
                  </NuxtLink>
                  <NuxtLink
                    to="/eventos"
                    @click="closeMobileMenu"
                    class="flex items-center px-4 py-3 rounded-lg font-medium transition-colors"
                    :class="isActive('/eventos') ? 'bg-stone-800 text-yellow-400' : 'text-white hover:bg-stone-800 hover:text-yellow-400'"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Eventos
                  </NuxtLink>
                </div>
              </nav>

              <!-- Área do Usuário (parte inferior) -->
              <div class="border-t border-stone-800 p-4">
                <template v-if="authStore.isAuthenticated">
                  <div class="flex items-center space-x-3 mb-4 px-2">
                    <div class="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-stone-900 font-bold text-lg">{{ authStore.userInitials }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-white truncate">{{ authStore.user?.name }}</p>
                      <p class="text-sm text-stone-400 truncate">{{ authStore.user?.email }}</p>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <NuxtLink
                      to="/minha-conta"
                      @click="closeMobileMenu"
                      class="flex items-center px-4 py-2.5 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-yellow-400 transition-colors text-sm"
                    >
                      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Minha Conta
                    </NuxtLink>
                    <NuxtLink
                      to="/minha-conta/pedidos"
                      @click="closeMobileMenu"
                      class="flex items-center px-4 py-2.5 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-yellow-400 transition-colors text-sm"
                    >
                      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                      Meus Pedidos
                    </NuxtLink>
                    <NuxtLink
                      to="/wishlist"
                      @click="closeMobileMenu"
                      class="flex items-center px-4 py-2.5 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-yellow-400 transition-colors text-sm"
                    >
                      <svg class="w-5 h-5 mr-3 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      Wishlist
                      <span v-if="wishlistStore.count > 0" class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {{ wishlistStore.count }}
                      </span>
                    </NuxtLink>
                    <NuxtLink
                      to="/wantlist"
                      @click="closeMobileMenu"
                      class="flex items-center px-4 py-2.5 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-yellow-400 transition-colors text-sm"
                    >
                      <svg class="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      Wantlist
                      <span v-if="wantlistStore.count > 0" class="ml-auto bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {{ wantlistStore.count }}
                      </span>
                    </NuxtLink>
                    <NuxtLink
                      to="/carrinho"
                      @click="closeMobileMenu"
                      class="flex items-center px-4 py-2.5 rounded-lg text-stone-300 hover:bg-stone-800 hover:text-yellow-400 transition-colors text-sm"
                    >
                      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      Carrinho
                      <span v-if="cartStore.count > 0" class="ml-auto bg-yellow-400 text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        {{ cartStore.count }}
                      </span>
                    </NuxtLink>
                    <button
                      @click="handleLogout"
                      class="flex items-center w-full px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                    >
                      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Sair
                    </button>
                  </div>
                </template>
                <template v-else>
                  <div class="space-y-2">
                    <NuxtLink
                      to="/login"
                      @click="closeMobileMenu"
                      class="flex items-center justify-center w-full py-3 border border-stone-600 rounded-lg text-white hover:border-yellow-400 hover:text-yellow-400 transition-colors font-medium"
                    >
                      Entrar
                    </NuxtLink>
                    <NuxtLink
                      to="/cadastro"
                      @click="closeMobileMenu"
                      class="flex items-center justify-center w-full py-3 bg-yellow-400 rounded-lg text-stone-900 hover:bg-yellow-300 transition-colors font-semibold"
                    >
                      Cadastrar
                    </NuxtLink>
                  </div>
                </template>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>
