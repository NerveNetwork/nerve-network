<template>
  <div class="info-tx-list card-wrapper">
    <!-- <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="tabChange">
      <el-tab-pane :label="$t('info.info20')" :name="TxType.ALL"></el-tab-pane>
      <el-tab-pane :label="$t('info.info21')" :name="TxType.SWAP"></el-tab-pane>
      <el-tab-pane
        :label="$t('info.info22')"
        :name="TxType.ADDLP"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('info.info23')"
        :name="TxType.REOMVELP"
      ></el-tab-pane>
      
    </el-tabs> -->
    <Tabs :active-tab="activeTab" :tabs="tabs" @change="tabChange" />
    <TxTable
        :data="txList"
        :page-index="currentPage"
        :total="txTotal"
        @pageChange="pageChange"
        :is-multi-routing="props.isMultiRouting"
      />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tabs from '@/components/Base/Tabs/index.vue'
import TxTable from './TxTable.vue';
import { getTxs, getMultiPairTxs } from '@/service/api';
import dayjs from 'dayjs';
import {
  adaptiveFix,
  divisionAndFix,
  Times,
  getOriginChain
} from '@/utils/util';
import { NDecimals, NSymbol, replaceNULS } from '@/constants/constants';
import { TxItem, TxType } from '../types';

const props = defineProps<{
  assetKey: string;
  isPool?: boolean;
  isMultiRouting?: boolean;
}>();

const { t } = useI18n()
const activeTab = ref(TxType.ALL);
const txList = ref<TxItem[]>([]);
const txTotal = ref(0);
const currentPage = ref(1);

const tabs = computed(() => {
  return [
    { label: t('info.info20'), value: TxType.ALL },
    { label: t('info.info21'), value: TxType.SWAP },
    { label: t('info.info22'), value: TxType.ADDLP },
    { label: t('info.info23'), value: TxType.REOMVELP },
  ]
})

watch(
  () => props.assetKey,
  val => {
    if (val) {
      getData();
    }
  },
  {
    immediate: true
  }
);

function getData() {
  if (props.isMultiRouting) {
    getMultiRoutingTxData();
  } else {
    getTxData();
  }
}

async function getTxData() {
  const key = props.assetKey;
  const operation = activeTab.value;
  const commonParams = { operation, pageIndex: currentPage.value };
  const params = props.isPool
    ? { address: key, ...commonParams }
    : { tokenKey: key, ...commonParams };
  const res = await getTxs(params);
  // const res = await getTxs({ tokenKey: '5-1' });
  if (res) {
    const list: TxItem[] = [];
    res.list.map(v => {
      let token0, token1, decimals0, decimals1, amount0, amount1;
      const token0Price = divisionAndFix(v.token0Price, 18);
      const token0Amount = divisionAndFix(
        v.amount0,
        v.token0Decimals,
        v.token0Decimals
      );
      const totalVal = adaptiveFix(Times(token0Price, token0Amount).toFixed());
      if (v.tokenIn === v.token0) {
        token0 = v.token0Symbol;
        decimals0 = v.token0Decimals;
        amount0 = v.amount0;
        token1 = v.token1Symbol;
        decimals1 = v.token1Decimals;
        amount1 = v.amount1;
      } else {
        token0 = v.token1Symbol;
        decimals0 = v.token1Decimals;
        amount0 = v.amount1;
        token1 = v.token0Symbol;
        decimals1 = v.token0Decimals;
        amount1 = v.amount0;
      }
      if (token0 === 'NULS') {
        token0 = NSymbol;
        decimals0 = NDecimals;
      }
      if (token1 === 'NULS') {
        token1 = NSymbol;
        decimals1 = NDecimals;
      }
      token0 = replaceNULS(token0);
      token1 = replaceNULS(token1);
      amount0 = divisionAndFix(amount0, decimals0, 4);
      amount1 = divisionAndFix(amount1, decimals1, 4);
      list.push({
        type: v.type,
        hash: v.hash,
        time: dayjs(v.blockTime * 1000).format('MM-DD HH:mm'),
        totalVal: v.type === 'SWAP' ? totalVal : Times(totalVal, 2).toFixed(),
        token0,
        amount0,
        token1,
        amount1,
        address: v.userAddress
      });
    });
    txList.value = list;
    txTotal.value = res.total;
  }
}

async function getMultiRoutingTxData() {
  const key = props.assetKey;
  const operation = activeTab.value;
  const commonParams = { operation, pageIndex: currentPage.value };
  const params = { address: key, ...commonParams };
  const res = await getMultiPairTxs(params);
  // const res = await getTxs({ tokenKey: '5-1' });
  if (res) {
    const list: TxItem[] = [];
    res.list.map(v => {
      let amount, decimals;
      if (Number(v.amountIn)) {
        amount = v.amountIn;
        decimals = v.tokenInDecimals;
      } else {
        amount = v.amountOut;
        decimals = v.tokenOutDecaimals;
      }
      const tokenPrice = divisionAndFix(v.tokenPrice, 18);
      const tokenAmount = divisionAndFix(amount, decimals, decimals);
      const totalVal = adaptiveFix(Times(tokenPrice, tokenAmount).toFixed());

      const token0 = v.tokenInSymbol || '';
      const decimals0 = v.tokenInDecimals;
      const token1 = v.tokenOutSymbol || '';
      const decimals1 = v.tokenOutDecaimals;
      const amount0 = divisionAndFix(v.amountIn, decimals0, 4);
      const amount1 = divisionAndFix(v.amountOut, decimals1, 4);

      list.push({
        type: v.type,
        hash: v.hash,
        time: dayjs(v.blockTime * 1000).format('MM-DD HH:mm'),
        totalVal,
        token0,
        amount0,
        token1,
        amount1,
        address: v.userAddress,
        fromChain: getOriginChain(v.tokenInSourceChainId),
        toChain: getOriginChain(v.tokenOutSourceChainId)
      });
    });
    txList.value = list;
    txTotal.value = res.total;
  }
}

function tabChange(type: TxType) {
  activeTab.value = type
  currentPage.value = 1;
  getData();
}

function pageChange(index: number) {
  currentPage.value = index;
  getData();
}
</script>
