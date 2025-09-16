<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center">
      <div
        class="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
    </div>

    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
import { ButtonHTMLAttributes, computed } from 'vue'
import clsxm from '@/utils/clsxm'

interface Props {
  variant?: 'default' | 'outline' | 'gradient'
  loading?: boolean
  disabled?: boolean
  class?: string
  type?: ButtonHTMLAttributes['type']
}

interface Emits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  loading: false,
  disabled: false,
  class: '',
  type: 'button'
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex items-center justify-center leading-none whitespace-nowrap',
    'h-12 px-6',
    'rounded-xl',
    'transition-all duration-200',
    'transform',

    {
      'hover:opacity-65': !props.disabled && !props.loading,
      'opacity-65': props.loading,

      'active:opacity-85 active:translate-y-px':
        !props.disabled && !props.loading,

      'cursor-not-allowed': props.disabled || props.loading
    }
  ]

  const variantClasses = {
    default: [
      'bg-btn-primary text-white',
      {
        'bg-btn-primary/60 text-opacity-40': props.disabled
      }
    ],
    outline: [
      'bg-transparent border border-primary text-primary',
      {
        'border-opacity-60 text-opacity-40': props.disabled
      }
    ],
    gradient: [
      'text-white border-0',
      {
        'text-opacity-40': props.disabled
      }
    ]
  }

  return clsxm(
    baseClasses,
    variantClasses[props.variant],
    props.variant === 'gradient' &&
      !props.disabled && {
        'bg-gradient-to-r from-[#00FFDC] via-[#266FFF] to-[#0023FF]': true
      },
    props.variant === 'gradient' &&
      props.disabled && {
        'bg-gradient-to-r from-[#00FFDC] via-[#266FFF] to-[#0023FF] bg-opacity-60': true
      },
    props.class
  )
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
