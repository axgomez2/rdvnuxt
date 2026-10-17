<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const orderNumber = computed(() => route.params.number as string)

useHead({
  title: () => `Pedido Enviado #${orderNumber.value} - RDV Discos`,
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <div class="max-w-lg mx-auto px-4 py-8 sm:py-12">
      <div class="bg-white rounded-2xl shadow-sm p-6 sm:p-8 text-center">
        <!-- Icone -->
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>

        <!-- Titulo -->
        <h1 class="text-2xl font-bold text-stone-900 mb-2">Pedido Enviado!</h1>
        <p class="text-lg text-stone-600">Pedido <strong class="text-stone-900">#{{ orderNumber }}</strong></p>

        <!-- Mensagem -->
        <div class="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
          <p class="text-green-800 font-medium">
            Seu pedido foi registrado com sucesso!
          </p>
          <p class="text-green-700 text-sm mt-3">
            Em breve você será contactado pela equipe da <strong>RDV Discos</strong> para combinar o pagamento e finalizar sua compra.
          </p>
        </div>

        <!-- Info adicional -->
        <div class="mt-6 bg-stone-50 rounded-xl p-4 text-left text-sm space-y-2">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-stone-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-stone-600">Normalmente respondemos em até <strong class="text-stone-800">2 horas</strong> durante o horário comercial.</p>
          </div>
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-stone-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-stone-600">Você pode acompanhar o status do pedido em <strong class="text-stone-800">Meus Pedidos</strong>.</p>
          </div>
        </div>

        <!-- Botoes -->
        <div class="mt-8 flex flex-col gap-3">
          <NuxtLink 
            :to="`/pedido/${orderNumber}`" 
            class="w-full bg-yellow-400 text-stone-900 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors"
          >
            Ver detalhes do pedido
          </NuxtLink>
          
          <NuxtLink 
            to="/minha-conta/pedidos" 
            class="w-full bg-white border border-stone-300 text-stone-700 py-3 rounded-xl font-medium hover:bg-stone-50 transition-colors"
          >
            Meus pedidos
          </NuxtLink>
          
          <NuxtLink 
            to="/" 
            class="text-stone-500 hover:text-stone-700 py-2 text-sm transition-colors"
          >
            Voltar para a loja
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
