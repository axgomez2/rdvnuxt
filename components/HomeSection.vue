<template>
  <section v-if="section && vinyls.length > 0" class="py-10 md:py-14" :class="bgClass">
    <div class="container mx-auto px-4">
      <!-- Header da seção -->
      <div class="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-stone-900">{{ section.title }}</h2>
          <p v-if="section.subtitle" class="text-stone-600 mt-1">{{ section.subtitle }}</p>
        </div>
        <NuxtLink
          v-if="viewAllLink"
          :to="viewAllLink"
          class="hidden sm:flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
        >
          Ver todos
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </NuxtLink>
      </div>

      <!-- Grid Desktop -->
      <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <VinylCard 
          v-for="vinyl in vinyls" 
          :key="vinyl.id" 
          :vinyl="vinyl"
        />
      </div>

      <!-- List Mobile -->
      <div class="md:hidden space-y-3">
        <VinylCard 
          v-for="vinyl in vinyls" 
          :key="vinyl.id" 
          :vinyl="vinyl"
        />
      </div>

      <!-- Link ver todos mobile -->
      <NuxtLink
        v-if="viewAllLink"
        :to="viewAllLink"
        class="sm:hidden flex items-center justify-center gap-2 mt-6 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
      >
        Ver todos
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Vinyl } from '~/types'

interface Props {
  section?: {
    id: number
    title: string
    subtitle?: string
    slug: string
    vinyls?: Vinyl[]
  } | null
  viewAllLink?: string
  bgClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  bgClass: ''
})

const vinyls = computed(() => props.section?.vinyls?.slice(0, 20) || [])
</script>
