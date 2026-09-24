<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()

// Redirecionar se não autenticado
if (!authStore.isAuthenticated) {
  router.push('/login')
}

useHead({
  title: 'Minha Conta - RDV Discos'
})

const menuItems = [
  { label: 'Meus Pedidos', href: '/minha-conta/pedidos', icon: 'orders' },
  { label: 'Meus Endereços', href: '/minha-conta/enderecos', icon: 'address' },
  { label: 'Wishlist', href: '/wishlist', icon: 'heart' },
  { label: 'Wantlist', href: '/wantlist', icon: 'bell' },
  { label: 'Meus Dados', href: '/minha-conta/dados', icon: 'user' },
]
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-stone-900">
            {{ authStore.userInitials }}
          </div>
          <div>
            <h1 class="text-2xl font-bold text-stone-900">{{ authStore.user?.name }}</h1>
            <p class="text-stone-500">{{ authStore.user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Menu -->
      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.href"
          :to="item.href"
          class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div class="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
            <svg v-if="item.icon === 'orders'" class="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <svg v-else-if="item.icon === 'address'" class="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <svg v-else-if="item.icon === 'heart'" class="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <svg v-else-if="item.icon === 'bell'" class="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <svg v-else class="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <span class="font-medium text-stone-900">{{ item.label }}</span>
        </NuxtLink>
      </div>

      <!-- Logout -->
      <button
        @click="authStore.logout(); router.push('/')"
        class="mt-6 w-full bg-white rounded-xl shadow-sm p-4 text-red-600 font-medium hover:bg-red-50 transition-colors"
      >
        Sair da conta
      </button>
    </div>
  </div>
</template>
