<!-- MoreDropdown.vue -->
<template>
  <div
    ref="triggerRef"
    class="relative flex cursor-pointer"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <!-- <slot></slot> -->
    <slot>
      <div class="flex cursor-pointer items-center gap-1.5">
        <span>More</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1.5 2.75L4 5.25L6.5 2.75"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </div>
    </slot>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="absolute z-50"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          :style="dropdownStyle">
          <slot name="dropdown">
            <div class="w-40 rounded-[10px] bg-card px-1.5 py-3 text-white">
              <a
                href="https://swapbox.nabox.io/"
                target="_blank"
                class="block rounded-md px-4 py-2 transition-colors duration-300 hover:bg-card2">
                Bridge
              </a>
              <a
                href="https://scan.nerve.network"
                target="_blank"
                class="block rounded-md px-4 py-2 transition-colors duration-300 hover:bg-card2">
                Explorer
              </a>
            </div>
          </slot>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

let showTimer: number
let hideTimer: number

const handleMouseEnter = () => {
  clearTimeout(showTimer)
  clearTimeout(hideTimer)
  showTimer = window.setTimeout(() => {
    isOpen.value = true
  }, 100)

  // positionDropdown();
}

const handleMouseLeave = () => {
  clearTimeout(showTimer)
  hideTimer = window.setTimeout(() => {
    isOpen.value = false
  }, 100)
}

const dropdownStyle = computed(() => {
  if (!triggerRef.value || !dropdownRef.value) return {}

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const dropdownWidth = dropdownRef.value.offsetWidth || 200 // 默认宽度，若未测量则使用 200px

  return {
    top: `${triggerRect.bottom + 10}px`,
    // left: `${window.scrollX + triggerRect.left - (dropdownWidth - triggerRect.width) / 2}px`,
    left: `${triggerRect.left}px`,
    minWidth: `${triggerRect.width}px`
  }
})

const positionDropdown = () => {
  if (isOpen.value && triggerRef.value && dropdownRef.value) {
    // 挂载到 body 以避免被父元素裁剪
    document.body.appendChild(dropdownRef.value)
  }
}

onMounted(() => {
  // 确保初始定位
  // positionDropdown();
})

onUnmounted(() => {
  // if (dropdownRef.value && dropdownRef.value.parentNode === document.body) {
  //   document.body.removeChild(dropdownRef.value);
  // }
})
</script>
