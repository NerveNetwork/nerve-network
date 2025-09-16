<template>
  <div class="relative" ref="wrapper">
    <slot></slot>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div
        class="absolute right-0 top-[40px] z-[111] rounded-[10px] border border-line bg-card px-1.5 py-2"
        v-if="show">
        <ul
          class="flex h-[350px] min-w-[148px] flex-wrap overflow-y-auto lg:min-w-[300px]"
          v-if="show">
          <li
            v-for="item in supportChainList"
            :key="item.chainId"
            :class="
              clsxm(
                'flex h-10 w-full cursor-pointer items-center rounded-md px-3 hover:bg-[#20232D] lg:w-1/2',
                item.name === currentChain &&
                  'bg-[#20232D] font-medium text-primary'
              )
            "
            @click.stop="switchChain(item)">
            <img class="mr-1.5 h-6 w-6 rounded-full" :src="item.logo" alt="" />
            <span class="flex-1 truncate">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useWalletStore } from '@/store/wallet'
import clsxm from '@/utils/clsxm'
import useEthereum, { AddChain, specialChain } from '@/hooks/useEthereum'
import {
  getProvider,
  getEVMProvider,
  getBTCProvider,
  getTRONProvider,
  getFCHProvider,
  getBCHProvider,
  getTBCProvider,
  TRONWebProvider,
  UnisatProvider
} from '../utils/providerUtil'
import useToast from '@/hooks/useToast'
import useClickOutside from '@/hooks/useClickOutside'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import storage from '@/utils/storage'

interface ChainItem extends AddChain {
  logo: string
  name: string
  label: string
}

const props = defineProps<{
  modelValue: boolean
  currentChain: string
  address: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const walletStore = useWalletStore()
const { toastError } = useToast()

const supportChainList: ChainItem[] = []
Object.values(_networkInfo).map((v: any) => {
  supportChainList.push({
    chainId: v.nativeId,
    rpcUrls: v.rpcUrl ? [v.rpcUrl] : [],
    name: v.name,
    chainName: v.chainName,
    // @ts-ignore
    label: v.label,
    nativeCurrency: {
      name: v.name,
      symbol: v.mainAsset,
      decimals: v.decimals
    },
    blockExplorerUrls: [v.origin],
    logo: v.logo
  })
})
const show = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const {
  addEthereumChain,
  switchEthereumChain,
  switchBTCNetwork,
  switchNULSChain
} = useEthereum()

async function switchChain(item: ChainItem) {
  const { providerType, provider } = getProvider()
  const { provider: EVMProvider } = getEVMProvider()
  const specialChains = ['BTC', 'TRON', 'FCH', 'BCH', 'TBC']
  const network = storage.get('network')
  if (item.name === props.currentChain && !walletStore.wrongChain) return
  show.value = false
  // const { provider, providerType } = getProvider();
  try {
    if (item.name === 'NULS' || item.name === 'NERVE') {
      if (provider.isNabox) {
        await switchNULSChain(item.name)
        walletStore.changeNetwork(item.name)
        walletStore.changeIsWrongChain(false)
        if (network !== 'NULS' && network !== 'NERVE') {
          reload()
        }
      } else {
        walletStore.changeNetwork(item.name)
        walletStore.changeIsWrongChain(false)
      }
    } else if (providerType === TRONWebProvider) {
      if (item.name === 'TRON') {
        //
      } else {
        toastError('Please switch wallet')
      }
    } else if (providerType === UnisatProvider) {
      if (item.name === 'BTC') {
        await switchBTCNetwork()
        walletStore.changeNetwork(item.name)
        walletStore.changeIsWrongChain(false)
      } else {
        toastError('Please switch wallet')
      }
    } else {
      // Nabox or other multi chain provider
      if (specialChains.includes(item.name)) {
        if (!provider.isNabox) {
          toastError('Please switch wallet')
        } else {
          if (item.name === 'BTC') {
            const { provider } = getBTCProvider()
            await provider.requestAccounts()
          } else if (item.name === 'TRON') {
            const { provider } = getTRONProvider()
            await provider.request({
              method: 'tron_requestAccounts'
            })
          } else if (item.name === 'FCH') {
            const { provider } = getFCHProvider()
            await provider.createSession()
          } else if (item.name === 'BCH') {
            const { provider } = getBCHProvider()
            await provider.createSession()
          } else if (item.name === 'TBC') {
            const { provider } = getTBCProvider()
            await provider.connect()
          }
          storage.set('network', item.name)
          reload()
        }
      } else {
        const oldChainId = EVMProvider.chainId
        if (item.name !== 'Ethereum') {
          const { logo, name, ...rest } = item
          await addEthereumChain(rest)
        } else {
          await switchEthereumChain({ chainId: item.chainId })
        }
        const newChainId = EVMProvider.chainId
        // newChainId !== oldChainId;
        if (
          specialChains.includes(network) ||
          network === 'NULS' ||
          network === 'NERVE'
        ) {
          storage.set('network', item.name)
          reload()
        }
      }
    }
  } catch (e) {
    //
  }
}
function reload() {
  window.location.reload()
}
const wrapper = ref<HTMLElement>()
const { isClickOutside } = useClickOutside(wrapper)
watch(
  () => isClickOutside.value,
  val => {
    if (val) {
      show.value = false
    }
  }
)
</script>
