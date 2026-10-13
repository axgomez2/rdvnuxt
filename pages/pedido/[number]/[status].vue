<script setup lang="ts">
const route = useRoute()
const orderNumber = computed(() => route.params.number as string)

// URLs de retorno do Mercado Pago: /sucesso, /pendente, /erro (cancelado = alias de erro)
const ALIASES: Record<string, 'sucesso' | 'pendente' | 'erro'> = {
  sucesso: 'sucesso',
  pendente: 'pendente',
  erro: 'erro',
  cancelado: 'erro',
  falha: 'erro',
}

const expected = computed(() => ALIASES[route.params.status as string])

if (!expected.value) {
  await navigateTo(`/pedido/${orderNumber.value}`, { replace: true })
}

useHead({
  title: () => `Pedido #${orderNumber.value} - RDV Discos`,
  meta: [{ name: 'robots', content: 'noindex' }],
})
</script>

<template>
  <PaymentResult v-if="expected" :key="`${orderNumber}-${expected}`" :order-number="orderNumber" :expected="expected" />
</template>
