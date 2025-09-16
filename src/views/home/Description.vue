<template>
  <div class="description relative pt-16 px-4 lg:px-0 lg:py-[140px]">
    <img src="../../assets/img/bg01.png" alt="" class="bg absolute bottom-0 left-0 h-[85%]">
    <img src="../../assets/img/bg02.png" alt="" class="bg absolute top-0 right-0 h-[85%]">
    <div class="flex flex-col items-center justify-center">
      <div class="text-5xl lg:text-[60px] lg:leading-[72px] font-bold text-center">
        <h3>DeFi for Everyone. Instantly.</h3>
        <h3
          class="mt-4 bg-clip-text text-transparent bg-[linear-gradient(90deg,#24FFFB_0%,#D10FF9_100%)]">
          Across All Chains
        </h3>
      </div>
      <div class="w-full lg:w-[600px] text-center text-base text-label my-8 lg:my-14">
        {{ $t('home.home2') }}
      </div>
      <Overview />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Overview from './Overview.vue'
import { useObserveAnimate } from '@/hooks/useObserveAnimate'

const bgWrapper = ref({
  width: '',
  height: '550'
})
const defaultWidth = 1920
// const defaultHeight = 937;
const initialWidth = 850
// const initialHeight = 550;

const descRef = useObserveAnimate()

function calcContent() {
  console.log(123)
  const width = document.body.clientWidth
  // const height = document.body.clientHeight;
  bgWrapper.value.width = (width / defaultWidth) * initialWidth
  // bgWrapper.value.height = (width / defaultWidth) * initialHeight;
}

onMounted(() => {
  window.addEventListener('resize', calcContent)
  calcContent()
})
onUnmounted(() => {
  window.removeEventListener('resize', calcContent)
})
</script>

<style scoped>
@media screen and (max-width: 1440px) {
  .bg {
    display: none;
  }
}
</style>
