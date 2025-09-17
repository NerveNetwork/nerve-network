<template>
  <div
    class="transfer-page mx-auto w-[480px] max-w-full rounded-xl bg-card p-6">
    <BackTitle class="py-1.5" back-path="/asset-center" title="Operation" />
    <div class="mb-7 flex items-center justify-around">
      <template v-for="item in routeConfig" :key="item.path">
        <router-link
          :to="item.path + `?asset=${route.query.asset}`"
          :class="
            clsxm(
              'flex h-8 items-center justify-center rounded-[10px] px-3 text-base transition-colors duration-300',
              'hover:bg-[#0056FF] hover:text-white',
              route.path === item.path && 'bg-[#0056FF] text-white'
            )
          ">
          {{ item.label }}
        </router-link>
      </template>
    </div>
    <div class="sm:min-h-[350px]">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BackTitle from '@/components/BackTitle.vue'
import clsxm from '@/utils/clsxm'

const route = useRoute()

const routeConfig = computed(() => {
  return [
    { label: 'Cross In', path: '/transfer/1' },
    { label: 'Transfer', path: '/transfer/2' },
    { label: 'Cross Out', path: '/transfer/3' }
  ]
})
</script>
