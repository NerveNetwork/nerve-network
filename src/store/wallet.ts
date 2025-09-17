import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import storage from '@/utils/storage'
import {
  getAssetList as getAssetListApi,
  getNVTPrice as getNVTPriceApi
} from '@/service/api'
import config from '@/config'
import { Account, AssetItem } from './types'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'

export const useWalletStore = defineStore('wallet', () => {
  const addressInfo = ref<Account>({} as Account)
  const currentAddress = ref('')
  const chain = ref(storage.get('network') || '')
  const wrongChain = ref(false)
  const showConnect = ref(false)
  const connectChainIds = ref<number[]>([])
  const assetsListLoading = ref(true)
  const assetsList = ref<AssetItem[]>(storage.get('assetList', 'session') || [])
  const nvtPrice = ref('')
  const height = ref(0)
  const showAddCrossTxID = ref(false)

  const nerveAddress = computed(() => {
    return addressInfo.value.address?.NERVE
  })

  const chainInfo = computed(() => {
    return _networkInfo[chain.value] || {}
  })

  const changeAccount = (info: Account) => {
    addressInfo.value = info
  }

  const changeAddress = (address: string) => {
    currentAddress.value = address
  }

  const changeNetwork = (network: string | null) => {
    chain.value = network
    if (network) {
      storage.set('network', network)
    } else {
      storage.remove('network')
    }
  }

  const changeIsWrongChain = (status: boolean) => {
    wrongChain.value = status
  }

  const changeConnectShow = (status: boolean) => {
    showConnect.value = status
  }

  const changeConnectChainIds = (chainIds: number[]) => {
    connectChainIds.value = chainIds
  }

  const changeAssetList = (list: AssetItem[]) => {
    assetsList.value = list
  }

  const getAssetList = async (address?: string) => {
    if (!address) {
      assetsList.value = []
      return
    }
    const res = await getAssetListApi(address)
    assetsListLoading.value = false
    if (res && res.length) {
      assetsList.value = res
      storage.set('assetList', res, 'session')
    }
  }

  const getNVTPrice = async () => {
    const res = await getNVTPriceApi(config.chainId, config.assetId)
    nvtPrice.value = res?.usdPrice || '0'
  }

  const changeHeight = (val: number) => {
    height.value = val || 0
  }

  return {
    addressInfo,
    currentAddress,
    chain,
    chainInfo,
    wrongChain,
    showConnect,
    connectChainIds,
    nerveAddress,
    assetsListLoading,
    assetsList,
    nvtPrice,
    height,
    showAddCrossTxID,
    changeAccount,
    changeAddress,
    changeNetwork,
    changeIsWrongChain,
    changeConnectShow,
    changeConnectChainIds,
    changeAssetList,
    getAssetList,
    getNVTPrice,
    changeHeight
  }
})
