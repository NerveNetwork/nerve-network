<template>
  <transition
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    enter-active-class="transition duration-200 ease-in"
    leave-active-class="transition duration-150 ease-out"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
    name="drawer-fade">
    <div class="fixed inset-0 z-[9999] mobile-menu" v-show="visible">
      <div class="fixed inset-0 bg-mask"></div>
      <div
        :class="
          clsxm(
            'fixed right-0 top-0 h-full',
            visible ? ' animate-xDrawerShow' : 'animate-xDrawerHide'
          )
        ">
        <Menu v-bind="$attrs" @clickMenu="chooseMenu" />
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import clsxm from '@/utils/clsxm'
import Menu from './Menu.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const visible = computed({
  get() {
    return props.show
  },
  set(val) {
    emit('update:show', val)
  }
})

function onResize() {
  if (document.documentElement.clientWidth < 1280) {
    emit('update:show', false)
  }
}

onMounted(() => {
  window.addEventListener('resize', onResize);
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

watch(
  () => visible.value,
  val => {
    if (val) {
      document.body.classList.add('overhide')
    } else {
      document.body.classList.remove('overhide')
    }
  }
)
function chooseMenu() {
  nextTick(() => {
    visible.value = false
  })
}
</script>