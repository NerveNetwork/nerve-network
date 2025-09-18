<template>
  <div class="flex justify-center">
    <Overview
      v-if="showOverview && !isMobile"
      :chart-loading="chartLoading"
      :list-loading="listLoading"
      :line-data="lineData"
      :swapSymbol="swapSymbol"
      :list="orderList"
      v-model:pager="pager"
      v-model:txType="txType"
      @changeList="changeList" />
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
        :list-loading="listLoading"
        :line-data="lineData"
        :swapSymbol="swapSymbol"
        :list="orderList"
        destroy-on-close
        v-model:pager="pager"
        v-model:txType="txType"
        @changeList="changeList" />
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
  listLoading,
  orderList,
  pager,
  txType,
  selectAsset,
  selectedAsset,
  chartLoading,
  lineData,
  getChartData
} = useSelectAsset()

// url带交易对信息时请求一次订单列表信息
watch(
  defaultAsset,
  val => {
    if (val.to) {
      getChartData(val.from, val.to)
      selectAsset(val.from, val.to)
    }
  },
  { immediate: true }
)
watch(
  assetsList,
  val => {
    if (val && val.length) {
      if (selectedAsset.value) {
        selectAsset(selectedAsset.value.from, selectedAsset.value.to)
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
  getChartData(from, to)
  changeOrderList(from, to)
}

// 切换兑换资产后刷新兑换记录
function changeOrderList(from: AssetItem, to: AssetItem) {
  pager.index = 1
  pager.total = 0
  listLoading.value = true
  selectAsset(from, to)
}

// 分页
function changeList() {
  listLoading.value = true
  selectAsset(selectedAsset.value?.from, selectedAsset.value?.to)
}

watch(
  () => txType.value,
  val => {
    if (val) {
      pager.index = 1
      pager.total = 0
      // orderList.value = []
      listLoading.value = true
      selectAsset(selectedAsset.value?.from, selectedAsset.value?.to)
    }
  }
)
</script>
