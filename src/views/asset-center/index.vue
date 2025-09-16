<template>
  <div class="w1200">
    <div class="rounded-xl bg-card p-4 lg:p-6">
      <div class="mb-6 flex justify-between">
        <div class="flex">
          <template v-for="item in routeConfig" :key="item.path">
            <router-link
              :class="
                clsxm(
                  'mr-4 md:mr-6 border-b-[2px] border-transparent pb-3 text-base md:text-lg font-semibold',
                  item.path === route.path && 'border-primary text-text'
                )
              "
              :to="item.path">
              {{ item.label }}
            </router-link>
          </template>
        </div>
        <button
          v-if="showBtn"
          class="btn h-8 rounded-[10px] bg-[#202b39] px-1.5 md:px-2.5 text-primary"
          @click="walletStore.showAddCrossTxID = true">
          Cross Out TXID
        </button>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import clsxm from '@/utils/clsxm'
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
