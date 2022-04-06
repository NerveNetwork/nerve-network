<template>
  <div class="info-tx-list">
    <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="tabChange">
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
      <Table :data="txList" :page-index="currentPage" :total="txTotal" @pageChange="pageChange" />
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import Table from './Table.vue';
import { getTxs } from '@/service/api';
import dayjs from 'dayjs';
import { adaptiveFix, divisionAndFix, fixNumber } from '@/utils/util';
import { TxItem, TxType } from '../types';

const props = defineProps<{
  assetKey: string;
  isPool?: boolean;
}>();

const emit = defineEmits(['pageChange']);

const activeTab = ref(TxType.ALL);
const txList = ref<TxItem[]>([]);
const txTotal = ref(0);
const currentPage = ref(1);

watch(
  () => props.assetKey,
  val => {
    if (val) {
      getTxData();
    }
  },
  {
    immediate: true
  }
);

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
      const token0Amount = divisionAndFix(v.amount0, v.decimals0, v.decimals0);
      const totalVal = adaptiveFix(token0Price * token0Amount);
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
      amount0 = divisionAndFix(amount0, decimals0, 4);
      amount1 = divisionAndFix(amount1, decimals1, 4);
      list.push({
        type: v.type,
        hash: v.hash,
        time: dayjs(v.blockTime * 1000).format('MM-DD HH:mm'),
        totalVal: v.type === 'SWAP' ? totalVal : totalVal * 2,
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

function tabChange() {
  currentPage.value = 1;
  getTxData();
}

function pageChange(index: number) {
  currentPage.value = index;
  getTxData();
}
</script>

<style lang="scss" scoped>
.info-tx-list {
  ::v-deep .el-tabs .el-tabs__nav-wrap::after {
    width: 100%;
  }
}
</style>
