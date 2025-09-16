<template>
  <label :class="labelClasses">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
      class="sr-only"
    />
    
    <div :class="switchClasses">
      <div :class="thumbClasses"></div>
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
  modelValue?: boolean
  text?: string
  disabled?: boolean
  class?: string
  textClass?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
  class: ''
})

const emit = defineEmits<Emits>()

const labelClasses = computed(() => {
  return clsxm(
    'inline-flex items-center gap-1.5 cursor-pointer',
    {
      'cursor-not-allowed opacity-50': props.disabled,
    },
    props.class
  )
})

const switchClasses = computed(() => {
  return clsxm(
    'relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-200',
    {
      'bg-[#292C36] border border-[#363947]': !props.modelValue,
      'bg-btn-primary border-btn-primary': props.modelValue,
    }
  )
})

const thumbClasses = computed(() => {
  return clsxm(
    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
    {
      'translate-x-1': !props.modelValue,
      'translate-x-5': props.modelValue,
    }
  )
})

const textClasses = computed(() => {
  return clsxm(
    'text-sm text-white select-none',
    {
      'text-opacity-50': props.disabled,
    },
    props.textClass
  )
})

const handleChange = (event: Event) => {
  if (props.disabled) return
  
  const target = event.target as HTMLInputElement
  const value = target.checked
  
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
