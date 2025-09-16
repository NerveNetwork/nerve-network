<template>
  <div :class="skeletonClasses"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import clsxm from '@/utils/clsxm'

interface Props {
  circle?: boolean
  animated?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  circle: false,
  animated: true,
  class: ''
})

const skeletonClasses = computed(() => {
  return clsxm(
    'bg-[#20232d]',
    'rounded',
    props.animated && 'animate-pulse',
    props.circle ? 'w-12 h-12 rounded-full' : 'h-8 w-full',
    props.class
  )
})
</script>

<style scoped>
@keyframes skeleton-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.animate-pulse {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
