<template>
  <div
    class="transfer-page mx-auto w-[480px] max-w-full rounded-xl bg-card p-6">
    <BackTitle class="py-1.5" back-path="/asset-center" title="Operation" />
    <div class="mb-7 flex items-center justify-around">
      <template v-for="item in routeConfig" :key="item.path">
        <router-link
          :to="item.path + assetQuery"
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
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BackTitle from '@/components/BackTitle.vue'
import clsxm from '@/utils/clsxm'
import { useWalletStore } from '@/store/wallet'
import { canShowCrossIn, canShowCrossOut } from '@/utils/crossVisibility'
import usePausedCrossChainIds from '@/hooks/usePausedCrossChainIds'

const route = useRoute()
const router = useRouter()
const walletStore = useWalletStore()
const { assetsList } = storeToRefs(walletStore)
const { isNetworkPaused } = usePausedCrossChainIds(() => walletStore.chain)

const assetQuery = computed(() => {
  return typeof route.query.asset === 'string' ? `?asset=${route.query.asset}` : ''
})

const transferAsset = computed(() => {
  if (typeof route.query.asset !== 'string') return null
  return assetsList.value.find(v => v.assetKey === route.query.asset) || null
})

const showCrossInTab = computed(() => {
  return canShowCrossIn(walletStore.chain, isNetworkPaused.value, transferAsset.value)
})

const showCrossOutTab = computed(() => {
  return canShowCrossOut(
    walletStore.chain,
    isNetworkPaused.value,
    transferAsset.value
  )
})

const routeConfig = computed(() => {
  const tabs = [{ label: 'Transfer', path: '/transfer/2' }]
  if (showCrossInTab.value) {
    tabs.unshift({ label: 'Cross In', path: '/transfer/1' })
  }
  if (showCrossOutTab.value) {
    tabs.push({ label: 'Cross Out', path: '/transfer/3' })
  }
  return tabs
})

watch(
  [() => route.path, () => routeConfig.value],
  ([path, tabs]) => {
    const tabEnabled = tabs.some(item => item.path === path)
    if (!tabEnabled) {
      router.replace(`/transfer/2${assetQuery.value}`)
    }
  },
  { immediate: true }
)
</script>
