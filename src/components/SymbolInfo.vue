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
        {{ chainName }}&nbsp;&nbsp;|&nbsp;&nbsp;
        <span
          :class="[IDClickable && 'cursor-pointer']"
          @click.stop.prevent="handleIDClick">
          ID: {{ props.assetKey }}
        </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import clsxm from '@/utils/clsxm'
import SymbolIcon from '@/components/SymbolIcon.vue'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'

const props = withDefaults(
  defineProps<{
    logo?: string
    name: string
    chain?: string
    assetKey: string
    class?: string
    nameClass?: string
    keyClass?: string
    IDClickable?: boolean
  }>(),
  {
    IDClickable: false
  }
)

const chainName = computed(() => {
  if (props.chain === 'NULS' || props.chain === 'NAI') {
    return 'NULS AI'
  }
  return props.chain
})

const handleIDClick = (e:Event) => {
  if (props.IDClickable) {
    e.stopPropagation()
    const origin = _networkInfo.NERVE.origin
    window.open(origin + '/asset/' + props.assetKey)
  }
}
</script>
