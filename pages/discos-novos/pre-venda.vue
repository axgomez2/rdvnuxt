<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <VinylSection
        title="Pré-Venda"
        subtitle="Reserve agora e receba no lançamento"
        :vinyls="discosPreorder.vinyls.value"
        :loading="discosPreorder.loading.value"
        :error="discosPreorder.error.value"
        @retry="discosPreorder.fetch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDiscosNovosPreorder } from '~/composables/useVinyls'

const discosPreorder = useDiscosNovosPreorder(50)

onMounted(() => {
  discosPreorder.fetch()
})

useHead({
  title: 'Pré-Venda - RDV Discos',
  meta: [
    { name: 'description', content: 'Discos de vinil em pré-venda. Reserve agora e receba no lançamento.' }
  ]
})
</script>
