<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const router = useRouter()

useHead({
  title: 'Novo Endereço - RDV Discos'
})

const loading = ref(false)
const loadingCep = ref(false)
const error = ref('')

const form = ref({
  label: '',
  recipient_name: '',
  zip_code: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  reference: '',
  is_default: false
})

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const formatCep = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 5) return numbers
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
}

const onCepInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  form.value.zip_code = formatCep(target.value)
}

const searchCep = async () => {
  const cep = form.value.zip_code.replace(/\D/g, '')
  if (cep.length !== 8) return

  loadingCep.value = true
  try {
    const response = await $fetch<any>(`https://viacep.com.br/ws/${cep}/json/`)
    if (!response.erro) {
      form.value.street = response.logradouro || ''
      form.value.neighborhood = response.bairro || ''
      form.value.city = response.localidade || ''
      form.value.state = response.uf || ''
    }
  } catch (err) {
    console.error('Erro ao buscar CEP:', err)
  } finally {
    loadingCep.value = false
  }
}

const submit = async () => {
  error.value = ''
  loading.value = true

  try {
    await $fetch('/addresses', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        ...form.value,
        zip_code: form.value.zip_code.replace(/\D/g, '')
      }
    })

    router.push('/minha-conta/enderecos')
  } catch (err: any) {
    console.error('Erro ao salvar endereço:', err)
    error.value = err.data?.message || 'Erro ao salvar endereço. Verifique os dados e tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/minha-conta/enderecos" class="p-2 hover:bg-stone-200 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-stone-900">Novo Endereço</h1>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
        {{ error }}
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <!-- Label -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-2">Nome do endereço (opcional)</label>
          <input
            v-model="form.label"
            type="text"
            placeholder="Ex: Casa, Trabalho..."
            class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>

        <!-- Recipient Name -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-2">Nome do destinatário (opcional)</label>
          <input
            v-model="form.recipient_name"
            type="text"
            placeholder="Quem deve receber a encomenda"
            class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>

        <!-- CEP -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-2">CEP *</label>
          <div class="flex gap-3">
            <input
              :value="form.zip_code"
              @input="onCepInput"
              @blur="searchCep"
              type="text"
              maxlength="9"
              placeholder="00000-000"
              required
              class="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
            <button
              type="button"
              @click="searchCep"
              :disabled="loadingCep"
              class="px-4 py-3 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 disabled:opacity-50"
            >
              <span v-if="loadingCep">...</span>
              <span v-else>Buscar</span>
            </button>
          </div>
        </div>

        <!-- Street -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-2">Rua/Logradouro *</label>
          <input
            v-model="form.street"
            type="text"
            required
            class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>

        <!-- Number & Complement -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Número *</label>
            <input
              v-model="form.number"
              type="text"
              required
              class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Complemento</label>
            <input
              v-model="form.complement"
              type="text"
              placeholder="Apto, Bloco..."
              class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
        </div>

        <!-- Neighborhood -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-2">Bairro *</label>
          <input
            v-model="form.neighborhood"
            type="text"
            required
            class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>

        <!-- City & State -->
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-medium text-stone-700 mb-2">Cidade *</label>
            <input
              v-model="form.city"
              type="text"
              required
              class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Estado *</label>
            <select
              v-model="form.state"
              required
              class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">UF</option>
              <option v-for="state in states" :key="state" :value="state">{{ state }}</option>
            </select>
          </div>
        </div>

        <!-- Reference -->
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-2">Ponto de referência (opcional)</label>
          <input
            v-model="form.reference"
            type="text"
            placeholder="Ex: Próximo ao mercado, portão azul..."
            class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          />
        </div>

        <!-- Default -->
        <div class="flex items-center gap-3">
          <input
            v-model="form.is_default"
            type="checkbox"
            id="is_default"
            class="w-5 h-5 text-yellow-500 border-stone-300 rounded focus:ring-yellow-400"
          />
          <label for="is_default" class="text-sm text-stone-700">Definir como endereço padrão</label>
        </div>

        <!-- Submit -->
        <div class="flex gap-4">
          <NuxtLink
            to="/minha-conta/enderecos"
            class="flex-1 px-6 py-3 bg-stone-100 text-stone-700 rounded-lg font-semibold text-center hover:bg-stone-200"
          >
            Cancelar
          </NuxtLink>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-6 py-3 bg-yellow-400 text-stone-900 rounded-lg font-semibold hover:bg-yellow-300 disabled:opacity-50"
          >
            {{ loading ? 'Salvando...' : 'Salvar Endereço' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
