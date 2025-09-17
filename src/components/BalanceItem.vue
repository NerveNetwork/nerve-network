<template>
  <div class="flex items-center gap-1.5 text-label">
    <i-custom-wallet />
    <span>{{ props.balance || '0' }}</span>
    <slot />
  </div>
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    balance?: string | number
  }>(),
  {
    balance: '0'
  }
)
</script>
