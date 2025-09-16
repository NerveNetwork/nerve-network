<template>
  <div class="mb-8 flex items-center gap-4">
    <template v-for="(item, index) in props.items" :key="index">
      <span
        :class="
          clsxm(
            'text-base text-text',
            item.path && 'cursor-pointer text-primary'
          )
        "
        @click="toUrl(item)">
        {{ item.label }}
      </span>
      <svg
        v-if="item.path"
        width="6"
        height="10"
        viewBox="0 0 6 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 1L5 5L1 9"
          stroke="#878DAB"
          stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import clsxm from '@/utils/clsxm'

interface BreadItem {
  label: string
  path?: string
}

const props = defineProps<{
  items: BreadItem[]
}>()

const router = useRouter()

function toUrl(item: BreadItem) {
  if (item.path) {
    router.push(item.path)
  }
}
</script>
