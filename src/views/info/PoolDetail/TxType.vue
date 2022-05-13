<template>
  <span class="link" @click="openExplorer('hash', props.hash)">
    {{ typeText }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { openExplorer } from '@/utils/util';
import { TxType } from '../types';

const props = defineProps<{
  type: string;
  hash: string;
  token0: string;
  token1: string;
  isMultiRouting: boolean;
}>();

const { locale } = useI18n();

const typeText = computed(() => {
  const isEN = locale.value === 'en';
  let txt = '';
  if (props.type === TxType.SWAP) {
    if (isEN) {
      txt = `Swap ${props.token0} for ${props.token1}`;
    } else {
      txt = `将 ${props.token0} 交换为 ${props.token1}`;
    }
  } else if (props.type === TxType.ADDLP) {
    if (isEN) {
      txt = `Add ${props.token0}${
        props.isMultiRouting ? '' : ' and' + props.token1
      }`;
    } else {
      txt = `添加 ${props.token0}${
        props.isMultiRouting ? '' : ' 和' + props.token1
      }`;
    }
  } else if (props.type !== TxType.REOMVELP) {
    //
  } else {
    if (isEN) {
      txt = `Remove ${
        props.isMultiRouting
          ? props.token1
          : props.token0 + 'and' + props.token1
      }`;
    } else {
      txt = `移除 ${
        props.isMultiRouting ? props.token1 : props.token0 + '和' + props.token1
      }`;
    }
  }
  return txt;
});
</script>

<style></style>
