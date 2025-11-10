import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useWalletStore } from '@/store/wallet'
import { specialChain } from '@/hooks/useEthereum'
import { checkCanToL1OnCurrent } from '@/utils/util'
import { AssetItem, HeterogeneousInfo } from '@/store/types'
import nerve from 'nerve-sdk-js'
import { H_NULS } from '@/utils/heterogeneousChainConfig'

function getNULSAddress(pub: string) {
  return nerve.getAddressByPub(1, 1, pub, 'NULS');
}

function canToL1OnCurrent(asset: AssetItem, chain: string) {
  const assetCanToL1OnCurrent = checkCanToL1OnCurrent(asset)
  if (!assetCanToL1OnCurrent) return false
  return specialChain.indexOf(chain) < 0
}

export default function useTransfer() {
  const route = useRoute()
  const router = useRouter()
  const walletStore = useWalletStore()
  const { assetsList, wrongChain, chain, chainInfo, addressInfo } = storeToRefs(walletStore)

  const transferAsset = computed(() => {
    if (!route.query.asset) return {} as AssetItem
    return (
      assetsList.value.find(v => {
        return v.assetKey === route.query.asset
      }) || ({} as AssetItem)
    )
  })

  const assetCanCross = computed(() => {
    return !(
      wrongChain.value || !canToL1OnCurrent(transferAsset.value, chain.value)
    )
  })

  const crossList = computed(() => {
    if (!chainInfo.value.chainId) return []
    const chainId = H_NULS.chainId
    const mainAsset = 'NAI'
    const list = assetsList.value
      .filter(v => {
        return v.heterogeneousList?.find(item => {
          return item.heterogeneousChainId === chainId
        })
      })
      .map(item => {
        const tempAddress = item.heterogeneousList?.find(
          v => v.heterogeneousChainId === chainId
        )?.contractAddress
        return {
          ...item,
          contractAddress: tempAddress
        }
      })
    const tempIndex = list.findIndex(item => (item.symbol === mainAsset && item.assetKey === '5-194'))
    const tempAsset = list[tempIndex]
    if (tempIndex !== -1) {
      // 将主资产排序到到第一个
      list.splice(tempIndex, 1)
      list.unshift(tempAsset)
    }

    return list
  })

  // heterogeneous info
  const heterogeneousInfo = computed(() => {
    const heterogeneousList = transferAsset.value.heterogeneousList || []
    // 目标异构链ID
    const heterogeneousChainId = H_NULS.chainId
    if (!heterogeneousChainId) return null
    return heterogeneousList.find(
      v => v.heterogeneousChainId === heterogeneousChainId
    ) as HeterogeneousInfo
  })

  const changeAsset = (asset: AssetItem) => {
    router.replace(`${route.path}?asset=${asset.assetKey}`)
  }

  const showReConnect = () => {
    const chainIds = transferAsset.value.heterogeneousList!.map(
      v => v.heterogeneousChainId
    )
    walletStore.changeConnectChainIds(chainIds)
    walletStore.changeConnectShow(true)
  }

  const NULSAddress = computed(() => {
    if (!addressInfo.value?.pub) return ''
    return getNULSAddress(addressInfo.value.pub)
  })

  return {
    NULSAddress,
    assetsList,
    transferAsset,
    assetCanCross,
    crossList,
    heterogeneousInfo,
    changeAsset,
    showReConnect
  }
}
