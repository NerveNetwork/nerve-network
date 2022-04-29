<template>
  <div class="multi-routing-detail w1200">
    <Breadcrumb :items="breadItems"></Breadcrumb>
    <div class="route-info flex-between">
      <div class="left flex-center">
        <SymbolIcon :icon="tokenInfo.name"></SymbolIcon>
        <div class="symbol-info">
          <p class="name">{{ tokenInfo.name }}</p>
          <p class="info">${{ tokenInfo.price }}</p>
        </div>
      </div>
      <div class="right flex-center">
        <div class="symbol-info">
          <p class="name">{{ tokenInfo.name }}</p>
          <p class="info">
            {{ $t('info.info37') }} 丨 ID: {{ tokenInfo.assetKey }}
          </p>
        </div>
        <el-button type="primary">{{ $t('info.info43') }}</el-button>
      </div>
    </div>
    <div class="overview">
      <div class="left">
        <div class="base-info bg_white radius">
          <div class="info-item">
            <p class="label mb_5">{{ $t('info.info4') }}</p>
            <p class="value fw">${{ $format(tokenInfo.liq) }}</p>
          </div>
          <div class="info-item">
            <p class="label mb_5">{{ $t('info.info11') }}</p>
            <p class="value fw">${{ $format(tokenInfo.tx_24) }}</p>
          </div>
          <div class="info-item">
            <p class="label mb_5">{{ $t('info.info12') }}</p>
            <p class="value fw">${{ $format(tokenInfo.tx_7d) }}</p>
          </div>
        </div>
      </div>
      <div class="right radius">
        <ChartTab :assetKey="tokenInfo.assetKey" is-multi-routing>
          <div class="routes-wrap">
            <div class="route-item active">{{ $t('info.info20') }}</div>
            <div class="route-item" v-for="item in multiRoutes" :key="item">
              {{ item }}
            </div>
          </div>
        </ChartTab>
      </div>
    </div>
    <FundTable
      :title="$t('info.info39')"
      :data="fundsList"
      :total="total"
      @pageChange="index => getFundsList(index)"
    />
    <TxList :assetKey="tokenInfo.assetKey" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import Breadcrumb from '../Breadcrumb.vue';
import SymbolIcon from '@/components/SymbolIcon.vue';
import ChartTab from '../PoolDetail/ChartTab.vue';
import FundTable from './FundTable.vue';
import TxList from '../PoolDetail/TxList.vue';
import { getTokenInfo } from '@/service/api';
import { TokenDetail } from '@/views/info/types';
import { adaptiveFix, divisionAndFix } from '@/utils/util';

const { t } = useI18n();
const route = useRoute();

const assetKey = route.params.id as string;
onMounted(() => {
  getFundsList(0);
  getTokenDetail();
});

const fundsList = ref([]);
const total = ref(0);
// 获取资金分布
async function getFundsList(pageIndex: number) {
  console.log(pageIndex, 99);
  fundsList.value = [
    { name: 'ETH', contract: '0x125678ad567a7981263r7', assetKey: '5-1', liq: '13241234', rate: '20' },
    { name: 'BSC', contract: '0X25678ad567a7981263r7', assetKey: '5-2', liq: '13241234', rate: '10' },
    { name: 'OKX', contract: '0x125678567a7981263r7', assetKey: '5-3', liq: '13241234', rate: '15' },
    { name: 'ETH', contract: '0x125678ad567a7981263r7', assetKey: '5-1', liq: '13241234', rate: '50' },
    { name: 'ETH', contract: '0x1278ad567a7981263r7', assetKey: '5-1', liq: '13241234', rate: '48' }
  ]
}

const tokenInfo = ref<TokenDetail>({} as TokenDetail);
async function getTokenDetail() {
  // getTxs({tokenKey:assetKey})
  const res = await getTokenInfo(assetKey);
  if (res) {
    tokenInfo.value = {
      name: res.symbol,
      assetKey: res.assetChainId + '-' + res.assetId,
      price: adaptiveFix(divisionAndFix(res.price, 18, 18)),
      tx_24: divisionAndFix(res.amountUsdtValue24H, 18, 2),
      tx_7d: divisionAndFix(res.amountUsdtValue7D, 18, 2),
      tx_24_count: res.transactionCount24H,
      liq: divisionAndFix(res.reserveUsdtValue, 18, 2)
    };
  }
}

const breadItems = computed(() => {
  return [
    { label: t('header.header12'), path: '/info' },
    { label: t('info.info35'), path: '/info/multi-routing' },
    { label: tokenInfo.value.name }
  ];
});

const multiRoutes = ref(['Ethereum', 'BSC', 'Heco', 'OKX']);
</script>

<style lang="scss">
.multi-routing-detail {
  .route-info {
    margin-bottom: 30px;
    .left {
      img {
        width: 42px;
        height: 42px;
        margin-right: 10px;
      }
    }
    .symbol-info {
      .name {
        font-size: 20px;
        font-weight: 600;
      }
      .info {
        font-size: 14px;
        color: #94a6ce;
      }
    }
    .right .symbol-info {
      text-align: right;
    }
    .right .el-button {
      min-width: 140px;
      margin-left: 20px;
      span {
        font-size: 14px;
      }
    }
  }
  .chart-tab {
    .routes-wrap {
      display: flex;
      padding: 30px 30px 5px;
      background-color: #fff;
      border-radius: 20px 20px 0 0;
    }
    .route-item {
      padding: 8px 12px;
      margin-right: 12px;
      border-radius: 10px;
      background: #f3f6fd;
      color: #94a6ce;
      cursor: pointer;
      &.active {
        background-color: #fff;
        color: #2688f7;
        border: 1px solid #2688f7;
      }
    }
    .tabs {
      margin: 0 30px;
      height: 42px;
      line-height: 40px;
      border-bottom: 1px solid #e4e9f4;
      .tab-item {
        background-color: #fff;
        border-radius: 20px 20px 0 0;
        color: #475472;
        span {
          display: inline-block;
          margin-bottom: 1px;
          color: #94A6CE;
          border-bottom: 2px solid transparent;
        }
      }
      .tab-item.active {
        span {
          color: #2688F7;
          border-bottom: 2px solid #2688F7;
        }
      }
    }
  }
  .rate-into {
    margin: 20px 0 30px;
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
    margin-bottom: 25px;
    .left {
      width: 220px;
      margin-right: 30px;
    }
    .right {
      width: 950px;
    }
    .base-info {
      padding: 50px 30px;
      height: 455px;
      .info-item {
        margin-bottom: 55px;
      }
      .value {
        font-size: 20px;
      }
      .label {
        font-size: 14px;
        color: #94a6ce;
      }
      .mb_5 {
        margin-bottom: 5px;
      }
    }
  }
  @media screen and (max-width: 1200px) {
    .rate-into {
      margin-top: 5px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      .handle-wrap {
        width: 100%;
        padding-top: 10px;
      }
    }
    .overview {
      flex-wrap: wrap;
      .left {
        width: 100%;
        margin-right: 0;
      }
      .right {
        width: 100%;
      }
      .base-info {
        padding: 20px;
        margin-bottom: 20px;
        height: auto;
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          &:last-of-type {
            margin-bottom: 0;
          }
          .value {
            font-size: 18px;
          }
        }
      }
    }
  }
}
</style>
