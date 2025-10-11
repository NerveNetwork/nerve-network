<template>
  <div class="data-info w1200" ref="dataInfoRef">
    <div class="overview-data-info bg-card rounded-[20px]">
      <div
        class="p-3 xl:p-0 flex flex-col xl:flex-row items-center border-b border-[#2D303D]">
        <div
          class="flex items-center justify-between w-full xl:flex-col xl:w-auto xl:flex-1 xl:py-[50px]">
          <p class="text-label xl:mb-2">{{ $t('home.home13') }}</p>
          <p>
            <span class="linear-data">${{ $format(chainData.total) }}</span>
          </p>
        </div>
        <div class="hidden xl:block w-[1px] h-5 bg-[#2D303D]"></div>
        <div class="flex items-center justify-between w-full xl:flex-col xl:w-auto xl:flex-1 xl:py-[50px]">
          <p class="text-label xl:mb-2">{{ $t('home.home14') }}</p>
          <p>
            <span class="linear-data">${{ $format(chainData.tx_24h) }}</span>
          </p>
        </div>
      </div>
      <div class="p-3 xl:p-0 flex flex-col xl:flex-row items-center">
        <div class="flex items-center justify-between w-full xl:flex-col xl:w-auto xl:flex-1 xl:py-[50px]">
          <p class="text-label xl:mb-2">Volume Today</p>
          <p>
            <span class="linear-data">
              ${{ $format(summaryData.vol_today) }}
            </span>

            <!--        $<CountUp :end-val="summaryData.txAmount" />-->
          </p>
        </div>
        <div class="hidden xl:block w-[1px] h-5 bg-[#2D303D]"></div>
        <div class="flex items-center justify-between w-full xl:flex-col xl:w-auto xl:flex-1 xl:py-[50px]">
          <p class="text-label xl:mb-2">TVL</p>
          <p>
            <span class="linear-data-h">${{ $format(summaryData.tvl) }}</span>

            <!--        $<CountUp :end-val="summaryData.tvl" />-->
          </p>
        </div>
        <div class="hidden xl:block w-[1px] h-5 bg-[#2D303D]"></div>
        <div class="flex items-center justify-between w-full xl:flex-col xl:w-auto xl:flex-1 xl:py-[50px]">
          <p class="text-label xl:mb-2">{{ $t('home.home8') }}</p>
          <p>
            <span class="linear-data-h">{{ summaryData.apr }}%</span>

            <!--        <CountUp :end-val="summaryData.apr" :options="{ separator: '' }" />%-->
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getSummaryData, getSymbolReport } from '@/service/api'
import { divisionAndFix, Plus } from '@/utils/util'
import { useObserveAnimate } from '@/hooks/useObserveAnimate'
// import CountUp from '@/components/CountUp.vue';

const summaryData = ref({
  vol_today: '0',
  txAmount: '',
  tvl: '',
  apr: ''
})
const chainData = ref({
  total: '0',
  tx_24h: '0'
})
const dataInfoRef = useObserveAnimate()

onMounted(() => {
  getSummaryData().then(res => {
    // console.log(res, '-=-=-=');
    summaryData.value = {
      vol_today: divisionAndFix(res.amountUsdtToday, 18, 2),
      txAmount: divisionAndFix(res.amountUsdtValue, 18, 2),
      tvl: divisionAndFix(res.tvl, 18, 2),
      apr: res.maxFarmApr
    }
  })

  getSymbolReport().then(res => {
    let total = '0',
      tx_24h = '0'
    res.map(v => {
      total = Plus(v.totalUsdVal, total).toFixed()
      tx_24h = Plus(Plus(v.convert24UsdVal, v.redeem24UsdVal), tx_24h).toFixed()
    })
    chainData.value = {
      total,
      tx_24h
    }
  })
})
</script>
