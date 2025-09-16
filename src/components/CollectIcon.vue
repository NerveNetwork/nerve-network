<template>
  <div
    :class="clsxm('btn cursor-pointer flex items-center justify-center', props.class)"
    @click.stop="toggleCollect">
    <template v-if="props.modelValue">
      <i-custom-light-on />
    </template>
    <template v-else>
      <i-custom-light-off />
    </template>
  </div>
</template>

<script lang="ts" setup>
import clsxm from '@/utils/clsxm'

const props = defineProps<{
  modelValue: boolean
  class?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()

function toggleCollect() {
  emit('update:modelValue', !props.modelValue)
  emit('change', !props.modelValue)
}
</script>
