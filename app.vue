<template>
  <div class="min-h-screen bg-stone-950">
    <Navbar />
    <main class="pb-24">
      <NuxtPage />
    </main>
    <!-- Audio Player Global -->
    <AudioPlayer />
  </div>
</template>

<script setup>
useHead({
  htmlAttrs: {
    lang: 'pt-BR'
  }
})
</script>
