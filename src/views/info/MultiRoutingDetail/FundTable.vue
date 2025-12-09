<template>
  <div class="card-wrapper mb-6">
    <Table v-bind="props" :columns="columns" @pageChange="pageChange">
      <template #name="scope">
        <SymbolIcon :icon="scope.row.name" />
      </template>
      <template #contractAddress="scope">
        <div
          class="flex cursor-pointer items-center gap-1.5 text-primary"
          v-if="scope.row.contractAddress"
          @click="openUrl(scope.row.name, scope.row.contractAddress)">
          <span>{{ superLong(scope.row.contractAddress) }}</span>
          <i-custom-open />
        </div>
        <span v-else>{{ mainAsset }}</span>
      </template>
      <template #liq="scope">{{ $format(scope.row.liq) }}</template>
      <template #liqTvl="scope">${{ $format(scope.row.liqTvl) }}</template>
      <template #ratio="scope">
        <el-progress
          :percentage="Number(scope.row.ratio || '')"/>
      </template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Table from '@/components/Table/index.vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { superLong, openExplorer, openL1Explorer } from '@/utils/util'
import { PoolItem } from '../types'
import { N_CHAINS, N_CHAIN } from '@/hooks/useEthereum'

const props = withDefaults(
  defineProps<{
    title: string
    data: PoolItem[]
    total: number | string
    pageIndex?: number
    pagination?: boolean
    pageSize?: number | string
    mainAsset?: string
  }>(),
  {
    pagination: true
  }
)
const emit = defineEmits(['pageChange'])

const { t } = useI18n()
const router = useRouter()

const columns = computed(() => {
  return [
    {
      prop: 'name',
      label: t('info.info44'),
      slotName: 'name',
      width: 120
    },
    {
      prop: 'contractAddress',
      label: t('info.info40'),
      'min-width': 180,
      slotName: 'contractAddress'
    },
    {
      prop: 'nerveId',
      label: t('info.info41'),
      'min-width': 180,
      slotName: 'nerveId'
    },
    { prop: 'liq', label: t('info.info4'), width: 160, slotName: 'liq' },
    {
      prop: 'liqTvl',
      label: t('info.info45'),
      width: 140,
      slotName: 'liqTvl'
    },
    {
      prop: 'ratio',
      label: t('info.info42'),
      'width': 140,
      slotName: 'ratio'
    },
    { width: 30 }
  ]
})

function pageChange(index: number) {
  // console.log(index);
  emit('pageChange', index)
}

function openUrl(chain: string, address: string) {
  if (N_CHAINS.includes(chain as N_CHAIN)) {
    openExplorer('address', address, true, chain)
  } else {
    openL1Explorer(chain, 'address', address)
  }
}
</script>
