import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useWalletStore } from '@/store/wallet'
import { DefaultAsset, AssetItem, HotAsset } from '../types'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import {
  getStablePairListForSwapTrade,
  getHotAssets as getHotAssetsApi
} from '@/service/api'
import { isBeta } from '@/utils/util'
import { replaceNULS } from '@/constants/constants'
import config from '@/config'

const LpSource = [10, 11, 12]

const USDTN_kEY = isBeta ? '5-102' : '9-220'
const ETHN_KEY = '9-628'
const USDCN_KEY = '9-388'

const FORBID_KEY = [USDTN_kEY, ETHN_KEY, USDCN_KEY]

export default function useAsset(isLiquidity = false) {
  const route = useRoute()
  const router = useRouter()
  const walletStore = useWalletStore()
  const { assetsList } = storeToRefs(walletStore)

  // 设置默认显示交易对
  const defaultAsset = ref<DefaultAsset>({} as DefaultAsset)
  const assets = ref<AssetItem[]>([])
  // 不能添加流动性的稳定币资产
  const stableCoins = ref<any>({})

  const hotAssets = ref<HotAsset[]>([])

  // url是否带有交易对查询信息
  const hasQuery = ref(false)
  let isLoaded = false

  // 兑换、添加流动性屏蔽LP资产
  const filterLPAssets = computed(() => {
    return assetsList.value.filter(item => {
      return LpSource.indexOf(item.source) < 0 || !item.symbol.endsWith('_LP') // 特殊处理usdtn
    })
  })

  const default_from = computed(() => {
    return filterLPAssets.value.find(item => item.assetKey === config.BTCKey) as AssetItem
  })

  const default_to = computed(() => {
    return filterLPAssets.value.find(item => item.assetKey === config.NVTKey) as AssetItem
  })

  onMounted(() => {
    getStableCoins()
    getHotAssets()
  })

  async function getStableCoins() {
    const res = await getStablePairListForSwapTrade()
    if (res) {
      res.map((v: any) => {
        Object.keys(v.groupCoin).map((coin: any) => {
          stableCoins.value[coin] = v.lpToken
        })
      })
    }
  }

  async function getHotAssets() {
    if (isLiquidity) return
    const res = await getHotAssetsApi()
    if (res && res.length) {
      const list: HotAsset[] = []
      // console.log(res, 888);
      res.map(v => {
        v.symbol = replaceNULS(v.symbol)
        list.push({
          chainId: v.chainId,
          assetId: v.assetId,
          assetKey: v.chainId + '-' + v.assetId,
          symbol: v.symbol,
          registerChain: parseRegisterChain(v.fromChainId)
        })
      })
      hotAssets.value = list
    }
  }

  function parseRegisterChain(registerChainId: number) {
    const chain = Object.values(_networkInfo).find(
      v => v.chainId === registerChainId
    )?.label
    if (chain && chain !== 'NERVE') {
      return chain
    }
    return ''
  }

  function replaceRoute(fromAsset: AssetItem, toAsset: AssetItem) {
    const from = fromAsset || default_from
    const to = toAsset || default_to
    router.replace(`/swap/${from.assetKey}/${to.assetKey}`)
  }

  watch(
    [filterLPAssets, stableCoins],
    ([val, sCoins]) => {
      // 添加流动性页面资产列表不展示可swap稳定币资产 仅限usdt
      // if (val && val.length) {
      // console.log(sCoins, '--==--');
      if (val && val.length && (!isLiquidity || Object.keys(sCoins).length)) {
        // assetsList stableCoins都存在
        if (!isLiquidity) {
          assets.value = val.filter(v => v)
        } else {
          assets.value = val.filter(v => {
            return !FORBID_KEY.includes(sCoins[v.assetKey])
            // return sCoins[v.assetKey] !== USDTN_kEY;
          })
        }
        if (!isLoaded) {
          const { fromAsset, toAsset } = route.params
          if (fromAsset || toAsset) {
            // console.log(sCoins, '34656667', toAsset);
            const from = val.find(
              // item => item.assetKey === fromAsset && !sCoins[fromAsset]
              item => item.assetKey === fromAsset
            )
            const to = val.find(
              // item => item.assetKey === toAsset && !sCoins[toAsset]
              item => item.assetKey === toAsset
            )
            if (from || to) {
              hasQuery.value = true
              defaultAsset.value = {
                from: from || default_from.value,
                to: to || default_to.value
              }
            } else {
              defaultAsset.value = {
                from: default_from.value,
                to: default_to.value
              }
            }
          } else {
            defaultAsset.value = {
              from: default_from.value,
              to: default_to.value
            }
          }
          isLoaded = true
        }
      }
    },
    {
      immediate: true,
      deep: true
    }
  )
  return {
    assetsList: assets,
    defaultAsset,
    hasQuery,
    hotAssets,
    replaceRoute
  }
}
