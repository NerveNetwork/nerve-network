<template>
  <div class="mint-page w1200">
    <div class="mint-nav">
      <div class="nav-item">Mint</div>
      <div class="nav-item">
        <router-link to="/assets">Assets</router-link>
      </div>
    </div>
    <Search @search="onSearch" />
    <MintList
      :list="list"
      :total="total"
      :targetAddress="targetAddress"
      @onChange="onPageChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue';
import Search from './Search.vue';
import MintList from './MintList.vue';
import dayjs from 'dayjs';
import useStoreState from '@/hooks/useStoreState';
import useMintBaseInfo from '../mintDeploy/useMintBaseInfo';
import { divisionDecimals, fixNumber, Division } from '@/utils/util';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import { getMintList } from '@/service/api/mint';
import { IMintItem } from '@/service/api/types/mint';

const { nerveAddress } = useStoreState();
const { targetAddress } = useMintBaseInfo();

const list = ref<IMintItem[]>([]);
const total = ref(0);
let assetKey = '',
  process = null,
  pageIndex = 1;
let timer: number;
onMounted(() => {
  getList();
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});

function startTimer() {
  timer = window.setInterval(getList, 5000);
}

function stopTimer() {
  window.clearInterval(timer);
}

async function getList() {
  const result = await getMintList({
    minter: nerveAddress.value,
    pageIndex,
    assetKey,
    process
  });
  result.list.map(v => {
    v.startTime = dayjs(+v.startTime * 1000).format('YYYY-MM-DD HH:mm:ss');
    v.assetUnlockTime = dayjs(+v.assetUnlockTime * 1000).format(
      'YYYY-MM-DD HH:mm:ss'
    );
    v.mintEach = divisionDecimals(v.mintEach, v.mintAssetDecimals);
    v.mintMax = divisionDecimals(v.mintMax, v.mintAssetDecimals);
    v.mintFee = divisionDecimals(v.mintFee, v.mintFeeAssetDecimals);
    v.progress = fixNumber(Division(v.progress, 100).toFixed(), 2);
    v.registerChain = Object.values(_networkInfo).find(
      k => k.chainId === v.mintAssetSourceChainId
    )?.name;
  });
  list.value = result.list;
  total.value = result.total;
}

function onSearch(searchVal: string, status: '1' | '2' | '3') {
  assetKey = searchVal;
  // @ts-ignore
  process = status === '1' ? null : status !== '3';
  stopTimer();
  startTimer();
  getList();
}

function onPageChange(index: number) {
  pageIndex = index;
  stopTimer();
  startTimer();
  getList();
}
</script>

<style lang="scss">
@import '../../assets/css/style.scss';
.mint-page {
  .mint-nav {
    position: relative;
    border-bottom: 1px solid #dfe4ef;
    display: flex;
    align-items: center;
    &:after {
      content: ' ';
      display: inline;
      height: 2px;
      width: 24px;
      background-color: $btnColor;
      position: absolute;
      bottom: 0;
      left: 10px;
    }
  }
  .nav-item {
    font-size: 20px;
    line-height: 18px;
    font-weight: 500;
    height: 36px;
    color: $txColor;
    margin-right: 60px;
    cursor: pointer;
  }
  .search-warp {
  }
}
</style>
