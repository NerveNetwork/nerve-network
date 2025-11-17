<template>
  <div class="w1200">
    <div class="rounded-xl bg-card p-4 lg:p-6">
      <div class="mb-6 flex justify-between">
        <Tabs :tabs="routeConfig" :active-tab="route.path" class="mb-0" />
        <button
          v-if="showBtn"
          class="btn h-8 rounded-[10px] bg-[#202b39] px-1.5 md:px-2.5 text-primary"
          @click="walletStore.showAddCrossTxID = true">
          <span class="hidden md:inline-block">Re-record Transaction Hash</span>
          <i-custom-add class="inline-block w-5 h-5 md:hidden" />
        </button>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Tabs from '@/components/Base/Tabs/index.vue'
import { useWalletStore } from '@/store/wallet'

const route = useRoute()
const walletStore = useWalletStore()
const routeConfig = computed(() => {
  return [
    { label: 'Assets', path: '/asset-center', key: 'assets' },
    { label: 'Transactions', path: '/asset-center/tx', key: 'tx' }
  ]
})
const showBtn = computed(() => {
  return route.path.includes(routeConfig.value[1].path)
})
</script>
