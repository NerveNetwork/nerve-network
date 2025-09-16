<template>
  <div class="flex justify-center">
    <Overview
      v-if="showOverview && !isMobile"
      :swapSymbol="swapSymbol"
      :swapRate="swapRate"
      :list="orderList"
      v-model:pager="pager"
      v-model:txType="txType"
      @changeList="changeList"
    ></Overview>
    <Swap
      :assetsList="assetsList"
      :hotAssets="hotAssets"
      :defaultAsset="defaultAsset"
      :showOverview="showOverview"
      @toggleExpand="toggleOverview"
      @selectAsset="changeOrderList"
      @updateRate="updateRate"
    ></Swap>
    <Modal
      container-class="mt-[10vh]"
      body-class="!p-0"
      v-model="showMobileOverview"
      :show-close="false"
      :show-title="false"
      @closed="showOverview = false"
    >
      <Overview
        :swapSymbol="swapSymbol"
        :swapRate="swapRate"
        :list="orderList"
        destroy-on-close
        v-model:pager="pager"
        v-model:txType="txType"
        @changeList="changeList"
      ></Overview>
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref } from 'vue';
import Overview from './Overview.vue';
import Swap from './Swap.vue';
import Modal from '@/components/Base/Modal/index.vue'
import useOverview from '../hooks/useOverview';
import useAsset from '../hooks/useAsset';
import useSelectAsset from '../hooks/useSelectAsset';
import { AssetItem } from '@/store/types';

const { showOverview, toggleOverview, isMobile, showMobileOverview } =
  useOverview();

const { assetsList, defaultAsset, hotAssets } = useAsset();

const { swapSymbol, orderList, pager, txType, selectAsset, selectedAsset } =
  useSelectAsset();

// url带交易对信息时请求一次订单列表信息
watch(
  defaultAsset,
  val => {
    if (val.to) {
      selectAsset(val.from, val.to);
    }
  },
  { immediate: true }
);
watch(
  assetsList,
  val => {
    if (val && val.length) {
      if (selectedAsset.value) {
        selectAsset(selectedAsset.value.from, selectedAsset.value.to);
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
);

// 切换兑换资产后刷新兑换记录
function changeOrderList(from: AssetItem, to: AssetItem) {
  pager.index = 1;
  pager.total = 0;
  selectAsset(from, to);
}

// 分页
function changeList() {
  selectAsset(selectedAsset.value?.from, selectedAsset.value?.to);
}

watch(
  () => txType.value,
  val => {
    if (val) {
      pager.index = 1;
      pager.total = 0;
      orderList.value = []
      selectAsset(selectedAsset.value?.from, selectedAsset.value?.to);
    }
  }
);

const swapRate = ref('');
function updateRate(rate: string) {
  swapRate.value = rate;
}
</script>
