<template>
  <div class="overview-data">
    <div class="flex-center">
      <div class="info-item">
        <p>{{ $t('home.home10') }}</p>
        <p>
          <CountUp :end-val="overviewData.turnoverAmount" />
          NVT
        </p>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="info-item">
        <p>{{ $t('home.home16') }}</p>
        <p>
          <CountUp :end-val="overviewData.nvtPublishAmount" />
          NVT
        </p>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="info-item">
        <p>{{ $t('home.home17') }}</p>
        <p>
          <CountUp :end-val="overviewData.nvtTotal" />
          NVT
        </p>
      </div>
    </div>
    <div class="flex-center">
      <div class="info-item">
        <p>{{ $t('home.home12') }}</p>
        <p>
          <CountUp :end-val="overviewData.totalStake" />
          NVT
        </p>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="info-item">
        <p>{{ $t('home.home18') }}</p>
        <p>
          <span>$</span>
          <CountUp :end-val="overviewData.turnoverUsd" />
        </p>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="info-item">
        <p>{{ $t('home.home11') }}</p>
        <p>
          <span>$</span>
          <CountUp :end-val="overviewData.totalUsd" />
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import CountUp from '@/components/CountUp.vue';
import { getOverviewData } from '@/service/api';
import { divisionDecimals, Times } from '@/utils/util';

const overviewData = ref({
  turnoverAmount: '0', //流通量
  nvtPublishAmount: '0', // 总量
  nvtTotal: '0', // 最大总量
  totalStake: '0', // 质押量
  turnoverUsd: '0', // 流通市值
  totalUsd: '0' // 总市值
});
onMounted(() => {
  getOverviewData().then(res => {
    if (res) {
      const turnoverAmount = divisionDecimals(res.nvtTurnoverAmount, 8).split(
        '.'
      )[0];
      overviewData.value.turnoverAmount = turnoverAmount;
      overviewData.value.nvtPublishAmount = divisionDecimals(
        res.nvtPublishAmount,
        8
      ).split('.')[0];
      overviewData.value.nvtTotal = divisionDecimals(res.nvtTotal, 8).split(
        '.'
      )[0];
      overviewData.value.totalStake = divisionDecimals(
        res.nvtStackTotal,
        8
      ).split('.')[0];
      overviewData.value.turnoverUsd = divisionDecimals(
        Times(res.nvtTurnoverAmount, res.nvtUsdtValue),
        8
      ).split('.')[0];
      overviewData.value.totalUsd = divisionDecimals(
        res.nvtTotalUsdtValue,
        8
      ).split('.')[0];
    }
  });
});
</script>

<style lang="scss">
.overview-data {
  // display: flex;
  padding-top: 20px;
  // align-items: center;
  .flex-center:nth-child(2) {
    padding-top: 30px;
  }

  .info-item {
    width: 165px;
    text-align: center;

    p {
      // color: #a7b1c3;
      color: #2d3750;
      font-weight: 600;
      font-size: 16px;
      line-height: 1;

      &:last-of-type {
        // font-size: 16px;
        padding-top: 8px;
        // color: #475472;
        font-weight: 400;
      }
    }
  }

  .el-divider {
    height: 30px;
    border-color: #afb5bf;
  }

  @media screen and (max-width: 600px) {
    padding-top: 25px;
    flex-direction: column;
    .flex-center {
      flex-direction: column;
      &:nth-child(2) {
        padding-top: 0;
      }
    }
    .info-item {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      &:last-of-type {
        // margin-bottom: 0;
      }

      p {
        &:last-of-type {
          padding-top: 0;
          font-size: 16px;
        }
      }
    }
    .el-divider {
      display: none;
    }
  }
}
</style>
