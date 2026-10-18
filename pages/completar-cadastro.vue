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
const loadingCep = ref(false)

const requirements = ref<{ can_proceed: boolean; missing: string[]; user?: any; has_address?: boolean }>({
  can_proceed: true,
  missing: [],
  has_address: false
})

// Dados pessoais
const profile = ref({
  name: '',
  cpf: '',
  phone: '',
  birth_date: ''
})

// Endereço
const address = ref({
  label: 'Casa',
  zipcode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  is_default: true
})

const needsProfile = computed(() => {
  const missing = requirements.value.missing || []
  return missing.some(m => 
    m.toLowerCase().includes('cpf') || 
    m.toLowerCase().includes('telefone') ||
    m.toLowerCase().includes('nome')
  )
})

const needsAddress = computed(() => {
  return !requirements.value.has_address
})

const checkRequirements = async () => {
  try {
    const response = await $fetch<{ can_proceed: boolean; missing: string[]; user: any; has_address: boolean }>('/checkout/requirements', {
      baseURL: config.public.apiBase,
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    
    requirements.value = {
      can_proceed: response.can_proceed ?? false,
      missing: response.missing ?? [],
      user: response.user,
      has_address: response.has_address ?? false
    }
    
    // Preencher dados existentes
    if (response.user) {
      profile.value.name = response.user.name || ''
      profile.value.cpf = response.user.cpf || ''
      profile.value.phone = response.user.phone || ''
      profile.value.birth_date = response.user.birth_date || ''
    }
    
    // Se já pode prosseguir, redirecionar para checkout
    if (response.can_proceed) {
      router.replace('/checkout')
    }
  } catch (err) {
    console.error('Erro ao verificar requisitos:', err)
    error.value = 'Erro ao carregar dados. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const searchCep = async () => {
  const cep = address.value.zipcode.replace(/\D/g, '')
  if (cep.length !== 8) return
  
  loadingCep.value = true
  try {
    const data = await $fetch<any>(`https://viacep.com.br/ws/${cep}/json/`)
    if (!data.erro) {
      address.value.street = data.logradouro || ''
      address.value.neighborhood = data.bairro || ''
      address.value.city = data.localidade || ''
      address.value.state = data.uf || ''
    }
  } catch (err) {
    console.error('Erro ao buscar CEP:', err)
  } finally {
    loadingCep.value = false
  }
}

const saveAll = async () => {
  saving.value = true
  error.value = null
  
  try {
    // 1. Salvar dados pessoais se necessário
    if (needsProfile.value) {
      const body: Record<string, string> = {}
      if (profile.value.name) body.name = profile.value.name
      if (profile.value.cpf) body.cpf = profile.value.cpf
      if (profile.value.phone) body.phone = profile.value.phone
      if (profile.value.birth_date) body.birth_date = profile.value.birth_date

      await $fetch('/auth/profile', {
        baseURL: config.public.apiBase,
        method: 'PUT',
        headers: { Authorization: `Bearer ${authStore.token}` },
        body
      })
    }
    
    // 2. Salvar endereço se necessário
    if (needsAddress.value) {
      await $fetch('/addresses', {
        baseURL: config.public.apiBase,
        method: 'POST',
        headers: { Authorization: `Bearer ${authStore.token}` },
        body: {
          ...address.value,
          zipcode: address.value.zipcode.replace(/\D/g, '')
        }
      })
    }
    
    success.value = true
    
    // Atualizar dados do usuário no store
    await authStore.fetchUser()
    
    // Redirecionar para checkout
    router.push('/checkout')
  } catch (err: any) {
    console.error('Erro ao salvar:', err)
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
  profile.value.cpf = formatCpf(input.value)
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
  profile.value.phone = formatPhone(input.value)
}

// Formatar CEP
const formatCep = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 5) return numbers
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
}

const handleCepInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  address.value.zipcode = formatCep(input.value)
  if (input.value.replace(/\D/g, '').length === 8) {
    searchCep()
  }
}

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

onMounted(() => {
  checkRequirements()
})
</script>

<template>
  <div class="min-h-screen bg-stone-100 py-12">
    <div class="max-w-2xl mx-auto px-4">
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
          <div v-if="requirements.missing && requirements.missing.length > 0" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
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

          <form @submit.prevent="saveAll" class="space-y-6">
            <!-- Dados Pessoais -->
            <div v-if="needsProfile">
              <h2 class="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Dados Pessoais
              </h2>
              
              <div class="grid gap-4 sm:grid-cols-2">
                <!-- Nome -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-stone-700 mb-1">Nome Completo</label>
                  <input
                    v-model="profile.name"
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
                    :value="profile.cpf"
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
                  <label class="block text-sm font-medium text-stone-700 mb-1">Telefone/WhatsApp</label>
                  <input
                    :value="profile.phone"
                    @input="handlePhoneInput"
                    type="text"
                    required
                    maxlength="15"
                    class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                    placeholder="(00) 00000-0000"
                  >
                </div>
              </div>
            </div>

            <!-- Divisor -->
            <div v-if="needsProfile && needsAddress" class="border-t border-stone-200"></div>

            <!-- Endereço -->
            <div v-if="needsAddress">
              <h2 class="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Endereço de Entrega
              </h2>
              
              <div class="grid gap-4 sm:grid-cols-2">
                <!-- CEP -->
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1">CEP</label>
                  <div class="relative">
                    <input
                      :value="address.zipcode"
                      @input="handleCepInput"
                      type="text"
                      required
                      maxlength="9"
                      class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                      placeholder="00000-000"
                    >
                    <div v-if="loadingCep" class="absolute right-3 top-1/2 -translate-y-1/2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                    </div>
                  </div>
                </div>

                <!-- Rótulo -->
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1">Identificação</label>
                  <select
                    v-model="address.label"
                    class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                  >
                    <option value="Casa">Casa</option>
                    <option value="Trabalho">Trabalho</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <!-- Rua -->
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-stone-700 mb-1">Rua</label>
                  <input
                    v-model="address.street"
                    type="text"
                    required
                    class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                    placeholder="Nome da rua"
                  >
                </div>

                <!-- Número -->
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1">Número</label>
                  <input
                    v-model="address.number"
                    type="text"
                    required
                    class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                    placeholder="123"
                  >
                </div>

                <!-- Complemento -->
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1">
                    Complemento
                    <span class="text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    v-model="address.complement"
                    type="text"
                    class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                    placeholder="Apto, bloco..."
                  >
                </div>

                <!-- Bairro -->
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1">Bairro</label>
                  <input
                    v-model="address.neighborhood"
                    type="text"
                    required
                    class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                    placeholder="Bairro"
                  >
                </div>

                <!-- Cidade -->
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1">Cidade</label>
                  <input
                    v-model="address.city"
                    type="text"
                    required
                    class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                    placeholder="Cidade"
                  >
                </div>

                <!-- Estado -->
                <div>
                  <label class="block text-sm font-medium text-stone-700 mb-1">Estado</label>
                  <select
                    v-model="address.state"
                    required
                    class="w-full rounded-lg border-stone-300 focus:border-yellow-400 focus:ring-yellow-400"
                  >
                    <option value="">Selecione</option>
                    <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
                  </select>
                </div>
              </div>
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
              {{ saving ? 'Salvando...' : 'Salvar e Continuar para Checkout' }}
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
