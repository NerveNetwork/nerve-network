<template>
  <Modal
    title="Connect Wallet"
    containerClass="max-w-[800px] mt-[10vh]"
    v-model="visible"
    :show-close="false"
    :show-back="step === 2"
    @back="step = 1"
    @closed="onClosed">
    <template v-if="step === 1">
      <h3 class="text-base">Select a Network</h3>
      <h4 class="mb-4 text-label">
        Make sure the selected network matches the network in your wallet
      </h4>
      <ul
        class="grid max-h-[500px] grid-cols-4 gap-1.5 overflow-auto sm:grid-cols-5 md:grid-cols-6 lg:max-h-none lg:grid-cols-8">
        <li
          v-for="item in networks"
          :key="item.chainId"
          class="cursor-pointer rounded-xl border border-transparent py-3 hover:border-primary min-w-[70px]"
          @click="onChainChoose(item.type, item.name)">
          <div class="flex flex-col items-center justify-center">
            <img class="mb-1 h-10 w-10 rounded-full" :src="item.logo" alt="" />
            <span class="text-center text-xs">{{ item.label }}</span>
          </div>
        </li>
        <div class="pop-arrow"></div>
      </ul>
    </template>
    <template v-else>
      <!-- <h3>Select a Wallet</h3> -->
      <div class="grid grid-cols-2 gap-3 sm:gap-5 min-w-[350px]">
        <div
          class="group flex h-[52px] cursor-pointer items-center gap-1.5 rounded-xl border border-line px-2 transition-all hover:border-primary sm:gap-2 sm:px-3"
          v-for="item in providerList[chainType]"
          :key="item.name"
          @click="onConnect(item.provider, item.name)">
          <img class="h-8 w-8" :src="item.src" alt="" />
          <span
            class="transition-all group-hover:text-primary"
            style="word-break: break-word"
            >{{ item.name }}</span
          >
        </div>
        <!-- <p
          class="ledger-tip"
          :class="{ tc: providerList[chainType].length > 1 }"
        >
          The only hardware wallet supported is Ledger NULS
        </p> -->
      </div>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Modal from '@/components/Base/Modal/index.vue'
import { useWalletStore } from '@/store/wallet'
import { providerList } from '@/utils/providerUtil'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import useToast from '@/hooks/useToast'
import useEthereum from '@/hooks/useEthereum'

const walletStore = useWalletStore()
const { showConnect, connectChainIds } = storeToRefs(walletStore)
const { toastError } = useToast()

const { connect } = useEthereum()

const visible = computed({
  get() {
    return showConnect.value
  },
  set(val) {
    walletStore.changeConnectShow(val)
  }
})

const networks = computed(() => {
  const allChains = Object.values(_networkInfo)
  if (!connectChainIds.value.length) return allChains
  return allChains.filter(v => connectChainIds.value.includes(v.chainId))
})

const step = ref(1)
const chainType = ref('')
const chainName = ref('')

const onChainChoose = (type: string, name: string) => {
  chainType.value = type
  chainName.value = name
  step.value = 2
}

const onConnect = (providerType: string, providerName: string) => {
  connectProvider(providerType, chainName.value, providerName)
}

async function connectProvider(
  provider: string,
  chainName: string,
  providerName: string
) {
  try {
    await connect(provider, chainName, providerName)
  } catch (e) {
    // console.log(e, typeof e, e.message);
    toastError(e)
  }
  walletStore.changeConnectShow(false)
}

const onClosed = () => {
  walletStore.changeConnectShow(false)
  step.value = 1
  chainType.value = ''
  chainName.value = ''
  walletStore.changeConnectChainIds([])
}
</script>
