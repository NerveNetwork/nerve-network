<template>
  <div class="w1200">
    <Breadcrumb :items="breadItems"></Breadcrumb>
    <div
      class="mb-6 flex flex-col sm:items-center sm:justify-between gap-4 sm:flex-row">
      <KeyInfo :info="tokenInfo" />
      <HandleBtn :info="tokenInfo" />
    </div>
    <div class="mb-6 flex flex-col gap-5 md:flex-row">
      <!-- left -->
      <div
        class="flex-shrink-0 rounded-xl bg-card p-6 md:w-[220px] md:pl-6 md:pt-[50px]">
        <div class="mb-4 flex items-center justify-between md:mb-7 md:block">
          <p class="mb-1.5 text-[#FFEB3B]">{{ $t('info.info4') }}</p>
          <p class="text-base font-medium md:text-2xl">
            ${{ $format(tokenInfo.liq) }}
          </p>
        </div>
        <div class="mb-4 flex items-center justify-between md:mb-7 md:block">
          <p class="mb-1.5 text-[#71FF8D]">{{ $t('info.info11') }}</p>
          <p class="text-base font-medium md:text-2xl">
            ${{ $format(tokenInfo.tx_24) }}
          </p>
        </div>
        <div class="mb-4 flex items-center justify-between md:mb-7 md:block">
          <p class="mb-1.5 text-[#57AEFE]">{{ $t('info.info12') }}</p>
          <p class="text-base font-medium md:text-2xl">
            ${{ $format(tokenInfo.tx_7d) }}
          </p>
        </div>
        <div class="flex items-center justify-between md:block">
          <p class="mb-1.5 text-[#57AEFE]">{{ $t('info.info12') }}</p>
          <p class="text-base font-medium md:text-2xl">
            {{ $format(tokenInfo.tx_24_count) }}
          </p>
        </div>
      </div>

      <!-- right -->
      <div class="w-full md:w-auto md:flex-1">
        <ChartTab :assetKey="tokenInfo.assetKey" />
      </div>
    </div>
    <PoolsTable
      :title="$t('info.info2')"
      :data="pools"
      :total="poolTotal"
      @pageChange="index => getPoolsList(index, assetKey)" />
    <TxList :assetKey="tokenInfo.assetKey" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Breadcrumb from '../Breadcrumb.vue'
import KeyInfo from '../PoolDetail/KeyInfo.vue'
import HandleBtn from '../PoolDetail/Handle.vue'
import ChartTab from '../PoolDetail/ChartTab.vue'
import PoolsTable from '../Overview/PoolsTable.vue'
import TxList from '../PoolDetail/TxList.vue'
import { getTokenInfo } from '@/service/api'
import { TokenDetail } from '@/views/info/types'
import {
  divisionAndFix,
  divisionDecimals,
  priceFormat,
  timesDecimals
} from '@/utils/util'
import useTokensAndPools from '@/views/info/hooks/useTokensAndPools'
import { NDecimals, NKey, NSymbol, replaceNULS } from '@/constants/constants'

const { t } = useI18n()
const route = useRoute()

const assetKey = route.params.id as string
const { pools, poolTotal, getPoolsList } = useTokensAndPools()
onMounted(() => {
  getPoolsList(0, assetKey)
  getTokenDetail()
})

const tokenInfo = ref<TokenDetail>({} as TokenDetail)
async function getTokenDetail() {
  // getTxs({tokenKey:assetKey})
  const res = await getTokenInfo(assetKey)
  if (res) {
    const key = res.assetChainId + '-' + res.assetId
    if (key === NKey) {
      res.symbol = NSymbol
      res.decimals = NDecimals
      res.price = divisionDecimals(res.price, NDecimals)
    }
    res.symbol = replaceNULS(res.symbol)

    tokenInfo.value = {
      name: res.symbol,
      assetKey: res.assetChainId + '-' + res.assetId,
      price: priceFormat(divisionAndFix(res.price, 18, 18)),
      tx_24: divisionAndFix(res.amountUsdtValue24H, 18, 2),
      tx_7d: divisionAndFix(res.amountUsdtValue7D, 18, 2),
      tx_24_count: res.transactionCount24H,
      liq: divisionAndFix(res.reserveUsdtValue, 18, 2)
    }
  }
}

const breadItems = computed(() => {
  return [
    { label: t('header.header12'), path: '/info' },
    { label: t('info.info3'), path: '/info/tokens' },
    { label: tokenInfo.value.name }
  ]
})
</script>
