<template>
  <div class="bg-white min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-stone-900">Charts & Playlists</h1>
        <p class="text-stone-600 mt-2">As melhores seleções de DJs e da loja</p>
      </div>
      
      <!-- Placeholder - será implementado -->
      <div class="text-center py-20 text-stone-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
        </svg>
        <p>Em breve: Charts e Playlists de DJs</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Charts & Playlists - RDV Discos',
  meta: [
    { name: 'description', content: 'Charts e playlists de DJs. As melhores seleções de discos de vinil.' }
  ]
})
</script>
