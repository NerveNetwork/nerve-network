<template>
  <div class="info-pools">
    <PoolsTable :title="$t('info.info15')" :data="observeList" total="6" />
    <PoolsTable :title="$t('info.info16')" :data="allList" total="6" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import PoolsTable from '../Overview/PoolsTable.vue';

const observeList = [
  { name: 'NVT', tx_24: '1', tx_7d: '2', lp_24: 3, apr: 4, liq: 5 },
  { name: 'NULS', tx_24: '2', tx_7d: '1', lp_24: 4, apr: 4, liq: 5 },
  { name: 'NVT', tx_24: '1', tx_7d: '2', lp_24: 3, apr: 4, liq: 5 }
];

const allList = [
  { name: 'NVT', tx_24: '1', tx_7d: '2', lp_24: 3, apr: 4, liq: 5 },
  { name: 'NULS', tx_24: '2', tx_7d: '1', lp_24: 4, apr: 4, liq: 5 },
  { name: 'NVT', tx_24: '1', tx_7d: '2', lp_24: 3, apr: 4, liq: 5 },
  { name: 'NULS', tx_24: '2', tx_7d: '1', lp_24: 4, apr: 4, liq: 5 },
  { name: 'NVT', tx_24: '1', tx_7d: '2', lp_24: 3, apr: 4, liq: 5 },
  { name: 'NULS', tx_24: '2', tx_7d: '1', lp_24: 4, apr: 4, liq: 5 }
];

const name = ref('hi');
</script>

<style></style>
