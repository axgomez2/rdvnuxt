<script setup lang="ts">
// Rota de compatibilidade: o email de verificação aponta para /verify-email?code=XXX
// Redireciona para /verificar-email mantendo o código

const route = useRoute()

onMounted(() => {
  const code = route.query.code
  if (code) {
    navigateTo(`/verificar-email?code=${code}`, { replace: true })
  } else {
    navigateTo('/verificar-email', { replace: true })
  }
})
</script>

<template>
  <div class="min-h-screen bg-stone-50 flex items-center justify-center">
    <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
  </div>
</template>
