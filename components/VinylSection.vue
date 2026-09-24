<template>
  <section class="py-8 md:py-12">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 :class="['text-2xl md:text-3xl font-bold', dark ? 'text-white' : 'text-stone-900']">{{ title }}</h2>
        <p v-if="subtitle" :class="['mt-1', dark ? 'text-stone-400' : 'text-stone-500']">{{ subtitle }}</p>
      </div>
      <NuxtLink 
        v-if="viewAllLink"
        :to="viewAllLink" 
        class="text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1 transition-colors"
      >
        Ver todos
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
      <div v-for="i in skeletonCount" :key="i" class="animate-pulse">
        <div :class="['aspect-square rounded-xl', dark ? 'bg-stone-700' : 'bg-stone-200']"></div>
        <div class="mt-3 space-y-2">
          <div :class="['h-3 rounded w-2/3', dark ? 'bg-stone-700' : 'bg-stone-200']"></div>
          <div :class="['h-4 rounded w-full', dark ? 'bg-stone-700' : 'bg-stone-200']"></div>
          <div :class="['h-3 rounded w-1/2', dark ? 'bg-stone-700' : 'bg-stone-200']"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" :class="['rounded-lg p-6 text-center', dark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200']">
      <p :class="dark ? 'text-red-400' : 'text-red-600'">{{ error }}</p>
      <button @click="$emit('retry')" class="mt-3 text-yellow-500 hover:text-yellow-400 font-medium">
        Tentar novamente
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="!vinyls || vinyls.length === 0" :class="['rounded-lg p-8 text-center', dark ? 'bg-stone-800' : 'bg-stone-50']">
      <p :class="dark ? 'text-stone-400' : 'text-stone-500'">Nenhum disco encontrado nesta seção.</p>
    </div>

    <!-- Grid Desktop -->
    <div v-else class="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
      <VinylCard 
        v-for="vinyl in vinyls" 
        :key="vinyl.id" 
        :vinyl="vinyl"
        @play="$emit('play', $event)"
      />
    </div>

    <!-- List Mobile -->
    <div v-if="!loading && !error && vinyls && vinyls.length > 0" class="md:hidden space-y-3">
      <VinylCard 
        v-for="vinyl in vinyls" 
        :key="vinyl.id" 
        :vinyl="vinyl"
        @play="$emit('play', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Vinyl } from '~/types'

withDefaults(defineProps<{
  title: string
  subtitle?: string
  vinyls?: Vinyl[]
  loading?: boolean
  error?: string | null
  viewAllLink?: string
  skeletonCount?: number
  dark?: boolean
}>(), {
  skeletonCount: 5,
  dark: false,
  vinyls: () => [],
  loading: false,
  error: null
})

defineEmits(['play', 'retry'])
</script>
