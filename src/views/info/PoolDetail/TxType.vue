<template>
  <div
    class="flex cursor-pointer items-center gap-1.5 text-primary flex-wrap"
    @click="openExplorer('hash', props.hash)">
    <span>{{ typeText }}</span>
    <i-custom-open />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { openExplorer } from '@/utils/util'
import { TxType } from '../types'

const props = defineProps<{
  type: string
  hash: string
  token0: string
  token1: string
  isMultiRouting: boolean
  fromChain?: string
  toChain?: string
}>()

const { locale } = useI18n()

const typeText = computed(() => {
  const isEN = locale.value === 'en'
  let txt = ''
  if (props.type === TxType.SWAP) {
    const text1 = isEN ? 'Swap ' : '将 '
    const text2 = isEN ? ' for ' : ' 交换为 '
    txt = `${text1}${
      props.isMultiRouting
        ? props.token0 + '(' + props.fromChain + ')'
        : props.token0
    }${text2}${
      props.isMultiRouting
        ? props.token1 + '(' + props.toChain + ')'
        : props.token1
    }`
  } else if (props.type === TxType.ADDLP) {
    const text1 = isEN ? 'Add ' : '添加 '
    const text2 = isEN ? ' and ' : ' 和 '
    txt = `${text1}${props.token0}${
      props.isMultiRouting ? '(' + props.fromChain + ')' : text2 + props.token1
    }`
  } else if (props.type !== TxType.REOMVELP) {
    //
  } else {
    const text1 = isEN ? 'Remove ' : '移除 '
    const text2 = isEN ? ' and ' : ' 和 '
    txt = `${text1}${
      props.isMultiRouting
        ? props.token1 + '(' + props.toChain + ')'
        : props.token0 + text2 + props.token1
    }`
  }
  return txt
})
</script>

<style></style>
