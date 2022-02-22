<template>
  <div class="info-overview">
    <div class="chart-wrap flex-between">
      <div class="liquidity-chart">
        <Chart type="line" :label="$t('info.info4')"></Chart>
      </div>
      <div class="tx-chart">
        <Chart type="bar" :label="$t('info.info5')"></Chart>
      </div>
    </div>
    <AssetsTable
      :title="$t('info.info7')"
      :data="assetsList"
      page-size="5"
      total="6"
    />
    <PoolsTable :title="$t('info.info31')" :data="poolsList" total="6" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Chart from './Chart.vue';
import AssetsTable from './AssetsTable.vue';
import PoolsTable from './PoolsTable.vue';

const assetsList = [
  { symbol: 'NVT', price: '1', priceChange: 2, txs: 3, liq: 4 },
  { symbol: 'NULS', price: '2', priceChange: -1, txs: 4, liq: 4 },
  { symbol: 'NVT', price: '1', priceChange: -2, txs: 3, liq: 4 },
  { symbol: 'NULS', price: '2', priceChange: 1, txs: 4, liq: 4 },
  { symbol: 'NVT', price: '1', priceChange: -2, txs: 3, liq: 4 },
  { symbol: 'NULS', price: '2', priceChange: 1, txs: 4, liq: 4 }
];

const poolsList = [
  { name: 'NVT', tx_24: '1', tx_7d: '2', lp_24: 3, apr: 4, liq: 5 },
  { name: 'NULS', tx_24: '2', tx_7d: '1', lp_24: 4, apr: 4, liq: 5 },
  { name: 'NVT', tx_24: '1', tx_7d: '2', lp_24: 3, apr: 4, liq: 5 },
  { name: 'NULS', tx_24: '2', tx_7d: '1', lp_24: 4, apr: 4, liq: 5 },
  { name: 'NVT', tx_24: '1', tx_7d: '2', lp_24: 3, apr: 4, liq: 5 },
  { name: 'NULS', tx_24: '2', tx_7d: '1', lp_24: 4, apr: 4, liq: 5 }
];
</script>

<style lang="scss">
.info-overview {
  .chart-wrap {
    margin-bottom: 38px;
  }
  .liquidity-chart,
  .tx-chart {
    width: 580px;
    height: 380px;
    background-color: #fff;
    border: 1px solid #e4e9f4;
    border-radius: 20px;
    padding: 25px 25px 15px;
  }
}
</style>
