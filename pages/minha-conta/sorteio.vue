<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

useHead({
  title: 'Sorteio - RDV Discos'
})

const loading = ref(true)
const error = ref(false)
const data = ref<any>(null)
const showRegulation = ref(false)
const accepting = ref(false)

const fetchRaffleData = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response = await $fetch<{ data: any }>('/raffle', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    data.value = response.data
  } catch (err) {
    console.error('Erro ao carregar dados do sorteio:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const acceptTerms = async () => {
  accepting.value = true
  
  try {
    await $fetch('/raffle/accept', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    // Recarregar dados
    await fetchRaffleData()
  } catch (err) {
    console.error('Erro ao aceitar termos:', err)
  } finally {
    accepting.value = false
  }
}

const downloadPdf = () => {
  window.open(`${config.public.apiBase}/raffle/download-pdf?token=${authStore.token}`, '_blank')
}

onMounted(() => {
  fetchRaffleData()
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/minha-conta" class="p-2 hover:bg-stone-200 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </NuxtLink>
        <div>
          <h1 class="text-2xl font-bold text-stone-900">Sorteio RDV Discos</h1>
          <p class="text-sm text-stone-500">Seus números da sorte</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
        <p class="mt-4 text-stone-500">Carregando...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-xl">
        Erro ao carregar dados do sorteio. Tente novamente.
      </div>

      <template v-else-if="data">
        <!-- Info da Promoção -->
        <div class="bg-stone-900 text-white rounded-xl p-6 mb-6">
          <h2 class="text-xl font-bold text-yellow-400 mb-2">{{ data.settings?.name }}</h2>
          <div class="flex flex-wrap gap-4 text-sm text-stone-300">
            <span v-if="data.settings?.start_date">
              <strong>Início:</strong> {{ data.settings.start_date }}
            </span>
            <span v-if="data.settings?.end_date">
              <strong>Término:</strong> {{ data.settings.end_date }}
            </span>
            <span v-if="data.settings?.draw_date">
              <strong>Sorteio:</strong> {{ data.settings.draw_date }}
            </span>
          </div>
        </div>

        <!-- Aceite dos Termos -->
        <div v-if="!data.acceptance?.accepted" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div class="flex items-start gap-4">
            <svg class="w-8 h-8 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div class="flex-1">
              <h3 class="font-bold text-yellow-800 mb-2">Aceite os termos da promoção</h3>
              <p class="text-sm text-yellow-700 mb-4">
                Para participar do sorteio, você precisa ler e aceitar o regulamento da promoção.
              </p>
              <div class="flex flex-wrap gap-3">
                <button 
                  @click="showRegulation = true"
                  class="px-4 py-2 bg-white border border-yellow-300 rounded-lg text-sm font-medium text-yellow-800 hover:bg-yellow-50"
                >
                  Ler Regulamento
                </button>
                <button 
                  @click="acceptTerms"
                  :disabled="accepting"
                  class="px-4 py-2 bg-yellow-500 rounded-lg text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                >
                  {{ accepting ? 'Aceitando...' : 'Li e Aceito os Termos' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Aceite Confirmado -->
        <div v-else class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="font-medium text-green-800">Termos aceitos</p>
              <p class="text-sm text-green-600">Em {{ data.acceptance.accepted_at }}</p>
            </div>
            <button 
              @click="showRegulation = true"
              class="ml-auto text-sm text-green-600 hover:underline"
            >
              Ver regulamento
            </button>
          </div>
        </div>

        <!-- Estatísticas -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <p class="text-4xl font-bold text-yellow-500">{{ data.active_count }}</p>
            <p class="text-sm text-stone-500 mt-1">Números Ativos</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 text-center">
            <p class="text-4xl font-bold text-stone-400">{{ data.total_count }}</p>
            <p class="text-sm text-stone-500 mt-1">Total de Números</p>
          </div>
        </div>

        <!-- Números -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-stone-900">Seus Números da Sorte</h3>
            <button 
              v-if="data.numbers?.length > 0"
              @click="downloadPdf"
              class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Baixar PDF
            </button>
          </div>

          <div v-if="data.numbers?.length > 0" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div 
              v-for="number in data.numbers" 
              :key="number.id"
              class="rounded-lg p-4 text-center"
              :class="number.status === 'active' ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-stone-100 border-2 border-stone-300'"
            >
              <p 
                class="font-mono text-xl font-bold"
                :class="number.status === 'active' ? 'text-yellow-700' : 'text-stone-400 line-through'"
              >
                {{ number.formatted_number }}
              </p>
              <p class="text-xs text-stone-400 mt-1">{{ number.created_at.split(' ')[0] }}</p>
              <p v-if="number.status === 'cancelled'" class="text-xs text-red-500 mt-1">Cancelado</p>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h4 class="text-lg font-medium text-stone-700 mb-2">Você ainda não tem números</h4>
            <p class="text-sm text-stone-500 mb-4">
              Compre discos durante o período da promoção para ganhar números da sorte!
            </p>
            <NuxtLink to="/discos-novos" class="inline-block bg-yellow-400 text-stone-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300">
              Ver Discos
            </NuxtLink>
          </div>
        </div>

        <!-- Como funciona -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-bold text-stone-900 mb-4">Como funciona?</h3>
          <div class="space-y-4 text-sm text-stone-600">
            <div class="flex gap-3">
              <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold">1</div>
              <div>
                <p class="font-medium text-stone-900">Compre discos</p>
                <p>Cada disco comprado e pago durante o período da promoção gera 1 número.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold">2</div>
              <div>
                <p class="font-medium text-stone-900">Aceite os termos</p>
                <p>Leia e aceite o regulamento da promoção para participar.</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold">3</div>
              <div>
                <p class="font-medium text-stone-900">Aguarde o sorteio</p>
                <p>O sorteio será transmitido ao vivo pelo YouTube da RDV Discos.</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Modal do Regulamento -->
      <div v-if="showRegulation" class="fixed inset-0 z-50 overflow-y-auto" aria-modal="true">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black bg-opacity-50" @click="showRegulation = false"></div>
          <div class="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div class="flex items-center justify-between mb-4 sticky top-0 bg-white pb-4 border-b">
              <h3 class="text-xl font-bold text-stone-900">Regulamento da Promoção</h3>
              <button @click="showRegulation = false" class="p-2 hover:bg-stone-100 rounded-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="prose prose-sm max-w-none text-stone-600">
              <p class="whitespace-pre-wrap">{{ data?.regulation || 'Regulamento não disponível.' }}</p>
            </div>
            <div class="mt-6 pt-4 border-t flex justify-end gap-3">
              <button 
                @click="showRegulation = false"
                class="px-4 py-2 bg-stone-100 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-200"
              >
                Fechar
              </button>
              <button 
                v-if="!data?.acceptance?.accepted"
                @click="acceptTerms(); showRegulation = false"
                :disabled="accepting"
                class="px-4 py-2 bg-yellow-500 rounded-lg text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                {{ accepting ? 'Aceitando...' : 'Li e Aceito os Termos' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
