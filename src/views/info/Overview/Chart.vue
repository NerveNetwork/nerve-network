<template>
  <div class="flex h-full flex-col">
    <div class="flex justify-between">
      <div>
        <div v-if="props.label" class="mb-2">{{ props.label }}</div>
        <div class="text-2xl font-medium">${{ $format(totalVal) }}</div>
      </div>
      <div class="text-label">{{ parsedDate }}</div>
    </div>
    <div class="flex-1">
      <template v-if="loading">
        <div class="flex flex-col gap-4">
          <Skeleton class="h-9" />
          <Skeleton class="h-9" />
        </div>
      </template>
      <template v-else>
        <template v-if="props.type === 'line'">
          <Chart
            type="line"
            :options="lineOptions"
            height="100%"
            @chartMouseMove="chartHover" />
        </template>
        <template v-else>
          <Chart
            type="bar"
            :options="barOptions"
            height="100%"
            @chartMouseMove="chartHover" />
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import Skeleton from '@/components/Base/Skeleton/index.vue'
import Chart from '@/components/Charts/index.vue'
import { useI18n } from 'vue-i18n'
import { formatNumber, priceFormat } from '@/utils/util'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/zh-cn'
import { ChartItem } from '../types'

dayjs.extend(localizedFormat)
// require('dayjs/locale/zh-cn')

// console.log(dayjs(dayjs('20220102').format()).format('ll'))
// // console.log(dayjs().format('ll'))

const props = defineProps<{
  type: 'line' | 'bar'
  label?: string
  data: ChartItem[]
  isPrice?: boolean
  loading?: boolean
}>()

const { locale } = useI18n()
/*watch(
  () => locale.value,
  val => {
    dayjs.locale(val);
  },
  {
    immediate: true
  }
);*/

const defaultIndex = computed(() => {
  return props.data.length - 1
})

const activeIndex = ref(null)

const totalVal = computed(() => {
  if (!props.data?.length) return 0
  const index = activeIndex.value ? activeIndex.value : defaultIndex.value
  return priceFormat(props.data[index!].value)
  // if (activeIndex.value !== null) {
  //   return props.data[activeIndex.value!].value;
  // }
  // return props.data[defaultIndex.value].value;
})

const parsedDate = computed(() => {
  if (!props.data?.length) return ''
  const date =
    activeIndex.value === null
      ? props.data[defaultIndex.value].label
      : props.data[activeIndex.value!].label
  const formatDate = dayjs(date + '').format()
  return dayjs(formatDate).locale(locale.value).format('ll')
})

const lineOptions = computed(() => {
  return {
    xAxis: {
      // boundaryGap: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      data: props.data.map(v => v.label),
      axisLabel: {
        formatter(value: number) {
          // return Number(value.toString().slice(-2));
          return dayjs(value).format('M.D')
        },
        interval(index: number) {
          const length = props.data.length
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
        data: props.data.map(v => v.value)
      }
    ]
  }
})

const barOptions = computed(() => {
  return {
    xAxis: {
      // boundaryGap: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        formatter(value: number) {
          return dayjs(value).format('M.D')
        },
        interval(index: number) {
          const length = props.data.length
          if (length < 12) return true
          if (index === length - 1) {
            return true
          } else {
            const windowWidth = window.innerWidth
            const interval = windowWidth > 400 ? 10 : 5
            const gap = Math.floor((length - 1) / interval)
            return index % gap === 0 && length - 1 > gap + index
          }
        }
      },
      data: props.data.map(v => v.label)
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
          color: '#71FF8D',
          type: 'solid'
        }
      }
    },
    series: [
      {
        // type: 'line',
        data: props.data.map(v => v.value),
        cursor: 'initial',
        barMaxWidth: 10
      }
    ]
  }
})

function chartHover(index: number | null) {
  if (index === null || !props.data[index]) {
    activeIndex.value = null
  } else {
    activeIndex.value = index
  }
}
</script>
