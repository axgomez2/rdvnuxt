<template>
  <div class="bg-white">
    <!-- Banners da Home -->
    <HomeBanners />

    <!-- Loading state -->
    <div v-if="homeSections.loading.value" class="py-20 text-center">
      <div class="animate-spin w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-stone-500 mt-4">Carregando...</p>
    </div>

    <!-- Seções da Home (configuradas no painel admin) -->
    <template v-else>
      <!-- Seção 1: Discos Novos Selecionados -->
      <HomeSection
        :section="discosNovosSection"
        view-all-link="/discos-novos"
      />

      <!-- Seção 2: Pré-Vendas -->
      <HomeSection
        :section="preVendaSection"
        view-all-link="/discos-novos/pre-venda"
        bg-class="bg-stone-50"
      />

      <!-- Seção 3: Selos em Destaque -->
      <FeaturedLabels />

      <!-- Seção 4: Discos Usados -->
      <HomeSection
        :section="discosUsadosSection"
        view-all-link="/discos-usados"
        bg-class="bg-stone-50"
      />
    </template>

    <!-- Footer -->
    <footer class="bg-stone-900 text-white mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <p class="text-stone-400">© 2026 RDV Discos - Loja de Discos de Vinil</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useHomeSections } from '~/composables/useVinyls'

const homeSections = useHomeSections()

// Seção de Discos Novos (type: discos_novos)
const discosNovosSection = computed(() => homeSections.getSection('discos_novos'))

// Seção de Pré-Vendas (type: pre_venda)
const preVendaSection = computed(() => homeSections.getSection('pre_venda'))

// Seção de Discos Usados (type: discos_usados)
const discosUsadosSection = computed(() => homeSections.getSection('discos_usados'))

onMounted(() => {
  homeSections.fetch()
})

useHead({
  title: 'RDV Discos - Loja de Discos de Vinil',
  meta: [
    { name: 'description', content: 'A melhor seleção de discos de vinil para DJs e colecionadores. Discos novos, usados, nacionais e importados.' }
  ]
})
</script>
