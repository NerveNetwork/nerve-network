<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @after-leave="handleClosed">
      <div v-if="modelValue" class="fixed inset-0 z-[9999]">
        <!-- mask -->
        <div class="fixed inset-0 bg-mask" @click="handleBackdropClick"></div>

        <!-- container -->
        <div
          :class="
            clsxm(
              'relative mx-auto mb-14 mt-[20vh] min-w-[350px] max-w-[90vw] overflow-hidden rounded-xl bg-card xl:max-w-2xl',
              containerClass
            )
          ">
          <!-- title -->
          <div
            v-if="showTitle"
            class="relative h-[50px] w-full px-4 sm:h-[70px] sm:px-6">
            <button
              v-if="showBack"
              class="group absolute left-4 top-4 rounded-full p-1.5 transition-colors duration-300 hover:bg-card2"
              @click="handleBack">
              <i-custom-back class="h-5 w-5" />
            </button>

            <slot name="title">
              <h3
                :class="
                  clsxm(
                    'text-lg leading-[50px] sm:leading-[70px]',
                    titleAlign === 'left' ? 'text-left' : 'text-center'
                  )
                "
                v-if="title">
                {{ title }}
              </h3>
            </slot>

            <button
              v-if="showClose"
              class="group absolute right-4 top-4 rounded-full p-1 transition-colors duration-300 hover:bg-card2"
              @click="handleClose">
              <i-custom-close class="h-5 w-5" />
            </button>
          </div>

          <!-- body -->
          <div
            :class="
              clsxm(
                'no-scrollbar max-h-[80vh] overflow-y-auto p-4 pt-0 sm:p-6 sm:pt-0',
                bodyClass
              )
            ">
            <slot />
          </div>

          <template name="footer" v-if="$slots.footer">
            <div
              class="border-border flex items-center justify-end gap-4 border-t p-4 sm:p-6">
              <slot name="footer" />
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import clsxm from '@/utils/clsxm'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    titleAlign?: 'center' | 'left'
    showBack?: boolean
    showClose?: boolean
    showTitle?: boolean
    closeOnBackdropClick?: boolean
    containerClass?: string
    bodyClass?: string
    top?: string
  }>(),
  {
    showClose: true,
    showTitle: true,
    closeOnBackdropClick: true,
    titleAlign: 'center'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'back'): void
  (e: 'closed'): void
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  // console.log(new Date().getTime(), 'close')
}

const handleBack = () => {
  emit('back')
}
const handleClosed = () => {
  emit('closed')
  // console.log(new Date().getTime(), 'closed')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdropClick) {
    handleClose()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue) {
    handleBackdropClick()
  }
}

const bodyStyle = document.body.style
watch(
  () => props.modelValue,
  val => {
    if (val) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth
      bodyStyle.overflow = 'hidden'
      bodyStyle.paddingRight = `${scrollBarWidth}px`
    } else {
      bodyStyle.overflow = ''
      bodyStyle.paddingRight = ''
    }
  }
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
