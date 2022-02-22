<template>
  <div class="info-chart">
    <div class="head">
      <div class="head-left">
        <div v-if="props.label" class="label">{{ props.label }}</div>
        <div class="value">
          {{ props.type === 'line' ? liquidity : txTotal }} M
        </div>
      </div>
      <div class="head-right">Dec 28, 2021</div>
    </div>
    <div class="chart-wrap">
      <template v-if="props.type === 'line'">
        <Chart
          type="line"
          :options="lineOptions"
          height="100%"
          @chartMouseMove="lineHover"
        />
      </template>
      <template v-else>
        <Chart
          type="bar"
          :options="barOptions"
          height="100%"
          @chartMouseMove="barHover"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import Chart from '@/components/Charts/index.vue';

const props = defineProps<{
  type: 'line' | 'bar';
  label?: string;
  // chartData: any;
}>();

const name = ref('hi');
const lineData = ref<number[]>([]);
const liquidity = ref(0);

const barData = ref<number[]>([]);
const txTotal = ref(0);
setTimeout(() => {
  lineData.value = new Array(10)
    .fill(1)
    .map(() => Math.floor(Math.random() * 80 + 20));
  liquidity.value = lineData.value[lineData.value.length - 1];
  barData.value = new Array(100)
    .fill(1)
    .map(() => Math.floor(Math.random() * 80 + 20));
  txTotal.value = barData.value[barData.value.length - 1];
}, 100);
const lineOptions = computed(() => {
  return {
    xAxis: {
      boundaryGap: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      position: 'right',
      splitLine: {
        show: false
      }
    },
    tooltip: {
      showContent: false,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#2688f7',
          type: 'solid'
        }
      }
    },
    series: [
      {
        type: 'line',
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#a2ccfc' }, // 0% 处的颜色}
              { offset: 1, color: '#fff' } // 100% 处的颜色
            ],
            global: false // 缺省为 false
          }
        },
        lineStyle: {
          width: 2
        },
        emphasis: {
          // disabled: true
          lineStyle: {
            width: 2
          }
        },
        data: lineData.value
      }
    ]
  };
});

function lineHover(index: any) {
  if (lineData.value[index]) {
    liquidity.value = lineData.value[index];
  }
}

const barOptions = computed(() => {
  return {
    xAxis: {
      boundaryGap: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      position: 'right',
      splitLine: {
        show: false
      }
    },
    tooltip: {
      showContent: false,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#2688f7',
          type: 'solid'
        }
      }
    },
    series: [
      {
        // type: 'line',
        data: barData.value,
        cursor: 'initial'
      }
    ]
  };
});
function barHover(index: any) {
  if (barData.value[index]) {
    txTotal.value = barData.value[index];
  }
}
</script>

<style lang="scss" scoped>
.info-chart {
  display: flex;
  flex-direction: column;
  height: 100%;
  .head {
    display: flex;
    justify-content: space-between;
    .head-left {
      color: #475472;
      .label {
        font-size: 18px;
      }
      .value {
        font-size: 28px;
      }
    }
    .head-right {
      font-size: 16px;
      color: #94a6ce;
    }
  }
  .chart-wrap {
    flex: 1;
  }
}
</style>
