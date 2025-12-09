<template>
  <Withdrawal v-if="isNVM" />
  <Withdrawal v-else />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import Withdrawal from './Withdrawal.vue'
import { useWalletStore } from '@/store/wallet'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'

const walletStore = useWalletStore()

const isNVM = computed(() => {
  return _networkInfo[walletStore.chain]?.type === 'NVM'
})

</script>
