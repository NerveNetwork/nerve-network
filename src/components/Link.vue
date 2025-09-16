<template>
  <template v-if="props.href"></template>
  <template v-else>
    <div
      @click="emit('click')"
      :class="
        clsxm(
          'btn flex items-center gap-1.5 text-primary',
          props.class
        )
      "
      href="">
      <span>{{ props.label }}</span>
      <i-custom-open />
    </div>
  </template>
</template>
<script setup lang="ts">
import clsxm from '@/utils/clsxm'
const props = defineProps<{
  label: string
  href?: string
  class?: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>
