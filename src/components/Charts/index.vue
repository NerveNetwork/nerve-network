<template>
  <div class="chart-wrap" ref="chartRef" :style="{ width, height }"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, withDefaults, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import type { EChartsType, EChartsOption } from 'echarts';

const props = withDefaults(
  defineProps<{
    width?: string;
    height?: string;
    options: EChartsOption;
  }>(),
  {
    width: '100%',
    height: '200px'
  }
);

const chartRef = ref<HTMLElement>();
let chartInstance: EChartsType;
onMounted(() => {
  const chartDOM = chartRef.value as HTMLElement;
  chartInstance = echarts.init(chartDOM, '', { renderer: 'svg' });
});

function resizeHandle() {
  if (props.options && chartInstance) {
    chartInstance.resize();
  }
}

window.addEventListener('resize', resizeHandle);

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandle);
});

watch(
  () => props.options,
  val => {
    val && chartInstance && chartInstance.setOption(val);
  },
  {
    deep: true
  }
);
</script>

<style lang="scss"></style>
