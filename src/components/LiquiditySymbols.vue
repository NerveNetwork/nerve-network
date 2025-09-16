<template>
  <div class="flex items-center">
    <div class="flex mr-3">
      <SymbolIcon class="!w-7 !h-7" :icon="symbols[1]" :asset-key="assetKeys[1]"></SymbolIcon>
      <SymbolIcon class="!w-7 !h-7" :icon="symbols[0]" :asset-key="assetKeys[0]"></SymbolIcon>
    </div>
    <span :class="clsxm('text-base', props.textClass)">{{ props.name || symbols[0] + '/' + symbols[1] }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import SymbolIcon from '@/components/SymbolIcon.vue';
import { sortAssetsByValuation } from '@/utils/util';
import clsxm from '@/utils/clsxm';

const props = defineProps<{
  symbol1: string;
  assetKey1: string;
  symbol2: string;
  assetKey2: string;
  name?: string;
  textClass?: string
}>();

const symbols = computed(() => {
  if (!props.symbol1) return [];
  return sortAssetsByValuation(props.symbol1, props.symbol2);
});
const assetKeys = computed(() => {
  if (symbols.value[0] === props.symbol1 && symbols.value[1] === props.symbol2) {
    return [props.assetKey1, props.assetKey2];
  } else {
    return [props.assetKey2, props.assetKey1];
  }
});
</script>
