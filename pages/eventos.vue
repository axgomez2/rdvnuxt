<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-stone-900">Eventos</h1>
        <p class="text-stone-600 mt-2">Festas, feiras e encontros de colecionadores</p>
      </div>
      
      <div class="text-center py-20 text-stone-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p class="text-xl">Em breve</p>
        <p class="mt-2">Aguarde nossos próximos eventos!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Eventos - RDV Discos',
  meta: [
    { name: 'description', content: 'Eventos, festas e feiras de discos de vinil.' }
  ]
})
</script>
