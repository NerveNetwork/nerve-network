<template>
  <div class="bg-[#1B1E25] rounded-xl w-full overflow-hidden h-[430px] flex flex-col">
    <slot></slot>
    <div class="flex h-[50px] leading-[50px] text-base bg-[#262A35] rounded-t-xl">
      <template v-for="item in chartTab" :key="item.label">
        <div
          :class="clsxm('cursor-pointer flex-1 text-center text-label', item.key === activeTab && 'text-white rounded-t-xl bg-card')"
          @click="activeTab = item.key"
        >
          <span>{{ item.label }}</span>
        </div>
      </template>
    </div>
    <div class="flex-1 bg-card px-6 py-4 rounded-b-xl">
      <Chart
        :type="chartTab[activeTab].type"
        :data="chartData[activeTab] || []"
        :isPrice="activeTab === 'price'"
      ></Chart>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Chart from '../Overview/Chart.vue';
import clsxm from '@/utils/clsxm';
import {
  getTokenAnalytics,
  get300DaysData,
  getMultiPairChartData
} from '@/service/api';
import { ChartTabItem, ChartItem } from '../types';
import { adaptiveFix, divisionAndFix, divisionDecimals } from '@/utils/util';
import { NKey } from '@/constants/constants';

const props = defineProps<{
  assetKey?: string;
  isPool?: boolean;
  isMultiRouting?: boolean;
  chainKey?: string;
}>();

const { t } = useI18n();

const chartData = ref<ChartTabItem>({} as ChartTabItem);

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

watch(
  () => props.chainKey,
  val => {
    if (val) {
      getChartData(props.assetKey!, val);
    }
  }
);

async function getChartData(key: string, tokenKey?: string) {
  let res;
  console.log(key, tokenKey, 666);
  if (props.isMultiRouting) {
    tokenKey = tokenKey !== 'ALL' ? tokenKey : '';
    res = await getMultiPairChartData(key, tokenKey);// 7 72 73 74 90
  } else if (props.isPool) {
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
        v.price =
          props.assetKey === NKey ? divisionDecimals(v.price, 5) : v.price;
        const priceItem = {
          label: v.period,
          value: divisionAndFix(v.price, 18, 18)
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
</script>
