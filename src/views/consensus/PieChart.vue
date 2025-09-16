<template>
  <div class="staking-pie flex h-full items-center">
    <!--    <PieChart :options="chartOptions" class="chart" />-->
    <Chart type="pie" :options="chartOptions" class="!w-2/5" />
    <div class="chart-legend flex h-full w-3/5 flex-col justify-center pr-3">
      <div
        class="legend-item flex w-full items-center break-all"
        v-for="(item, index) in data"
        :key="item.name">
        <i
          class="legend-circle mr-2.5 inline-block h-2.5 w-2.5 rounded-full"
          :style="{ backgroundColor: color[index] }"></i>
        <span class="mr-3 max-w-[200px] flex-1 truncate sm:text-base">{{
          item.name
        }}</span>
        <span class="text-label sm:text-base">{{ item.rate }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Chart from '@/components/Charts/index.vue'
import { toThousands } from '@/utils/util'

const props = defineProps<{
  data: any
}>()

const color = ['#1674E8', '#F7931A', '#5BABFF', '#FFD33C', '#67d1fe']
const chartOptions = computed(() => {
  // if (!props.data) return {};
  return {
    tooltip: {
      position: 'top',
      formatter: (item: any) => {
        // console.log(item, 123)
        return `<div class="staking-chart-tooltip text-xs">
         <i class="inline-block w-2.5 h-2.5 rounded-full mr-0.5" style="background-color: ${color[item.dataIndex]}"></i>
         ${item.name}: ${toThousands(
           props.data[item.dataIndex].amount
         )} ≈ $${toThousands(item.value)}
      </div>`
      }
    },
    series: [
      {
        data: props.data || []
      }
    ]
  }
})
</script>
