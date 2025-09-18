<template>
  <div
    class="xl:mr-5 w-full overflow-auto rounded-xl bg-card p-6 pt-4 xl:w-3/5">
    <div class="mb-8">
      <template v-if="chartLoading">
        <div class="flex flex-col gap-4">
          <Skeleton class="h-9" />
          <Skeleton class="h-9" />
        </div>
      </template>
      <template v-else>
        <div class="mb-6 flex items-center justify-between">
          <div class="flex items-center">
            <SymbolIcon
              class="!h-6 !w-6"
              :icon="swapSymbol.to"
              :key="swapSymbol.to" />
            <SymbolIcon
              class="-ml-1 !h-6 !w-6"
              :icon="swapSymbol.from"
              :key="swapSymbol.from" />
            <div class="ml-2">{{ swapSymbol.from }}/{{ swapSymbol.to }}</div>
          </div>
          <div class="text-xl font-medium">${{ $format(totalVal) }}</div>
        </div>
        <div
          class="h-[328px] rounded-xl bg-[#101116] p-2 xl:p-5"
          v-if="lineData.length">
          <Chart
            type="line"
            :options="lineOptions"
            height="100%"
            @chartMouseMove="chartHover" />
        </div>
      </template>
    </div>

    <Tabs :activeTab="txType" :tabs="tabs" @change="changeTxType" />
    <template v-if="listLoading">
      <div class="flex flex-col gap-4">
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
      </div>
    </template>
    <template v-else>
      <TxList :list="list" v-show="txType === 'swap'"></TxList>
      <TxList :list="list" v-show="txType === 'multiRouting'"></TxList>
      <Pagination
        class="pt-4"
        v-model:current-page="newPager.index"
        :page-size="newPager.size"
        :total="newPager.total"
        @change="changeList" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import Chart from '@/components/Charts/index.vue'
import Tabs from '@/components/Base/Tabs/index.vue'
import TxList from './TxList.vue'
import Pagination from '@/components/Base/Pagination/index.vue'
import Skeleton from '@/components/Base/Skeleton/index.vue'
import { formatNumber, priceFormat } from '@/utils/util'
import dayjs from 'dayjs'
import { SwapSymbol, OrderItem, Pager } from '../types'
import { ChartItem } from '@/views/info/types'

interface Props {
  swapSymbol: SwapSymbol
  lineData: ChartItem[]
  list: OrderItem[]
  pager: Pager
  txType: string
  chartLoading: boolean
  listLoading: boolean
}

interface Emit {
  (e: 'update:pager', pager: Pager): void
  (e: 'update:txType', type: string): void
  (e: 'changeList'): void
}

const props = withDefaults(defineProps<Props>(), {
  swapSymbol: () => ({}) as SwapSymbol,
  lineData: () => [],
  list: () => [],
  pager: () => ({}) as Pager
})
const emit = defineEmits<Emit>()

const defaultIndex = computed(() => {
  return props.lineData.length - 1
})

const activeIndex = ref(null)

const totalVal = computed(() => {
  if (!props.lineData?.length) return 0
  const index = activeIndex.value ? activeIndex.value : defaultIndex.value
  return priceFormat(props.lineData[index!].value)
})

const lineOptions = computed(() => {
  return {
    grid: {
      left: '10',
      right: '0',
      bottom: '5',
      top: '10',
      containLabel: true
    },
    xAxis: {
      // boundaryGap: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      data: props.lineData.map(v => v.label),
      axisLabel: {
        formatter(value: number) {
          // return Number(value.toString().slice(-2));
          return dayjs(value).format('M.D')
        },
        interval(index: number) {
          const length = props.lineData.length
          if (length < 12) return true
          if (index === length - 1) {
            return true
          } else {
            const windowWidth = window.innerWidth
            const interval = windowWidth > 400 ? 10 : 5
            const gap = parseInt((length - 1) / interval)
            return index % gap === 0 && length - 1 > gap + index
          }
        }
      }
    },
    yAxis: {
      position: 'right',
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter(value: number) {
          return '$' + formatNumber(value)
        }
      }
    },
    tooltip: {
      showContent: false,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#E17AFF',
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
              { offset: 0, color: 'rgba(225, 122, 255, 0.3)' }, // 0% 处的颜色}
              { offset: 1, color: 'rgba(225, 122, 255, 0)' } // 100% 处的颜色
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
        data: props.lineData.map(v => v.value)
      }
    ]
  }
})

const tabs = computed(() => {
  return [
    { label: 'Transaction', value: 'swap' },
    { label: 'Multi-Routing', value: 'multiRouting' }
  ]
})

function chartHover(index: number | null) {
  if (index === null || !props.lineData[index]) {
    activeIndex.value = null
  } else {
    activeIndex.value = index
  }
}

const newPager = computed({
  get() {
    return props.pager
  },
  set(val) {
    emit('update:pager', val)
  }
})
function changeTxType(type: string) {
  if (type === props.txType) return
  emit('update:txType', type)
}
function changeList() {
  emit('changeList')
}
</script>
