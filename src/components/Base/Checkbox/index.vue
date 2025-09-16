<template>
  <label :class="labelClasses">
    <input
      type="checkbox"
      :checked="active"
      :disabled="disabled"
      @change="handleChange"
      class="sr-only" />

    <div :class="checkboxClasses">
      <svg
        v-if="active"
        class="h-full w-full text-white"
        fill="currentColor"
        viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd" />
      </svg>
    </div>

    <span v-if="text || $slots.text" :class="textClasses">
      <slot name="text">{{ text }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import clsxm from '@/utils/clsxm'

interface Props {
  checked?: boolean
  modelValue?: boolean
  text?: string
  disabled?: boolean
  labelClass?: string
  textClass?: string
  class?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  checked: undefined,
  disabled: false,
  class: '',
  labelClass: ''
})

const emit = defineEmits<Emits>()

const active = computed(() => {
  return props.modelValue || props.checked
})

const labelClasses = computed(() => {
  return clsxm(
    'inline-flex items-center gap-2 cursor-pointer',
    {
      'cursor-not-allowed opacity-50': props.disabled
    },
    props.labelClass
  )
})

const checkboxClasses = computed(() => {
  return clsxm(
    'flex items-center justify-center w-[18px] h-[18px] rounded transition-all duration-200 shrink-0',
    {
      'bg-transparent border border-[#4B4F64]': !active.value,
      'bg-btn-primary border-btn-primary': active.value
    },
    props.class
  )
})

const textClasses = computed(() => {
  return clsxm(
    'text-sm select-none',
    {
      'text-opacity-50': props.disabled
    },
    props.textClass
  )
})

const handleChange = (event: Event) => {
  if (props.disabled) return

  const target = event.target as HTMLInputElement

  if (props.checked === undefined) {
    emit('update:modelValue', target.checked)
  } else {
    // emit('change', !target.value)
  }
  emit('change', !target.value)
  // emit('update:modelValue', value)
  // emit('change', value)
}
</script>
