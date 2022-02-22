<template>
  <div class="info-assets">
    <AssetsTable :title="$t('info.info15')" :data="observeList" />
    <AssetsTable :title="$t('info.info32')" :data="allAssets" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AssetsTable from '../Overview/AssetsTable.vue';

const observeList = [
  { symbol: 'NULS', price: '2', priceChange: 1, txs: 4, liq: 4 },
  { symbol: 'NVT', price: '1', priceChange: -2, txs: 3, liq: 4 }
];

const allAssets = [
  { symbol: 'NVT', price: '1', priceChange: 2, txs: 3, liq: 4 },
  { symbol: 'NULS', price: '2', priceChange: -1, txs: 4, liq: 4 },
  { symbol: 'NVT', price: '1', priceChange: -2, txs: 3, liq: 4 },
  { symbol: 'NULS', price: '2', priceChange: 1, txs: 4, liq: 4 },
  { symbol: 'NVT', price: '1', priceChange: -2, txs: 3, liq: 4 },
  { symbol: 'NULS', price: '2', priceChange: 1, txs: 4, liq: 4 }
];

const name = ref('hi');
</script>

<style></style>
