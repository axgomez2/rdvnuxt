<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()

useHead({
  title: 'Meus Dados - RDV Discos'
})

// Formulário de dados pessoais
const profileForm = ref({
  name: '',
  phone: '',
  cpf: '',
  birth_date: ''
})

const profileLoading = ref(false)
const profileSuccess = ref('')
const profileError = ref('')

// Formulário de senha
const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const passwordLoading = ref(false)
const passwordSuccess = ref('')
const passwordError = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

const formatCpf = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

const onPhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  profileForm.value.phone = formatPhone(target.value)
}

const onCpfInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  profileForm.value.cpf = formatCpf(target.value)
}

const loadUserData = () => {
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name || '',
      phone: authStore.user.phone || '',
      cpf: authStore.user.cpf || '',
      birth_date: authStore.user.birth_date || ''
    }
  }
}

const saveProfile = async () => {
  profileLoading.value = true
  profileSuccess.value = ''
  profileError.value = ''

  try {
    const response = await $fetch<{ user: any; message: string }>('/auth/profile', {
      baseURL: config.public.apiBase,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        name: profileForm.value.name,
        phone: profileForm.value.phone.replace(/\D/g, '') || null,
        cpf: profileForm.value.cpf.replace(/\D/g, '') || null,
        birth_date: profileForm.value.birth_date || null
      }
    })

    authStore.setUser(response.user)
    profileSuccess.value = 'Dados atualizados com sucesso!'
  } catch (err: any) {
    console.error('Erro ao salvar perfil:', err)
    const errors = err.data?.errors
    if (errors) {
      profileError.value = Object.values(errors).flat().join(' ')
    } else {
      profileError.value = err.data?.message || 'Erro ao salvar dados. Tente novamente.'
    }
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  passwordLoading.value = true
  passwordSuccess.value = ''
  passwordError.value = ''

  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    passwordError.value = 'A confirmação de senha não confere.'
    passwordLoading.value = false
    return
  }

  try {
    await $fetch('/auth/password', {
      baseURL: config.public.apiBase,
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: passwordForm.value
    })

    passwordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: ''
    }
    passwordSuccess.value = 'Senha alterada com sucesso!'
  } catch (err: any) {
    console.error('Erro ao alterar senha:', err)
    const errors = err.data?.errors
    if (errors) {
      passwordError.value = Object.values(errors).flat().join(' ')
    } else {
      passwordError.value = err.data?.message || 'Erro ao alterar senha. Tente novamente.'
    }
  } finally {
    passwordLoading.value = false
  }
}

onMounted(() => {
  loadUserData()
})

watch(() => authStore.user, () => {
  loadUserData()
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/minha-conta" class="p-2 hover:bg-stone-200 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-stone-900">Meus Dados</h1>
      </div>

      <!-- Dados Pessoais -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="text-lg font-bold text-stone-900 mb-4">Dados Pessoais</h2>

        <div v-if="profileSuccess" class="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
          {{ profileSuccess }}
        </div>
        <div v-if="profileError" class="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          {{ profileError }}
        </div>

        <form @submit.prevent="saveProfile" class="space-y-4">
          <!-- Email (readonly) -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Email</label>
            <input
              :value="authStore.user?.email"
              type="email"
              disabled
              class="w-full px-4 py-3 border border-stone-200 rounded-lg bg-stone-50 text-stone-500 cursor-not-allowed"
            />
            <p class="mt-1 text-xs text-stone-400">O email não pode ser alterado.</p>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Nome completo *</label>
            <input
              v-model="profileForm.name"
              type="text"
              required
              minlength="3"
              class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <!-- Phone & CPF -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">Telefone/WhatsApp</label>
              <input
                :value="profileForm.phone"
                @input="onPhoneInput"
                type="text"
                maxlength="15"
                placeholder="(00) 00000-0000"
                class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2">CPF</label>
              <input
                :value="profileForm.cpf"
                @input="onCpfInput"
                type="text"
                maxlength="14"
                placeholder="000.000.000-00"
                class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>

          <!-- Birth Date -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Data de nascimento</label>
            <input
              v-model="profileForm.birth_date"
              type="date"
              :max="new Date().toISOString().split('T')[0]"
              class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            :disabled="profileLoading"
            class="w-full px-6 py-3 bg-yellow-400 text-stone-900 rounded-lg font-semibold hover:bg-yellow-300 disabled:opacity-50"
          >
            {{ profileLoading ? 'Salvando...' : 'Salvar Dados' }}
          </button>
        </form>
      </div>

      <!-- Alterar Senha -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-stone-900 mb-4">Alterar Senha</h2>

        <div v-if="passwordSuccess" class="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
          {{ passwordSuccess }}
        </div>
        <div v-if="passwordError" class="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          {{ passwordError }}
        </div>

        <form @submit.prevent="changePassword" class="space-y-4">
          <!-- Current Password -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Senha atual *</label>
            <div class="relative">
              <input
                v-model="passwordForm.current_password"
                :type="showCurrentPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 pr-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <svg v-if="showCurrentPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Nova senha *</label>
            <div class="relative">
              <input
                v-model="passwordForm.password"
                :type="showNewPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-4 py-3 pr-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <svg v-if="showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p class="mt-1 text-xs text-stone-400">Mínimo de 8 caracteres.</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Confirmar nova senha *</label>
            <input
              v-model="passwordForm.password_confirmation"
              type="password"
              required
              class="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            :disabled="passwordLoading"
            class="w-full px-6 py-3 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 disabled:opacity-50"
          >
            {{ passwordLoading ? 'Alterando...' : 'Alterar Senha' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
