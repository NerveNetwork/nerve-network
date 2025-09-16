<template>
  <div class="flex w-full flex-col items-center lg:w-auto lg:flex-row mb-4 lg:mb-0">
    <div
      class="flex w-full items-center justify-between text-center lg:w-36 lg:flex-col">
      <p class="mb-1.5 text-xs text-label">{{ $t('home.home10') }}</p>
      <p class="font-medium">
        <CountUp :end-val="overviewData.turnoverAmount" />
        NVT
      </p>
    </div>
    <div class="mx-4 hidden h-5 w-[1px] bg-label lg:block"></div>
    <div
      class="flex w-full items-center justify-between text-center lg:w-36 lg:flex-col">
      <p class="mb-1.5 text-xs text-label">{{ $t('home.home16') }}</p>
      <p class="font-medium">
        <CountUp :end-val="overviewData.nvtPublishAmount" />
        NVT
      </p>
    </div>
    <div class="mx-4 hidden h-5 w-[1px] bg-label lg:block"></div>
    <div
      class="flex w-full items-center justify-between text-center lg:w-36 lg:flex-col">
      <p class="mb-1.5 text-xs text-label">{{ $t('home.home17') }}</p>
      <p class="font-medium">
        <CountUp :end-val="overviewData.nvtTotal" />
        NVT
      </p>
    </div>
    <div class="mx-4 hidden h-5 w-[1px] bg-label lg:block"></div>
    <div
      class="flex w-full items-center justify-between text-center lg:w-36 lg:flex-col">
      <p class="mb-1.5 text-xs text-label">{{ $t('home.home12') }}</p>
      <p class="font-medium">
        <CountUp :end-val="overviewData.totalStake" />
        NVT
      </p>
    </div>
    <div class="mx-4 hidden h-5 w-[1px] bg-label lg:block"></div>
    <div
      class="flex w-full items-center justify-between text-center lg:w-36 lg:flex-col">
      <p class="mb-1.5 text-xs text-label">{{ $t('home.home18') }}</p>
      <p class="font-medium">
        <span>$</span>
        <CountUp :end-val="overviewData.turnoverUsd" />
      </p>
    </div>
    <div class="mx-4 hidden h-5 w-[1px] bg-label lg:block"></div>
    <div
      class="flex w-full items-center justify-between text-center lg:w-36 lg:flex-col">
      <p class="mb-1.5 text-xs text-label">{{ $t('home.home11') }}</p>
      <p class="font-medium">
        <span>$</span>
        <CountUp :end-val="overviewData.totalUsd" />
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import CountUp from '@/components/CountUp.vue'
import { getOverviewData } from '@/service/api'
import { divisionDecimals, Times } from '@/utils/util'

const overviewData = ref({
  turnoverAmount: '0', //流通量
  nvtPublishAmount: '0', // 总量
  nvtTotal: '0', // 最大总量
  totalStake: '0', // 质押量
  turnoverUsd: '0', // 流通市值
  totalUsd: '0' // 总市值
})
onMounted(() => {
  getOverviewData().then(res => {
    if (res) {
      const turnoverAmount = divisionDecimals(res.nvtTurnoverAmount, 8).split(
        '.'
      )[0]
      overviewData.value.turnoverAmount = turnoverAmount
      overviewData.value.nvtPublishAmount = divisionDecimals(
        res.nvtPublishAmount,
        8
      ).split('.')[0]
      overviewData.value.nvtTotal = divisionDecimals(res.nvtTotal, 8).split(
        '.'
      )[0]
      overviewData.value.totalStake = divisionDecimals(
        res.nvtStackTotal,
        8
      ).split('.')[0]
      overviewData.value.turnoverUsd = divisionDecimals(
        Times(res.nvtTurnoverAmount, res.nvtUsdtValue),
        8
      ).split('.')[0]
      overviewData.value.totalUsd = divisionDecimals(
        res.nvtTotalUsdtValue,
        8
      ).split('.')[0]
    }
  })
})
</script>
