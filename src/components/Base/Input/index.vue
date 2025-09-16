<template>
  <div
    v-if="type === 'textarea'"
    class="w-full items-center overflow-hidden rounded-xl">
    <textarea
      :class="
        clsxm(
          'w-full rounded-xl border bg-input px-1.5 py-3 leading-normal outline-none transition-colors duration-300',
          error
            ? 'border-error'
            : isFocus && !customFocus
              ? 'border-primary'
              : borderColor || 'border-line'
        )
      "
      autocomplete="off"
      :name="name"
      :value="modelValue || value"
      :placeholder="placeholder"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur" />
  </div>
  <div
    v-else
    :class="
      clsxm(
        'relative flex w-full items-center overflow-hidden rounded-xl border bg-card transition-colors duration-300',
        error
          ? 'border-error'
          : isFocus && !customFocus
            ? 'border-primary'
            : borderColor || 'border-line',
        props.class
      )
    ">
    <!-- prepend slot -->
    <div v-if="$slots.prepend" class="flex items-center pl-3">
      <slot name="prepend" />
    </div>

    <input
      :id="name"
      :class="
        clsxm(
          'h-12 w-full bg-transparent px-3 text-[14px] leading-[48px] outline-none',
          disabled && 'cursor-not-allowed',
          inputClass
        )
      "
      autocomplete="off"
      v-bind="$attrs"
      :name="name"
      :value="modelValue || value"
      :placeholder="placeholder"
      :type="type"
      :disabled="disabled"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur" />

    <!-- append slot -->
    <div v-if="$slots.append" class="flex items-center pr-3">
      <slot name="append" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue'
import { formItemContextKey  } from 'element-plus'
import clsxm from '@/utils/clsxm'
import useValidate from '../Form/useValidate'
import { createRegex } from '@/utils/util'


interface Props {
  label?: string
  name?: string
  value?: string | null | number
  modelValue?: string | null | number
  placeholder?: string
  type?: string
  error?: string
  required?: boolean
  disabled?: boolean
  decimals?: number
  class?: string
  inputClass?: string
  borderColor?: string
  customFocus?: boolean

}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  customFocus: false
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

const { elValidate } = useValidate()

const isFocus = ref(false)

let localValue = ''
const handleInput = (event: Event) => {
  const inputElement = event.target as HTMLInputElement
  const eventType = props.value !== undefined ? 'input' : 'update:modelValue'
  if (!props.decimals) {
    // @ts-ignore
    emit(eventType, inputElement.value)
    elValidate('change')
  } else {
    const reg = createRegex(props.decimals)
    if (!inputElement.value || reg.test(inputElement.value)) {
      // @ts-ignore
      emit(eventType, inputElement.value)
      elValidate('change')
      localValue = inputElement.value
    } else {
      inputElement.value = localValue
    }
  }
}

/* const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
} */

const handleFocus = (event: FocusEvent) => {
  isFocus.value = true
  emit('focus', event)
}
const handleBlur = (event: FocusEvent) => {
  isFocus.value = false
  emit('blur', event)
  elValidate('blur')
}

</script>
