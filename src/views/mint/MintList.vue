<template>
  <!-- <div class="mint-list" v-loading="loading"> -->
  <div class="mint-list">
    <template v-if="loading">
      <div class="flex flex-col gap-4">
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
      </div>
    </template>
    <Table
      v-else
      title=""
      :data="list"
      :total="total"
      :columns="columns"
      @pageChange="pageChange">
      <template #name="scope">
        <el-tooltip
          placement="top"
          v-if="scope.row.mintAssetSourceContract"
          popper-class="mint-popper">
          <template #content>
            <div>
              <span>
                {{ $t('assets.assets10') }}
                {{ scope.row.mintAssetSourceContract }}
              </span>
            </div>
          </template>
          <SymbolInfo
            :name="scope.row.mintAssetSymbol"
            :chain="scope.row.registerChain"
            :asset-key="scope.row.mintAsset"></SymbolInfo>
        </el-tooltip>
        <SymbolInfo
          v-else
          :name="scope.row.mintAssetSymbol"
          :chain="scope.row.registerChain"
          :asset-key="scope.row.mintAsset"></SymbolInfo>
      </template>
      <template #amountHeader>
        <Tip label="SMA/HT" :tip="$t('mint.mint38')" white />
      </template>
      <template #amount="scope">
        {{ $thousands(scope.row.mintEach) }}/{{ $thousands(scope.row.mintMax) }}
      </template>
      <template #startTime="scope">
        <p>{{ scope.row.startTime?.split(' ')[0] }}</p>
        <p>{{ scope.row.startTime?.split(' ')[1] }}</p>
      </template>
      <template #assetUnlockTime="scope">
        <p>{{ scope.row.assetUnlockTime?.split(' ')[0] }}</p>
        <p>{{ scope.row.assetUnlockTime?.split(' ')[1] }}</p>
      </template>
      <template #mintFee="scope">
        {{ $thousands(scope.row.mintFee) }} {{ scope.row.mintFeeAssetSymbol }}
      </template>
      <template #LP="scope">
        {{ scope.row.poolRatio }}%｜{{ scope.row.lpLockDay }}
        {{ $t('mint.mint56') }}
      </template>
      <template #progress="scope">
        <div class="w-[100px]">
          <p class="text-center text-xs">{{ scope.row.progress }}%</p>
          <div class="h-1.5 rounded-[2px] bg-[#292C36]">
            <div
              class="h-full rounded-[2px]"
              :style="{
                width: scope.row.progress + 'px',
                background:
                  'linear-gradient(85.01deg, #FFDA56 0.66%, #F50FF9 99.34%)'
              }"></div>
          </div>
        </div>
      </template>
      <template #opt="scope">
        <MintHandle
          :item="scope.row"
          @mint="mint"
          :nerveAddress="nerveAddress" />
      </template>
    </Table>
  </div>
  <ConfirmModal
    v-model:show="showConfirmModal"
    :id="pid"
    :targetAddress="targetAddress"
    @refresh="emit('refresh')" />
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Table from '@/components/Table/index.vue'
import Skeleton from '@/components/Base/Skeleton/index.vue'
import SymbolInfo from '@/components/SymbolInfo.vue'
import MintHandle from './MintHandle.vue'
import ConfirmModal from './ConfirmModal.vue'
import Tip from '../mintDeploy/Tip.vue'
import { IMintItem } from '@/service/api/types/mint'

const props = defineProps<{
  loading: boolean
  list: IMintItem[]
  total: number
  targetAddress: string
  nerveAddress: string
}>()

const emit = defineEmits(['onChange', 'refresh'])

const { t } = useI18n()
const columns = computed(() => {
  return [
    {
      label: t('mint.mint37'),
      slotName: 'name',
      width: 170
    },
    {
      label: t('mint.mint38'),
      width: 120,
      slotName: 'amount',
      headerSlot: 'amountHeader'
    },
    {
      label: t('mint.mint39'),
      width: 160,
      slotName: 'startTime'
    },
    {
      label: t('mint.mint40'),
      width: 160,
      slotName: 'assetUnlockTime'
    },
    { label: t('mint.mint41'), width: 130, slotName: 'mintFee' },
    {
      label: t('mint.mint42'),
      width: 130,
      slotName: 'LP'
    },
    {
      label: t('mint.mint43'),
      width: 124,
      slotName: 'progress'
    },
    {
      label: t('mint.mint44'),
      'min-width': 150,
      slotName: 'opt'
    },
    { width: 10 }
  ]
})

const pid = ref(0)
const showConfirmModal = ref(false)

const pageChange = (index: number) => {
  emit('onChange', index)
}

const mint = (id: number) => {
  pid.value = id
  showConfirmModal.value = true
}

</script>
