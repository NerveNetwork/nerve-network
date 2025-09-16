<template>
  <div>
    <div
      class="mb-6 flex flex-col items-center justify-between gap-6 md:flex-row">
      <div
        class="h-[380px] w-full rounded-xl bg-card p-6 pb-3 md:w-auto md:flex-1">
        <Chart
          type="line"
          :label="$t('info.info4')"
          :data="lineData"
          :loading="chartLoading"></Chart>
      </div>
      <div
        class="h-[380px] w-full rounded-xl bg-card p-6 pb-3 md:w-auto md:flex-1">
        <Chart
          type="bar"
          :label="$t('info.info34')"
          :data="barData"
          :loading="chartLoading"></Chart>
      </div>
    </div>
    <AssetsTable
      class="mb-6"
      :title="$t('info.info7')"
      :loading="tokenLoading"
      :data="tokens"
      :total="tokenTotal"
      @pageChange="getAssetsList" />
    <PoolsTable
      :title="$t('info.info31')"
      :loading="poolLoading"
      :data="pools"
      :total="poolTotal"
      @pageChange="getPoolsList" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import Chart from './Chart.vue'
import AssetsTable from './AssetsTable.vue'
import PoolsTable from './PoolsTable.vue'
import useTokensAndPools from '../hooks/useTokensAndPools'
import { get300DaysData } from '@/service/api'
import { divisionAndFix } from '@/utils/util'
import { ChartItem } from '../types'

const {
  tokenLoading,
  tokens,
  tokenTotal,
  getAssetsList,
  poolLoading,
  pools,
  poolTotal,
  getPoolsList
} = useTokensAndPools()

const lineData = ref<ChartItem[]>([])
const barData = ref<ChartItem[]>([])
const chartLoading = ref(true)
onMounted(() => {
  getChartData()
  getAssetsList()
  getPoolsList()
})

async function getChartData() {
  const res = await get300DaysData()
  lineData.value = res.map(v => {
    return {
      label: v.period,
      value: divisionAndFix(v.reserveUsdtValue, 18, 2)
    }
  })
  barData.value = res.map(v => {
    return {
      label: v.period,
      value: divisionAndFix(v.amountUsdtValue, 18, 2)
    }
  })
  chartLoading.value = false
}
</script>
