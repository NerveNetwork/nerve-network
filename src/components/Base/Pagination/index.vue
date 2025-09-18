<template>
  <div
    :class="clsxm('flex items-center justify-between', props.class)"
    v-if="total > pageSize">
    <div class="text-sm">Total: {{ total }}</div>

    <div class="flex items-center space-x-2">
      <button
        :class="
          clsxm(
            'pagination-button',
            currentPage === 1 ? 'disabled' : 'hover:bg-card2 hover:text-primary'
          )
        "
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)">
        <i-carbon-chevron-left class="h-5 w-5" />
      </button>

      <template v-for="(page, index) in displayPages" :key="index">
        <template v-if="page === 'jumpPrev'">
          <button
            v-if="showJumpPrev"
            class="jumpBtn group"
            @click="handleEllipsisClick('jumpPrev')">
            <span class="group-hover:hidden">...</span>
            <span
              class="hidden group-hover:inline-block group-hover:text-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.00039 2.40039L2.40039 8.00039M2.40039 8.00039L8.00039 13.6004M2.40039 8.00039H13.6004"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
          </button>
        </template>
        <template v-else-if="page === 'jumpNext'">
          <button
            v-if="showJumpNext"
            class="jumpBtn group"
            @click="handleEllipsisClick('jumpNext')">
            <span class="group-hover:hidden">...</span>
            <span
              class="hidden group-hover:inline-block group-hover:text-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.99961 13.5996L13.5996 7.99961M13.5996 7.99961L7.99961 2.39961M13.5996 7.99961L2.39961 7.99961"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </span>
          </button>
        </template>

        <button
          v-else
          :class="
            clsxm(
              'pagination-button',
              page === currentPage ? 'active' : 'hover:bg-card2'
            )
          "
          @click="handlePageChange(page)">
          {{ page }}
        </button>
      </template>

      <button
        :class="
          clsxm(
            'pagination-button',
            currentPage === totalPages ? 'disabled' : 'hover:bg-card2'
          )
        "
        :disabled="currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)">
        <i-carbon-chevron-right class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import clsxm from '@/utils/clsxm'

interface Props {
  currentPage: number
  pageSize: number
  total: number
  class?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:currentPage', 'change'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))
const MAX_DISPLAY_PAGES = 7
const PAGE_RANGE = 5

const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const currentPage = props.currentPage

  if (totalPages.value <= MAX_DISPLAY_PAGES) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1, 'jumpPrev')

    if (currentPage < PAGE_RANGE) {
      // left
      for (let i = 1; i < PAGE_RANGE; i++) {
        pages.push(i + 1)
      }
    } else if (totalPages.value - currentPage + 1 < PAGE_RANGE) {
      // right
      for (let i = 1; i < PAGE_RANGE; i++) {
        pages.push(totalPages.value - PAGE_RANGE + i)
      }
    } else {
      // middle
      for (let i = 1; i <= PAGE_RANGE; i++) {
        pages.push(currentPage + i - 3)
      }
    }

    pages.push('jumpNext', totalPages.value)
  }

  return pages
})

const showJumpPrev = computed(() => {
  const hasJumpPrev = displayPages.value.find(v => v === 'jumpPrev')
  if (!hasJumpPrev) return false
  return props.currentPage >= PAGE_RANGE
})

const showJumpNext = computed(() => {
  const hasJumpPrev = displayPages.value.find(v => v === 'jumpNext')
  if (!hasJumpPrev) return false
  return totalPages.value - props.currentPage >= PAGE_RANGE - 1
})

const handlePageChange = (page: number | string) => {
  page = +page
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('change', page)
  }
}

const handleEllipsisClick = (type: 'jumpPrev' | 'jumpNext') => {
  const currentPage = props.currentPage
  if (type === 'jumpPrev') {
    const newPage = Math.max(1, currentPage - PAGE_RANGE)
    handlePageChange(newPage)
  } else {
    const newPage = Math.min(totalPages.value, currentPage + PAGE_RANGE)
    handlePageChange(newPage)
  }
}
</script>

<style scoped>
@tailwind utilities;
.pagination-button {
  @apply flex h-7 w-7 items-center justify-center rounded-md transition-all duration-300;
}

.pagination-button.active {
  @apply bg-primary text-white;
}

.pagination-button.disabled {
  @apply cursor-not-allowed text-label;
}

.jumpBtn {
  @apply pagination-button flex items-center justify-center hover:bg-card2;
}
.jumpBtn span:first-child {
  @apply h-full w-full;
}
</style>
