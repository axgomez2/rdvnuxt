<script setup lang="ts">
const route = useRoute()
const orderNumber = computed(() => route.params.number as string)
const statusBanner = computed(() => route.params.status as string)

const order = ref<any>(null)

useHead({
  title: () => order.value ? `Pedido #${order.value.order_number} - RDV Discos` : 'Pedido - RDV Discos'
})
</script>

<template>
  <OrderDetail :order-number="orderNumber" :status-banner="statusBanner" @loaded="order = $event" />
</template>
