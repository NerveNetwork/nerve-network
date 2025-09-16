<template>
  <div class="virtual-list" :style="{ height }" ref="virtualList">
    <div
      class="scroll-box"
      :style="{ height }"
      @scroll="handleScroll"
      ref="scrollBox">
      <div
        class="scroll-hold"
        :style="{ width: '100%', height: scrollHoldHeight }"></div>
      <div class="list-wrap" v-if="renderList.length" ref="contentBox">
        <template v-for="item in renderList">
          <slot :item="item"></slot>
        </template>
      </div>
      <p
        class="no-data"
        v-else
        style="text-align: center; color: #ccc; padding-top: 30px">
        No Data
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, nextTick } from 'vue'
import { AssetItemType } from '@/views/asset-center/types'

interface Props {
  list: AssetItemType[]
  height?: string
  itemHeight?: number
  bufferCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  list: () => [],
  height: '470px',
  itemHeight: 66,
  bufferCount: 3
})

const virtualList = ref<HTMLElement>()
const scrollBox = ref<HTMLElement>()
const contentBox = ref<HTMLElement>()
let start = 0
let end = 0
const renderList = ref<AssetItemType[]>([])
let maxShowAmount: number

onMounted(() => {
  nextTick(() => {
    const { offsetHeight } = virtualList.value as HTMLElement
    maxShowAmount =
      Math.floor(offsetHeight / props.itemHeight) + Number(props.bufferCount) // 显示的 + 用于缓冲的
    getRenderList(0, maxShowAmount)
  })
})
const scrollHoldHeight = computed(() => {
  return props.list.length * props.itemHeight + 'px'
})

function resetScroll() {
  if (scrollBox.value) {
    start = 0
    end = 0
    scrollBox.value.scrollTop = 0
    if (contentBox.value) {
      contentBox.value.style.transform = `translate3d(0, 0, 0)`
    }
    getRenderList(0, maxShowAmount)
  }
}
function getRenderList(s: number, e: number) {
  start = s
  end = e
  renderList.value = props.list.slice(s, e)
}
function handleScroll() {
  const { scrollTop } = scrollBox.value as HTMLElement
  const newStart = Math.floor(scrollTop / props.itemHeight)
  const boxOffset = scrollTop - (scrollTop % props.itemHeight)
  const newEnd = maxShowAmount + newStart
  if (start !== newStart && end !== newEnd) {
    getRenderList(newStart, newEnd)
    nextTick(() => {
      const content = contentBox.value
      if (content) {
        content.style.transform = `translate3d(0, ${boxOffset}px, 0)`
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.virtual-list {
  position: relative;
  overflow: auto;
  .scroll-box {
    position: relative;
    overflow: auto;
  }
  .scroll-hold {
    position: absolute;
    width: 100%;
  }
  .list-wrap {
    height: 100%;
  }
}
</style>
