<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-stone-900">Notícias</h1>
        <p class="text-stone-600 mt-2">Novidades do mundo da música e do vinil</p>
      </div>
      
      <div class="text-center py-20 text-stone-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
        </svg>
        <p class="text-xl">Em breve</p>
        <p class="mt-2">Fique ligado nas novidades!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Notícias - RDV Discos',
  meta: [
    { name: 'description', content: 'Notícias e novidades do mundo da música e do vinil.' }
  ]
})
</script>
