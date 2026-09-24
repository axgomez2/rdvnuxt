<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-stone-900">Ofertas</h1>
        <p class="text-stone-600 mt-2">Discos com preços especiais</p>
      </div>
      
      <!-- Placeholder - será implementado -->
      <div class="text-center py-20 text-stone-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
        </svg>
        <p>Em breve: Ofertas especiais</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Ofertas - RDV Discos',
  meta: [
    { name: 'description', content: 'Ofertas especiais de discos de vinil. Aproveite os melhores preços.' }
  ]
})
</script>
