<template>
  <div :class="clsxm('card-wrapper', props.class)">
    <Table
      :loading="loading"
      v-bind="{ title, data, total, pageIndex, pagination, pageSize }"
      :columns="columns"
      @rowClick="rowClick"
      @pageChange="pageChange">
      <template #name="scope">
        <SymbolInfo
          class="!h-8 !w-8"
          :name="scope.row.name"
          :chain="scope.row.originChain"
          :asset-key="scope.row.assetKey"></SymbolInfo>
      </template>
      <template #price="scope">${{ scope.row.price }}</template>
      <template #priceChange="scope">
        <span :class="scope.row.priceChange > 0 ? 'text-up' : 'text-down'">
          {{
            scope.row.priceChange > 0
              ? '+' + scope.row.priceChange
              : scope.row.priceChange
          }}%
        </span>
      </template>
      <template #txs="scope">${{ $format(scope.row.txs) }}</template>
      <template #liq="scope">${{ $format(scope.row.liq) }}</template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Table from '@/components/Table/index.vue'
import SymbolInfo from '@/components/SymbolInfo.vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import clsxm from '@/utils/clsxm'
import { TokenItem } from '../types'

const props = withDefaults(
  defineProps<{
    title: string
    data: TokenItem[]
    total: number | string
    pageIndex?: number
    pagination?: boolean
    pageSize?: number | string
    class?: string
    loading?: boolean
  }>(),
  {
    pagination: true
  }
)
const emit = defineEmits(['pageChange', 'rowClick'])

const { t } = useI18n()
const router = useRouter()

const columns = computed(() => {
  return [
    {
      prop: 'name',
      label: t('info.info8'),
      'min-width': 140,
      slotName: 'name'
    },
    { prop: 'price', label: t('info.info9'), width: 180, slotName: 'price' },
    {
      prop: 'priceChange',
      label: t('info.info10'),
      width: 180,
      slotName: 'priceChange'
    },
    { prop: 'txs', label: t('info.info11'), width: 180, slotName: 'txs' },
    { prop: 'liq', label: t('info.info4'), width: 180, slotName: 'liq' }
  ]
})
function rowClick(item: TokenItem) {
  // console.log(item);
  // emit('rowClick', item);
  router.push('/info/tokens/' + item.assetKey)
}
function pageChange(index: number) {
  // console.log(index);
  emit('pageChange', index)
}
</script>
