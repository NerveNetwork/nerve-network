<template>
  <!-- trigger -->
  <div
    ref="selectRef"
    :class="triggerClasses"
    @click="toggleDropdown"
    @keydown.enter="toggleDropdown"
    @keydown.space.prevent="toggleDropdown"
    @keydown.escape="closeDropdown"
    tabindex="0"
    role="combobox"
    :aria-expanded="isOpen"
    :aria-haspopup="true">
    <!-- content -->
     <div :class="displayTextClasses">
        <div class="overflow-hidden">{{ displayText }}</div>
     </div>

    <!-- drop -->
    <div :class="arrowClasses">
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.5 2.75L4 5.25L6.5 2.75"
          stroke="#878DAB"
          stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>
    </div>
  </div>

  <!-- optinos -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0">
      <div
        v-if="isOpen"
        :class="dropdownClasses"
        :style="dropdownStyle"
        @click.stop>
        <div
          v-for="option in normalizedOptions"
          :key="getOptionValue(option)"
          :class="getOptionClasses(option)"
          @click="selectOption(option)"
          @mouseenter="hoveredIndex = normalizedOptions.indexOf(option)"
          @mouseleave="hoveredIndex = -1"
          role="option"
          :aria-selected="isSelected(option)">
          {{ getOptionLabel(option) }}
        </div>

        <div
          v-if="normalizedOptions.length === 0"
          class="px-4 py-3 text-sm text-label">
          No Data
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import useValidate from '../Form/useValidate'
import clsxm from '@/utils/clsxm'

interface Option {
  label: string
  value: any
  disabled?: boolean
}

interface Props {
  modelValue?: any
  options?: (Option | string | number)[]
  placeholder?: string
  disabled?: boolean
  class?: string
  maxHeight?: string
  dropdownClass?: string
}

interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any, option: Option): void
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: 'Select',
  disabled: false,
  class: '',
  maxHeight: '200px'
})

const emit = defineEmits<Emits>()

const { elValidate } = useValidate()

const selectRef = ref<HTMLElement>()
const isOpen = ref(false)
const hoveredIndex = ref(-1)
const dropdownStyle = ref({})

const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { label: String(option), value: option }
    }
    return option as Option
  })
})

const selectedOption = computed(() => {
  return normalizedOptions.value.find(
    option => option.value === props.modelValue
  )
})

const displayText = computed(() => {
  return selectedOption.value?.label || props.placeholder
})

const triggerClasses = computed(() => {
  return clsxm(
    'flex items-center justify-between',
    'w-full h-12 px-3',
    'bg-card2 border border-line',
    'rounded-xl',
    'cursor-pointer',
    'transition-all duration-200',
    'focus:border-primary',
    {
      'hover:border-primary/50': !props.disabled && !isOpen.value,
      'border-primary': isOpen.value,
      'opacity-50 cursor-not-allowed': props.disabled
    },
    props.class
  )
})

const displayTextClasses = computed(() => {
  return clsxm('whitespace-nowrap flex-1 text-sm overflow-hidden pr-1.5', selectedOption.value ? 'text-white' : 'text-label')
})

const arrowClasses = computed(() => {
  return clsxm('text-label transition-transform duration-200', {
    'rotate-180': isOpen.value
  })
})

const dropdownClasses = computed(() => {
  return clsxm(
    'absolute z-[9999]',
    'bg-card2 border border-line',
    'rounded-xl',
    'shadow-lg',
    'py-2',
    'min-w-[200px]',
    'overflow-hidden',
    'max-h-[300px]',
    props.dropdownClass
  )
})

const getOptionValue = (option: Option) => option.value
const getOptionLabel = (option: Option) => option.label

const isSelected = (option: Option) => {
  return option.value === props.modelValue
}

const getOptionClasses = (option: Option) => {
  const index = normalizedOptions.value.indexOf(option)
  return clsxm(
    'px-5 py-3 text-sm cursor-pointer transition-colors duration-150',
    {
      'text-white bg-[#2C303E]': isSelected(option),
      'text-white hover:bg-[#2C303E]': !isSelected(option) && !option.disabled,
      'text-label/50 cursor-not-allowed': option.disabled,
      'bg-[#2C303E]':
        hoveredIndex.value === index && !option.disabled && !isSelected(option)
    }
  )
}

const toggleDropdown = () => {
  if (props.disabled) return

  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = async () => {
  isOpen.value = true
  await nextTick()
  updateDropdownPosition()
}

const closeDropdown = () => {
  isOpen.value = false
  hoveredIndex.value = -1
}

const selectOption = (option: Option) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value, option)
  elValidate('change')
  closeDropdown()
}

const updateDropdownPosition = () => {
  if (!selectRef.value) return

  const rect = selectRef.value.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

  dropdownStyle.value = {
    position: 'absolute',
    top: `${rect.bottom + scrollTop + 4}px`,
    left: `${rect.left + scrollLeft}px`,
    width: `${rect.width}px`,
    // maxHeight: props.maxHeight,
    overflowY: 'auto'
  }
}

const handleClickOutside = (event: Event) => {
  if (!selectRef.value?.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', updateDropdownPosition)
  window.addEventListener('scroll', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
  window.removeEventListener('scroll', updateDropdownPosition)
})

watch(isOpen, newVal => {
  if (newVal) {
    nextTick(() => {
      updateDropdownPosition()
    })
  }
})
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background-color: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--colors-scrollbar);
  border-radius: 6px;
}
</style>
