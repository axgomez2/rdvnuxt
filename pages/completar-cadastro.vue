<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

useHead({
  title: 'Completar Cadastro - RDV Discos'
})

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const requirements = ref<{ can_proceed: boolean; missing: string[] }>({
  can_proceed: true,
  missing: []
})

const form = ref({
  name: '',
  cpf: '',
  phone: '',
  birth_date: ''
})

const checkRequirements = async () => {
  try {
    const response = await $fetch<{ can_proceed: boolean; missing: string[]; user: any }>('/checkout/requirements', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    requirements.value = response
    
    // Preencher dados existentes
    if (response.user) {
      form.value.name = response.user.name || ''
      form.value.cpf = response.user.cpf || ''
      form.value.phone = response.user.phone || ''
      form.value.birth_date = response.user.birth_date || ''
    }
    
    // Se já pode prosseguir, redirecionar para checkout
    if (response.can_proceed) {
      router.replace('/checkout')
    }
  } catch (err) {
    console.error('Erro ao verificar requisitos:', err)
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true
  error.value = null
  
  try {
    await $fetch('/profile', {
      baseURL: config.public.apiBase,
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: form.value
    })
    
    success.value = true
    
    // Atualizar dados do usuário no store
    await authStore.fetchUser()
    
    // Redirecionar para checkout após 1 segundo
    setTimeout(() => {
      router.push('/checkout')
    }, 1000)
  } catch (err: any) {
    console.error('Erro ao salvar perfil:', err)
    error.value = err?.data?.message || 'Erro ao salvar dados. Verifique as informações.'
  } finally {
    saving.value = false
  }
}

// Formatar CPF
const formatCpf = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

const handleCpfInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  form.value.cpf = formatCpf(input.value)
}

// Formatar telefone
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return `(${numbers}`
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

const handlePhoneInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  form.value.phone = formatPhone(input.value)
}

onMounted(() => {
  checkRequirements()
})
</script>

<template>
  <div class="min-h-screen bg-stone-100 py-12">
    <div class="max-w-lg mx-auto px-4">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-yellow-400 px-6 py-8 text-center">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-stone-900">Complete seu Cadastro</h1>
          <p class="text-stone-700 mt-2">Precisamos de algumas informações para finalizar sua compra</p>
        </div>

        <!-- Form -->
        <div class="p-6">
          <!-- Campos faltantes -->
          <div v-if="requirements.missing.length > 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p class="text-sm text-amber-800 font-medium mb-2">Dados necessários:</p>
            <ul class="text-sm text-amber-700 list-disc list-inside">
              <li v-for="field in requirements.missing" :key="field">{{ field }}</li>
            </ul>
          </div>

          <!-- Erro -->
          <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error }}
          </div>

          <!-- Sucesso -->
          <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Dados salvos com sucesso! Redirecionando...
          </div>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <!-- Nome -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Nome Completo</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                placeholder="Seu nome completo"
              >
            </div>

            <!-- CPF -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">CPF</label>
              <input
                :value="form.cpf"
                @input="handleCpfInput"
                type="text"
                required
                maxlength="14"
                class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                placeholder="000.000.000-00"
              >
            </div>

            <!-- Telefone -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Telefone</label>
              <input
                :value="form.phone"
                @input="handlePhoneInput"
                type="text"
                required
                maxlength="15"
                class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                placeholder="(00) 00000-0000"
              >
            </div>

            <!-- Data de Nascimento -->
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Data de Nascimento</label>
              <input
                v-model="form.birth_date"
                type="date"
                required
                class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
              >
            </div>

            <!-- Botão -->
            <button
              type="submit"
              :disabled="saving"
              class="w-full bg-yellow-400 text-stone-900 py-3 rounded-lg font-bold hover:bg-yellow-300 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ saving ? 'Salvando...' : 'Salvar e Continuar' }}
            </button>
          </form>

          <!-- Link voltar -->
          <div class="mt-6 text-center">
            <NuxtLink to="/carrinho" class="text-stone-500 hover:text-stone-700 text-sm">
              Voltar ao carrinho
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
