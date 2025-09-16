<template>
  <div class="n-table">
    <h3 class="mb-3 text-lg font-semibold" v-if="props.title">
      {{ props.title }}
    </h3>
    <template v-if="loading">
      <div class="flex flex-col gap-4">
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
        <Skeleton class="h-9" />
      </div>
    </template>
    <template v-else>
      <el-table
        :data="props.data"
        @row-click="rowClick"
        @sort-change="sortChange">
        <template v-for="item in props.columns" :key="item.prop">
          <el-table-column v-bind="item">
            <template v-if="item.headerSlot" #header>
              <slot :name="item.headerSlot"></slot>
            </template>
            <template #default="scope">
              <slot :name="item.slotName" :row="scope.row">
                {{ scope.row[item.prop] }}
              </slot>
            </template>
          </el-table-column>
        </template>
      </el-table>
      <Pagination
        class="pt-4"
        v-if="showPagination"
        v-bind:current-page="currentPage"
        :page-size="props.pageSize"
        :total="props.total"
        @change="pageChange" />
    </template>

    <!-- <div class="n-table-pagination" v-if="showPagination">
      <div
        class="icon-prev"
        :class="{ 'disable-btn': disablePrev }"
        @click="prev">
        <i class="iconfont icon-arrowleft"></i>
      </div>
      <div class="page-number">
        {{ props.pageIndex || currentPage }}/{{ totalPage }}
      </div>
      <div
        class="icon-next"
        :class="{ 'disable-btn': disableNext }"
        @click="next">
        <i class="iconfont icon-arrowright"></i>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import Skeleton from '@/components/Base/Skeleton/index.vue'
import Pagination from '@/components/Base/Pagination/index.vue'

interface Column {
  prop: string
  label: string
  width?: string
  align?: string
  slotName?: string
  headerSlot?: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    data: any[]
    columns: Column[]
    pagination?: boolean
    total?: number
    pageIndex?: number
    pageSize?: number
    loading?: boolean
  }>(),
  {
    pagination: true,
    pageIndex: 0,
    total: 0,
    pageSize: 10
  }
)

const emit = defineEmits(['pageChange', 'rowClick', 'sortChange'])

const currentPage = ref(1)

const showPagination = computed(() => {
  return (
    props.pagination &&
    props.total &&
    Number(props.total) > Number(props.pageSize)
  )
})

const totalPage = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

const disablePrev = computed(() => {
  const page = props.pageIndex || currentPage.value
  return page <= 1
})

const disableNext = computed(() => {
  const page = props.pageIndex || currentPage.value
  return page >= totalPage.value
})

function prev() {
  if (disablePrev.value) return
  let page = props.pageIndex
  if (!page) {
    currentPage.value--
    page = currentPage.value
  } else {
    page--
  }
  emit('pageChange', page)
}

function next() {
  if (disableNext.value) return
  let page = props.pageIndex
  if (!page) {
    currentPage.value++
    page = currentPage.value
  } else {
    page++
  }
  emit('pageChange', page)
}

function pageChange(page: number) {
  currentPage.value = page
  emit('pageChange', page)
}

function rowClick(item) {
  emit('rowClick', item)
}

function sortChange(item) {
  // console.log(item,55);
  emit('sortChange', item)
}
</script>

<style scoped>
.n-table .el-table__body-wrapper {
  overflow-x: auto;
}
</style>
