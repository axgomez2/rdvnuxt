<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-stone-900">Produtos</h1>
        <p class="text-stone-600 mt-2">Acessórios e equipamentos para DJs e colecionadores</p>
      </div>
      
      <div class="text-center py-20 text-stone-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <p class="text-xl">Em breve</p>
        <p class="mt-2">Estamos preparando novos produtos para você!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Produtos - RDV Discos',
  meta: [
    { name: 'description', content: 'Produtos e acessórios para DJs e colecionadores de vinil.' }
  ]
})
</script>
