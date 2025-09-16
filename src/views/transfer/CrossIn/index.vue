<template>
  <BTCCrossIn v-if="walletStore.chain === 'BTC'" />
  <FCHCrossIn
    v-else-if="walletStore.chain === 'FCH' || walletStore.chain === 'BCH'" />
  <TBCCrossIn v-else-if="walletStore.chain === 'TBC'" />
  <EVMCrossIn v-else />
</template>
<script setup lang="ts">
import EVMCrossIn from './EVMCrossIn.vue'
import BTCCrossIn from './BTCCrossIn.vue'
import FCHCrossIn from './FCHCrossIn.vue'
import TBCCrossIn from './TBCCrossIn.vue'
import { useWalletStore } from '@/store/wallet'

const walletStore = useWalletStore()
</script>
