<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <VinylSection
        title="Discos Nacionais"
        subtitle="O melhor da música brasileira em vinil"
        :vinyls="discosNacionais.vinyls.value"
        :loading="discosNacionais.loading.value"
        :error="discosNacionais.error.value"
        @retry="discosNacionais.fetch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDiscosNacionaisAvailable } from '~/composables/useVinyls'

const discosNacionais = useDiscosNacionaisAvailable(50)

onMounted(() => {
  discosNacionais.fetch()
})

useHead({
  title: 'Discos Nacionais - RDV Discos',
  meta: [
    { name: 'description', content: 'Discos de vinil nacionais. O melhor da música brasileira.' }
  ]
})
</script>
