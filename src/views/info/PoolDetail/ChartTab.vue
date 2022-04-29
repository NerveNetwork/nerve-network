<template>
  <div class="chart-tab">
    <slot></slot>
    <div class="tabs flex">
      <template v-for="item in chartTab" :key="item.label">
        <div
          class="tab-item"
          :class="item.key === activeTab ? 'active' : ''"
          @click="activeTab = item.key"
        >
          <span>{{ item.label }}</span>
        </div>
      </template>
    </div>
    <div class="tab-content">
      <Chart
        :type="chartTab[activeTab].type"
        :data="chartData[activeTab] || []"
      ></Chart>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Chart from '../Overview/Chart.vue';
import { getTokenAnalytics, get300DaysData } from '@/service/api';
import { ChartTabItem, ChartItem } from '../types';
import { adaptiveFix, divisionAndFix } from '@/utils/util';

const props = defineProps<{
  assetKey?: string;
  isPool?: boolean;
  isMultiRouting?: boolean;
}>();

const { t } = useI18n();

watch(
  () => props.assetKey,
  val => {
    if (val) {
      getChartData(val);
    }
  },
  {
    immediate: true
  }
);

const chartData = ref<ChartTabItem>({} as ChartTabItem);
async function getChartData(key: string) {
  let res;
  if (props.isPool) {
    res = await get300DaysData(key);
  } else {
    res = await getTokenAnalytics(key);
  }
  if (res) {
    const tx: ChartItem[] = [];
    const liq: ChartItem[] = [];
    const price: ChartItem[] = [];
    res.map(v => {
      const txItem = {
        label: v.period,
        value: divisionAndFix(v.amountUsdtValue, 18, 2)
      };
      tx.push(txItem);
      const liqItem = {
        label: v.period,
        value: divisionAndFix(v.reserveUsdtValue, 18, 2)
      };
      liq.push(liqItem);
      if (!props.isPool && !props.isMultiRouting) {
        const priceItem = {
          label: v.period,
          value: adaptiveFix(divisionAndFix(v.price, 18, 18))
        };
        price.push(priceItem);
      }
    });
    chartData.value = { tx, liq, price };
  }
}

const activeTab = ref('tx');

const chartTab = computed(() => {
  if (props.isPool || props.isMultiRouting) {
    return {
      tx: { label: t('info.info34'), type: 'bar', key: 'tx' },
      liq: { label: t('info.info4'), type: 'line', key: 'liq' }
    };
  }
  return {
    tx: { label: t('info.info34'), type: 'bar', key: 'tx' },
    liq: { label: t('info.info4'), type: 'line', key: 'liq' },
    price: { label: t('info.info9'), type: 'line', key: 'price' }
  };
});

/*const chartTabData = computed(() => {
  if (props.isPool) {
    return [
      { label: t('info.info5'), type: 'bar', key: 'tx' },
      { label: t('info.info4'), type: 'line', key: 'liq' }
    ];
  }
  return [
    { label: t('info.info5'), type: 'bar', key: 'tx' },
    { label: t('info.info4'), type: 'line', key: 'liq' },
    { label: t('info.info9'), type: 'line', key: 'price' }
  ];
});*/
</script>

<style lang="scss">
.chart-tab {
  .tabs {
    height: 68px;
    line-height: 68px;
    color: #94a6ce;
    background-color: #f3f6fd;
    font-size: 18px;
    border-radius: 20px 20px 0 0;
  }
  .tab-item {
    flex: 1;
    text-align: center;
    cursor: pointer;
    &.active {
      background-color: #fff;
      border-radius: 20px 20px 0 0;
      color: #475472;
    }
  }
  .tab-content {
    height: 385px;
    padding: 15px 30px 30px;
    background-color: #fff;
    border-radius: 0 0 20px 20px;
  }
  @media screen and (max-width: 1200px) {
    .tabs {
      height: 48px;
      line-height: 48px;
      font-size: 16px;
    }
    .tab-content {
      padding: 15px;
    }
  }
}
</style>
