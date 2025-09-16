<template>
  <div class="multi-routing-detail w1200">
    <Breadcrumb :items="breadItems"></Breadcrumb>
    <!-- head -->
    <div class="mb-6 flex flex-wrap items-center justify-between">
      <div class="flex items-center">
        <SymbolIcon
          class="mr-3 md:h-10 md:w-10"
          :icon="tokenInfo.logo"></SymbolIcon>
        <div>
          <p class="text-base font-medium md:text-2xl md:leading-[30px]">
            {{ tokenInfo.name }}
          </p>
          <p class="md:text-base">${{ tokenInfo.price }}</p>
        </div>
      </div>
      <div class="flex items-center">
        <div class="text-right">
          <p class="text-base font-medium md:text-2xl md:leading-[30px]">
            {{ tokenInfo.lpTokenSymbol }}
          </p>
          <p class="leading-4 text-label">
            {{ $t('info.info37') }} 丨 ID: {{ tokenInfo.assetKey }}
          </p>
        </div>
        <Button
          class="ml-6 hidden h-10 w-[140px] rounded-xl md:block"
          @click="getLp(tokenInfo.assetKey)"
          >{{ $t('info.info43') }}</Button
        >
      </div>
      <div class="block w-full pt-3 md:hidden">
        <Button
          class="h-10 w-[140px] rounded-xl"
          @click="getLp(tokenInfo.assetKey)"
          >{{ $t('info.info43') }}</Button
        >
      </div>
    </div>
    <div class="mb-6 flex flex-col gap-5 md:flex-row">
      <!-- left -->
      <div
        class="flex-shrink-0 rounded-xl bg-card p-6 md:w-[220px] md:pl-6 md:pt-[50px]">
        <div class="mb-4 flex items-center justify-between md:mb-7 md:block">
          <p class="mb-1.5 text-[#FFEB3B]">{{ $t('info.info4') }}</p>
          <p class="text-base font-medium md:text-2xl">
            ${{ $format(tokenInfo.liqTvl) }}
          </p>
        </div>
        <div class="mb-4 flex items-center justify-between md:mb-7 md:block">
          <p class="mb-1.5 text-[#71FF8D]">{{ $t('info.info11') }}</p>
          <p class="text-base font-medium md:text-2xl">
            ${{ $format(tokenInfo.tx_24) }}
          </p>
        </div>
        <div class="flex items-center justify-between md:block">
          <p class="mb-1.5 text-[#57AEFE]">{{ $t('info.info12') }}</p>
          <p class="text-base font-medium md:text-2xl">
            ${{ $format(tokenInfo.tx_7d) }}
          </p>
        </div>
      </div>
      <!-- right -->
      <div class="w-full overflow-hidden md:w-auto md:flex-1">
        <ChartTab
          :assetKey="tokenInfo.address"
          is-multi-routing
          :chainKey="activeChainKey">
          <div class="flex gap-2 overflow-x-auto rounded-t-xl px-3 py-2.5">
            <div
              :class="
                clsxm(
                  'flex h-10 w-10 items-center rounded-lg border border-[#2B2E39] bg-[#2B2E39] px-2.5',
                  activeChain === 'ALL' && 'border-primary'
                )
              "
              @click="activeChain = 'ALL'">
              {{ $t('info.info20') }}
            </div>
            <div
              :class="
                clsxm(
                  'flex h-10 flex-shrink-0 items-center gap-1 rounded-lg border border-[#2B2E39] bg-[#2B2E39] px-2.5',
                  activeChain === item.name && 'border-primary'
                )
              "
              v-for="item in multiRoutes"
              :key="item.value"
              @click="activeChain = item.name">
              <SymbolIcon class="!h-5 !w-5" :icon="item.name" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </ChartTab>
      </div>
    </div>

    <FundTable
      :title="$t('info.info39')"
      :data="multiChains"
      :page-size="multiChains.length"
      :total="multiChains.length"
      :mainAsset="tokenInfo.name" />

    <TxList :assetKey="tokenInfo.address" is-multi-routing />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Breadcrumb from '../Breadcrumb.vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import Button from '@/components/Base/Button/index.vue'
import ChartTab from '../PoolDetail/ChartTab.vue'
import FundTable from './FundTable.vue'
import TxList from '../PoolDetail/TxList.vue'
import clsxm from '@/utils/clsxm'
import { getMultiPair } from '@/service/api'
import { MultiChainInfo, MultiRoutingItem } from '@/views/info/types'
import { divisionAndFix, fixNumber, priceFormat } from '@/utils/util'
import {
  _networkInfo,
  getChainNameById
} from '@/utils/heterogeneousChainConfig'
import config from '@/config'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const assetKey = route.params.id as string
onMounted(() => {
  getTokenDetail()
})

const tokenInfo = ref<Omit<MultiRoutingItem, 'supportChain'>>(
  {} as Omit<MultiRoutingItem, 'supportChain'>
)
const multiChains = ref<MultiChainInfo[]>([])
async function getTokenDetail() {
  // getTxs({tokenKey:assetKey})
  const res = await getMultiPair(assetKey)
  if (res) {
    tokenInfo.value = {
      name: res.name,
      logo: res.logo || res.name,
      lpTokenSymbol: res.lpTokenSymbol,
      assetKey: res.lpTokenChainId + '-' + res.lpTokenAssetId,
      address: res.pairAddress,
      price: priceFormat(divisionAndFix(res.price, 18, 18), 4, 6),
      tx_24: divisionAndFix(res.amountUsdtValue24H, 18, 2),
      tx_7d: divisionAndFix(res.amountUsdtValue7D, 18, 2),
      liq: res.reserve,
      liqTvl: divisionAndFix(res.reserveUsdtValue, 18, 2)
    }
    res.tokenList.map(v => {
      multiChains.value.push({
        name: getChainNameById(v.sourceChainId, v.assetChainId),
        contractAddress: v.contractAddress,
        liq: v.reserve,
        liqTvl: divisionAndFix(v.reserveUsdtValue, 18, 2),
        ratio: fixNumber(v.ratio / 100, 2),
        nerveId: v.assetChainId + '-' + v.assetId
      })
    })
    console.log(multiChains.value, 77)
  }
}

const breadItems = computed(() => {
  return [
    { label: t('header.header12'), path: '/info' },
    { label: t('info.info35'), path: '/info/multi-routing' },
    { label: tokenInfo.value.name }
  ]
})

const multiRoutes = computed(() => {
  return multiChains.value.map(v => ({
    name: v.name,
    value: v.nerveId
  }))
})

const activeChain = ref('ALL')
const activeChainKey = computed(() => {
  return (
    multiRoutes.value.find(v => v.name === activeChain.value)?.value || 'ALL'
  )
})

function getLp(key: string) {
  const nvtKey = config.chainId + '-' + config.assetId
  const path = `/swap/${nvtKey}/${key}`
  router.push(path)
}
</script>
