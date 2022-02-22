<template>
  <div class="pool-detail w1200">
    <Breadcrumb :items="breadItems"></Breadcrumb>
    <KeyInfo name="NVT-BUSD" asset-key="5-1/5-28" />
    <div class="rate-into flex-between">
      <div class="left flex-center">
        <div class="symbol_1">
          <img src="" alt="" />
          <span>1 NVT = 0.0678 BUSD</span>
        </div>
        <div class="symbol_2">
          <img src="" alt="" />
          <span>1 BUSD = 12.87 NVT</span>
        </div>
      </div>
      <HandleBtn />
    </div>
    <div class="overview">
      <div class="left">
        <div class="base-info bg_white radius">
          <div class="flex">
            <div class="liq">
              <p class="label mb_5">{{ $t('info.info4') }}</p>
              <p class="value">$ 278.78 M</p>
            </div>
            <div class="apr">
              <p class="label mb_5">{{ $t('info.info14') }}</p>
              <p class="value">37.89%</p>
            </div>
          </div>
          <div class="lock-info">
            <p class="label">{{ $t('info.info19') }}</p>
            <div class="flex-between">
              <div>
                <img src="" alt="">
                NVT
              </div>
              <span>478.89 M</span>
            </div>
            <div class="flex-between">
              <div>
                <img src="" alt="">
                BUSD
              </div>
              <span>48.98K</span>
            </div>
          </div>
        </div>
        <div class="tx-info bg_white radius">
          <div class="tab">
            <span class="active">24H</span>
            <span>7D</span>
          </div>
          <div class="tab-content flex-between">
            <div>
              <p class="label">{{ $t('info.info11') }}</p>
              <p class="value">$ 28.78 M</p>
            </div>
            <div>
              <p class="label">{{ $t('info.info12') }}</p>
              <p class="value">$ 0.78 K</p>
            </div>
          </div>
        </div>
      </div>
      <div class="right radius">
        <ChartTab v-model="activeChart" :tabs="chartTabData" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import Breadcrumb from '../Breadcrumb.vue';
import KeyInfo from './KeyInfo.vue';
import HandleBtn from './Handle.vue';
import ChartTab from './ChartTab.vue';

const { t } = useI18n();
const route = useRoute();

const assetKey = route.params.id;

const breadItems = computed(() => {
  return [
    { label: t('header.header12'), path: '/info' },
    { label: t('info.info2'), path: '/info/pools' },
    { label: assetKey }
  ];
});

const activeChart = ref('tx');
const chartTabData = computed(() => {
  return [
    { label: t('info.info5'), type: 'bar', key: 'tx' },
    { label: t('info.info4'), type: 'line', key: 'liq' }
  ]
})
</script>

<style lang="scss">
.pool-detail {
  .rate-into {
    margin: 10px 0 30px;
  }
  .symbol_1 {
    margin-right: 40px;
  }
  .radius {
    border-radius: 20px;
    border: 1px solid #e4e9f4;
  }
  .bg_white {
    background-color: #fff;
  }
  .overview {
    display: flex;
    .left {
      width: 310px;
      margin-right: 30px;
    }
    .right {
      width: 850px;
    }
    .base-info {
      height: 244px;
      padding: 30px;
      margin-bottom: 30px;
    }
    .liq,.apr {
      flex: 1;
      .value {
        font-size: 20px;
      }
    }
    .label {
      font-size: 14px;
      color: #94a6ce;
    }
    .mb_5 {
      margin-bottom: 5px;
    }
    .lock-info {
      margin-top: 25px;
      .label {
        margin-bottom: 10px;
      }
      .flex-between {
        margin-bottom: 10px;
      }
      img {
        width: 35px;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
    .tx-info {
      height: 180px;
      padding: 30px;
      .tab {
        background-color: #f3f6fd;
        color: #94a6ce;
        margin-bottom: 25px;
        border-radius: 20px;
        text-align: center;
        span {
          display: inline-block;
          width: 50%;
          height: 40px;
          line-height: 40px;
          cursor: pointer;
          &.active {
            background-color: #78a0f3;
            color: #fff;
            border-radius: 20px;
          }
        }
      }
    }
  }
}
</style>
