<template>
  <div class="flex justify-center">
    <Overview
      v-if="showOverview && !isMobile"
      :chart-loading="chartLoading"
      :line-data="lineData"
      :txLoading="txLoading"
      :holdersLoading="holdersLoading"
      :txList="txList"
      :holdersList="holdersList"
      :assetInfo="assetInfo"
      :swapSymbol="swapSymbol"
      v-model:txType="txType" />
    <Swap
      :assetsList="assetsList"
      :hotAssets="hotAssets"
      :defaultAsset="defaultAsset"
      :showOverview="showOverview"
      @toggleExpand="toggleOverview"
      @selectAsset="onSelectAsset" />
    <Modal
      container-class="mt-[10vh]"
      body-class="!p-0"
      v-model="showMobileOverview"
      :show-close="false"
      :show-title="false"
      @closed="showOverview = false">
      <Overview
        :chart-loading="chartLoading"
        :txLoading="txLoading"
        :line-data="lineData"
        :holdersLoading="holdersLoading"
        :txList="txList"
        :holdersList="holdersList"
        :assetInfo="assetInfo"
        :swapSymbol="swapSymbol"
        destroy-on-close
        v-model:txType="txType" />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import Overview from './Overview.vue'
import Swap from './Swap.vue'
import Modal from '@/components/Base/Modal/index.vue'
import useOverview from '../hooks/useOverview'
import useAsset from '../hooks/useAsset'
import useSelectAsset from '../hooks/useSelectAsset'
import { AssetItem } from '@/store/types'

const { showOverview, toggleOverview, isMobile, showMobileOverview } =
  useOverview()

const { assetsList, defaultAsset, hotAssets, replaceRoute } = useAsset()

const {
  swapSymbol,
  txLoading,
  txList,
  holdersLoading,
  holdersList,
  txType,
  selectedAsset,
  chartLoading,
  assetInfo,
  lineData,
  getAssetInfo,
  getTxList,
  getHoldersList
} = useSelectAsset()

// url带交易对信息时请求一次订单列表信息
watch(
  defaultAsset,
  val => {
    if (val.to) {
      getAssetInfo(val.from, val.to)
      getTxList(val.to)
      getHoldersList(val.to)
    }
  },
  { immediate: true }
)
watch(
  assetsList,
  val => {
    if (val && val.length) {
      if (selectedAsset.value?.to) {
        getTxList(selectedAsset.value.to)
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
)

function onSelectAsset(from: AssetItem, to: AssetItem) {
  replaceRoute(from, to)
  if (to.assetKey !== assetInfo.value.assetKey) {
    getAssetInfo(from, to)
    resetTxList(to)
    resetHoldersList(to)
  }
}

// 切换兑换资产后刷新兑换记录
function resetTxList(asset: AssetItem) {
  txLoading.value = true
  getTxList(asset)
}

function resetHoldersList(asset: AssetItem) {
  getHoldersList(asset)
}

</script>
