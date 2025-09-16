<template>
  <div
    class="xl:max-h-auto mr-5 max-h-[500px] w-full overflow-auto rounded-xl bg-card p-6 pt-4 xl:h-[790px] xl:w-3/5">
    <div class="mb-6" v-if="swapSymbol.to">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <SymbolIcon
            class="!h-6 !w-6"
            :icon="swapSymbol.from"
            :key="swapSymbol.from" />
          <SymbolIcon
            class="-ml-1 !h-6 !w-6"
            :icon="swapSymbol.to"
            :key="swapSymbol.to" />
          <div class="ml-2">{{ swapSymbol.from }}/{{ swapSymbol.to }}</div>
        </div>
        <div class="text-xl" v-if="false">$448.68K</div>
      </div>
    </div>

    <!-- Tabs -->
    <Tabs :activeTab="txType" :tabs="tabs" @change="changeTxType"  />
    <!-- <div class="mb-4 flex">
      <template v-for="item in tabs" :key="item.value">
        <div
          :class="
            clsxm(
              'mr-4 cursor-pointer border-b-[2px] pb-2 text-base font-semibold md:mr-6 md:text-lg',
              item.value === txType
                ? 'border-primary text-text'
                : 'border-transparent text-label'
            )
          "
          @click="changeTxType(item.value)">
          {{ item.label }}
        </div>
      </template>
    </div> -->

    <TxList :list="list" v-show="txType === 'swap'"></TxList>
    <TxList :list="list" v-show="txType === 'multiRouting'"></TxList>
    <Pagination
      class="pt-4"
      v-model:current-page="newPager.index"
      :page-size="newPager.size"
      :total="newPager.total"
      @change="changeList" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import Tabs from '@/components/Base/Tabs/index.vue'
import TxList from './TxList.vue'
import Pagination from '@/components/Base/Pagination/index.vue'
import clsxm from '@/utils/clsxm'
import { SwapSymbol, OrderItem, Pager } from '../types'

interface Props {
  swapSymbol: SwapSymbol
  swapRate: string
  list: OrderItem[]
  pager: Pager
  txType: string
}

interface Emit {
  (e: 'update:pager', pager: Pager): void
  (e: 'update:txType', type: string): void
  (e: 'changeList'): void
}

const props = withDefaults(defineProps<Props>(), {
  swapSymbol: () => ({}) as SwapSymbol,
  list: () => [],
  pager: () => ({}) as Pager
})
const emit = defineEmits<Emit>()

const tabs = computed(() => {
  return [
    { label: 'Transaction', value: 'swap' },
    { label: 'Multi-routing', value: 'multiRouting' }
  ]
})

const newPager = computed({
  get() {
    return props.pager
  },
  set(val) {
    emit('update:pager', val)
  }
})
function changeTxType(type: string) {
  if (type === props.txType) return
  emit('update:txType', type)
}
function changeList() {
  emit('changeList')
}
</script>
