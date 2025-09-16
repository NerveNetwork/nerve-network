<template>
  <div class="min-h-[300px]" v-loading="loading">
    <template v-if="!nodeHash || !nodeDeposit">
      <CreateNode
        :address="nerveAddress"
        :nvtBalance="nvtBalance"
        @refresh="refreshInfo"
      />
    </template>
    <template v-else>
      <NodeDetail
        :hash="nodeHash"
        :address="nerveAddress"
        :nvtBalance="nvtBalance"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import CreateNode from './CreateNode.vue';
import NodeDetail from './NodeDetail.vue';
import { useWalletStore } from '@/store/wallet';
import { getAccountConsensusNode } from '@/service/api';

const walletStore = useWalletStore()
const { nerveAddress, assetsList } = storeToRefs(walletStore)

const nodeHash = ref('');
const nodeDeposit = ref(0);

const loading = ref(true);
watch(
  () => nerveAddress.value,
  val => {
    if (val) {
      getNodeInfo();
    }
  },
  {
    immediate: true
  }
);

async function getNodeInfo() {
  const address = nerveAddress.value;
  // const address = 'NERVEepb6bT6dAfEtY9Z4c38Khawdr4LKZNais';
  // const address = 'TNVTdTSPSaKU5hqs4NAG1FNExqXm4qsxKHrd2';
  if (address) {
    loading.value = true;
    const result = await getAccountConsensusNode<{
      txHash: string;
      deposit: number;
    }>(address);
    if (result) {
      nodeHash.value = result.txHash;
      nodeDeposit.value = result.deposit;
    }
  }
  loading.value = false;
}

const nvtBalance = computed(() => {
  return assetsList.value.find(v => v.symbol === 'NVT')?.available || '0';
});
async function refreshInfo() {
  await getNodeInfo();
  if (!nodeHash.value) {
    setTimeout(async () => {
      getNodeInfo();
    }, 2000);
  }
}
</script>
