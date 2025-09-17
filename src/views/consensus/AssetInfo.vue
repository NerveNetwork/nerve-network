<template>
  <div class="flex items-center">
    <div class="relative mr-3 h-8 w-8 shrink-0" v-if="symbols.length > 1">
      <div class="absolute left-0 top-0 overflow-hidden rounded-full">
        <SymbolIcon class="!h-[19px] !w-[19px]" :icon="symbols[1]!"></SymbolIcon>
      </div>

      <div
        class="absolute bottom-0 right-0 overflow-hidden rounded-full bg-card">
        <SymbolIcon class="!h-6 !w-6" :icon="symbols[0]!" />
      </div>
    </div>
    <div v-else class="mr-3 overflow-hidden rounded-full">
      <SymbolIcon :icon="symbols[0]!" />
    </div>
    <div class="font-base">{{ props.symbol }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SymbolIcon from '@/components/SymbolIcon.vue'

const props = defineProps({
  symbol: String
})

const symbols = computed(() => {
  if (props.symbol?.includes('_LP')) {
    return props.symbol.split('_').slice(0, 2)
  }
  return [props.symbol]
})
</script>
