<template>
  <div class="flex items-center">
    <SymbolIcon
      :icon="props.logo || props.name"
      :asset-key="props.assetKey"
      :class="clsxm('mr-1 md:mr-3', props.class)"></SymbolIcon>
    <div class="flex flex-col">
      <span
        :class="
          clsxm('mb-1 text-sm leading-none md:text-[16px]', props.nameClass)
        "
        >{{ props.name }}</span
      >
      <span :class="clsxm('text-xs text-label', props.keyClass)">
        {{ chainName }}&nbsp;&nbsp;|&nbsp;&nbsp;ID: {{ props.assetKey }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import clsxm from '@/utils/clsxm'
import SymbolIcon from '@/components/SymbolIcon.vue'

const props = defineProps<{
  logo?: string
  name: string
  chain?: string
  assetKey: string
  class?: string
  nameClass?: string
  keyClass?: string
}>()

const name = ref('hi')

const chainName = computed(() => {
  if (props.chain === 'NULS' || props.chain === 'NAI') {
    return 'NULS AI'
  }
  return props.chain
})
</script>
