<template>
  <img :class="clsxm('w-7 h-7 md:w-8 md:h-8 rounded-full', props.class)" v-lazy="iconSrc" :key="iconSrc" />
  <!--  <el-image class="symbol-icon" :key="iconSrc" :src="iconSrc" lazy>
    <template #error>
      <img class="symbol-icon" :src="defaultIcon" />
    </template>
  </el-image>-->
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { getIconSrc } from '@/utils/util';
import defaultIcon from '@/assets/img/defaultIcon.svg';
import storage from '@/utils/storage';
import { NKey, NSymbol } from '@/constants/constants';
import clsxm from '@/utils/clsxm';

const props = defineProps<{
  icon: string
  assetKey?: string
  class?: string
}>()

const tokenSymbol = computed(() => {
  if (
    props.icon === 'NULS' ||
    props.icon === 'NULS AI' ||
    props.assetKey === NKey
  ) {
    return NSymbol;
  } else if (props.icon === 'BNB Chain') {
    return 'BSC';
  }
  return props.icon;
});

const iconSrc = computed(() => {
  const logoConfig = storage.get('logoConfig');
  if (!props.assetKey || !logoConfig[props.assetKey]) {
    return getIconSrc(tokenSymbol.value || '');
  } else {
    return logoConfig[props.assetKey];
  }
});
function replaceImg(e: Event) {
  const target = e.target as HTMLImageElement;
  target.src = defaultIcon;
}
</script>
