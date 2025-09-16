<template>
  <div class="transfer-page bg-card p-6 rounded-xl w-[480px] max-w-full mx-auto">
    <div class="relative flex items-center justify-center py-1.5 mb-6">
      <router-link to="/asset-center" class="absolute left-0 top-1/2 -translate-y-1/2"><i-custom-back/></router-link>
      <span class="text-lg">Operation</span>
    </div>
    <div class="flex items-center justify-around mb-7">
      <template v-for="item in routeConfig" :key="item.path">
        <router-link
          :to="item.path + `?asset=${route.query.asset}`"
          :class="clsxm('text-base h-8 px-3 flex items-center justify-center rounded-[10px] duration-300 transition-colors',
          'hover:bg-[#0056FF] hover:text-white',
          route.path === item.path && 'bg-[#0056FF] text-white')">
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import clsxm from '@/utils/clsxm';


const route = useRoute()

const routeConfig = computed(() => {
  return [
    { label: 'Cross In', path: '/transfer/1' },
    { label: 'Transfer', path: '/transfer/2' },
    { label: 'Cross Out', path: '/transfer/3' }
  ]
})
</script>
