<template>
  <BTCCrossIn v-if="walletStore.chain === 'BTC'" />
  <FCHCrossIn
    v-else-if="walletStore.chain === 'FCH' || walletStore.chain === 'BCH'" />
  <TBCCrossIn v-else-if="walletStore.chain === 'TBC'" />
  <NVMCrossIn v-else-if="isNVM" />
  <EVMCrossIn v-else />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import EVMCrossIn from './EVMCrossIn.vue'
import BTCCrossIn from './BTCCrossIn.vue'
import FCHCrossIn from './FCHCrossIn.vue'
import TBCCrossIn from './TBCCrossIn.vue'
import NVMCrossIn from './NVMCrossIn.vue'
import { useWalletStore } from '@/store/wallet'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'

const walletStore = useWalletStore()

const isNVM = computed(() => {
  return _networkInfo[walletStore.chain]?.type === 'NVM'
})

</script>
