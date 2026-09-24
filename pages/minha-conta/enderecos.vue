<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

useHead({
  title: 'Meus Endereços - RDV Discos'
})

const { data: addresses, pending, error, refresh } = await useFetch<{ data: any[] }>('/addresses', {
  baseURL: config.public.apiBase,
  headers: {
    Authorization: `Bearer ${authStore.token}`
  }
})

const deleteAddress = async (id: number) => {
  if (!confirm('Tem certeza que deseja excluir este endereço?')) return
  
  try {
    await $fetch(`/addresses/${id}`, {
      baseURL: config.public.apiBase,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    refresh()
  } catch (err) {
    console.error('Erro ao excluir endereço:', err)
  }
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <NuxtLink to="/minha-conta" class="p-2 hover:bg-stone-200 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </NuxtLink>
          <h1 class="text-2xl font-bold text-stone-900">Meus Endereços</h1>
        </div>
        <NuxtLink to="/minha-conta/enderecos/novo" class="bg-yellow-400 text-stone-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300">
          Novo Endereço
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4 text-stone-500">Carregando endereços...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl">
        Erro ao carregar endereços. Tente novamente.
      </div>

      <!-- Empty -->
      <div v-else-if="!addresses?.data?.length" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <svg class="w-16 h-16 text-stone-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <h2 class="mt-4 text-xl font-semibold text-stone-900">Nenhum endereço cadastrado</h2>
        <p class="mt-2 text-stone-500">Adicione um endereço para facilitar suas compras.</p>
        <NuxtLink to="/minha-conta/enderecos/novo" class="mt-6 inline-block bg-yellow-400 text-stone-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300">
          Adicionar Endereço
        </NuxtLink>
      </div>

      <!-- Addresses List -->
      <div v-else class="space-y-4">
        <div v-for="address in addresses.data" :key="address.id" class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-stone-900">{{ address.label || 'Endereço' }}</h3>
                <span v-if="address.is_default" class="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Padrão
                </span>
              </div>
              <p class="mt-2 text-stone-600">
                {{ address.street }}, {{ address.number }}
                <span v-if="address.complement">, {{ address.complement }}</span>
              </p>
              <p class="text-stone-600">{{ address.neighborhood }}</p>
              <p class="text-stone-600">{{ address.city }} - {{ address.state }}</p>
              <p class="text-stone-500">CEP: {{ address.zipcode }}</p>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/minha-conta/enderecos/${address.id}`" class="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </NuxtLink>
              <button @click="deleteAddress(address.id)" class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
