<template>
  <div class="pool-detail w1200">
    <Breadcrumb :items="breadItems"></Breadcrumb>
    <div
      class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <KeyInfo :info="poolInfo" is-pool />
        <div class="flex items-center gap-5 pt-4">
          <div>
            <img src="" alt="" />
            <span>{{ rateInfo }}</span>
          </div>
          <div>
            <img src="" alt="" />
            <span>{{ rateInfoReverse }}</span>
          </div>
        </div>
      </div>
      <HandleBtn :info="poolInfo" is-pool />
    </div>

    <div class="mb-6 flex flex-col gap-5 md:flex-row">
      <!-- left -->
      <div
        class="flex-shrink-0 rounded-xl bg-card p-6 md:w-[280px] md:pl-6 md:pt-[50px]">
        <div class="mb-4 flex justify-between md:mb-7">
          <div>
            <p class="mb-1.5 text-[#FFEB3B]">{{ $t('info.info4') }}</p>
            <p class="text-base font-medium md:text-2xl">
              ${{ $format(poolInfo.liq) }}
            </p>
          </div>
          <div>
            <p class="mb-1.5 text-[#71FF8D]">{{ $t('info.info14') }}</p>
            <p class="text-base font-medium md:text-2xl">
              {{ poolInfo.apr || 0 }}%
            </p>
          </div>
        </div>

        <div class="mb-3 text-[#E17AFF]"></div>
        <div class="mb-7 rounded-[10px] bg-card2 px-3 py-4">
          <div class="mb-3 flex items-center justify-between font-medium">
            <div class="flex items-center">
              <SymbolIcon
                class="mr-1.5 !h-5 !w-5"
                :icon="poolInfo.token0Symbol"
                :asset-key="poolInfo.token0" />
              <span>{{ poolInfo.token0Symbol }}</span>
            </div>
            <span>{{ $format(poolInfo.reserve0) }}</span>
          </div>
          <div class="flex items-center justify-between font-medium">
            <div class="flex items-center">
              <SymbolIcon
                class="mr-1.5 !h-5 !w-5"
                :icon="poolInfo.token1Symbol"
                :asset-key="poolInfo.token1" />
              <span>{{ poolInfo.token1Symbol }}</span>
            </div>
            <span>{{ $format(poolInfo.reserve1) }}</span>
          </div>
        </div>
        <div>
          <div
            class="mb-4 flex cursor-pointer rounded-[20px] bg-card2 text-label">
            <div
              @click="changeDataTab('1')"
              :class="[
                'h-10 flex-1 text-center leading-10',
                activeDataTab === '1' &&
                  'rounded-[20px] bg-btn-primary text-white'
              ]">
              24H
            </div>
            <div
              @click="changeDataTab('2')"
              :class="[
                'h-10 flex-1 text-center leading-10',
                activeDataTab === '2' &&
                  'rounded-[20px] bg-btn-primary text-white'
              ]">
              7D
            </div>
          </div>
          <div class="flex justify-between">
            <template v-if="activeDataTab === '1'">
              <div>
                <p class="mb-1.5 text-[#71FF8D]">{{ $t('info.info11') }}</p>
                <p class="text-base font-medium md:text-2xl">
                  ${{ $format(poolInfo.tx_24) }}
                </p>
              </div>
              <div>
                <p class="mb-1.5 text-[#71FF8D]">{{ $t('info.info13') }}</p>
                <p class="text-base font-medium md:text-2xl">
                  ${{ $format(poolInfo.lp_24) }}
                </p>
              </div>
            </template>
            <template v-else>
              <div>
                <p class="mb-1.5 text-[#71FF8D]">{{ $t('info.info12') }}</p>
                <p class="text-base font-medium md:text-2xl">
                  ${{ $format(poolInfo.tx_7d) }}
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- right -->
      <div class="w-full md:w-auto md:flex-1">
        <ChartTab is-pool :assetKey="poolInfo.address" />
      </div>
    </div>
    <TxList :assetKey="assetKey" is-pool />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Breadcrumb from '../Breadcrumb.vue'
import KeyInfo from './KeyInfo.vue'
import HandleBtn from './Handle.vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import ChartTab from './ChartTab.vue'
import TxList from './TxList.vue'
import { getPoolInfo } from '@/service/api'
import { Division, divisionAndFix, fixNumber } from '@/utils/util'
import { NSymbol, NDecimals, NKey, replaceNULS } from '@/constants/constants'
import { PoolDetail } from '../types'

const { t } = useI18n()
const route = useRoute()

const assetKey = route.params.id as string
onMounted(() => {
  getPoolDetail()
})

const poolInfo = ref<PoolDetail>({} as PoolDetail)
async function getPoolDetail() {
  const res = await getPoolInfo(assetKey)
  if (res) {
    if (res.token0 === NKey) {
      res.token0Symbol = NSymbol
      res.token0Decimals = NDecimals
    }
    if (res.token1 === NKey) {
      res.token1Symbol = NSymbol
      res.token1Decimals = NDecimals
    }
    res.token0Symbol = replaceNULS(res.token0Symbol)
    res.token1Symbol = replaceNULS(res.token1Symbol)
    poolInfo.value = {
      name: res.token0Symbol + '/' + res.token1Symbol,
      address: res.address,
      tx_24: divisionAndFix(res.amountUsdtValue24H, 18, 2),
      tx_7d: divisionAndFix(res.amountUsdtValue7D, 18, 2),
      lp_24: divisionAndFix(res.feeUsdtValue, 18, 2),
      apr: fixNumber(Division(res.feeUsdtValueARP, 100).toFixed(), 2),
      liq: divisionAndFix(res.reserveUsdtValue, 18, 2),
      token0: res.token0,
      token0Decimals: res.token0Decimals,
      token0Symbol: res.token0Symbol,
      token1: res.token1,
      token1Decimals: res.token1Decimals,
      token1Symbol: res.token1Symbol,
      tokenLP: res.tokenLP,
      reserve0: divisionAndFix(res.reserve0, res.token0Decimals, 2),
      reserve1: divisionAndFix(res.reserve1, res.token1Decimals, 2)
    }
  }
}

const breadItems = computed(() => {
  return [
    { label: t('header.header12'), path: '/info' },
    { label: t('info.info2'), path: '/info/pools' },
    { label: poolInfo.value.name }
  ]
})

const rateInfo = computed(() => {
  if (!poolInfo.value.name) return ''
  const { token0Symbol, token1Symbol, reserve0, reserve1 } = poolInfo.value
  const rate = fixNumber(Division(reserve1, reserve0).toFixed(), 4)
  return `1 ${token0Symbol} ≈ ${rate} ${token1Symbol}`
})

const rateInfoReverse = computed(() => {
  if (!poolInfo.value.name) return ''
  const { token0Symbol, token1Symbol, reserve0, reserve1 } = poolInfo.value
  const rate = fixNumber(Division(reserve0, reserve1).toFixed(), 4)
  return `1 ${token1Symbol} ≈ ${rate} ${token0Symbol}`
})

const activeDataTab = ref('1')

function changeDataTab(tab: string) {
  activeDataTab.value = tab
}
</script>
