import { ref } from 'vue'
import { useWalletStore } from '@/store/wallet'
import {
  getTokenAnalytics,
  getTokenInfo,
  getTxs,
  getTokenHolders
} from '@/service/api'
import dayjs from 'dayjs'
import {
  adaptiveFix,
  Division,
  divisionAndFix,
  divisionDecimals,
  fixNumber,
  getOriginChain,
  priceFormat,
  Times
} from '@/utils/util'
import { SwapSymbol, DefaultAsset, AssetItem } from '../types'
import { NDecimals, NSymbol, replaceNULS } from '@/constants/constants'
import { ChartItem, TxItem, TxType } from '@/views/info/types'
import { IHolder } from '@/service/api/types/dataInfo'

export default function useSelectAsset() {
  const walletStore = useWalletStore()

  const selectedAsset = ref<DefaultAsset>()
  const swapSymbol = ref<SwapSymbol>({} as SwapSymbol)

  const chartLoading = ref(true)
  const assetInfo = ref({
    assetKey: '',
    symbol: '',
    price: '',
    chg: ''
  })
  const lineData = ref<ChartItem[]>([])

  const txLoading = ref(true)
  const txList = ref<TxItem[]>([] as TxItem[])

  const holdersLoading = ref(true)
  const holdersList = ref<IHolder[]>([])

  const txType = ref<'tx' | 'holders'>('tx') // tx | holders

  const getAssetInfo = async (fromAsset?: AssetItem, toAsset?: AssetItem) => {
    if (!walletStore.nerveAddress || !fromAsset || !toAsset) return

    const assetKey = toAsset.assetKey
    if (assetKey === assetInfo.value.assetKey) return

    chartLoading.value = true
    assetInfo.value = {
      assetKey,
      symbol: '',
      price: '',
      chg: ''
    }
    const result = await Promise.all([
      getTokenInfo(assetKey),
      getTokenAnalytics(assetKey)
    ])
    const [tokenInfo, charData = []] = result
    // const res = await getTokenAnalytics(toAsset.assetKey)
    chartLoading.value = false
    if (tokenInfo) {
      assetInfo.value = {
        assetKey,
        symbol: tokenInfo.symbol,
        price: priceFormat(divisionAndFix(tokenInfo.price, 18, 18)),
        chg: fixNumber(Division(tokenInfo.priceChange, 100).toFixed(), 2)
      }
    }
    if (charData && charData.length) {
      const price: ChartItem[] = []
      charData.map(v => {
        const priceItem = {
          label: v.period,
          value: divisionAndFix(v.price, 18, 18)
        }
        price.push(priceItem)
      })
      lineData.value = price
    } else {
      lineData.value = []
    }
  }

  const getTxList = async (asset: AssetItem) => {
    const key = asset.assetKey
    const commonParams = { operation: TxType.ALL, pageIndex: 1, pageSize: 6 }
    const params = { tokenKey: key, ...commonParams }
    const res = await getTxs(params)
    txLoading.value = false
    if (res) {
      const list: TxItem[] = []
      res.list.map(v => {
        let token0, token1, decimals0, decimals1, amount0, amount1
        const token0Price = divisionAndFix(v.token0Price, 18)
        const token0Amount = divisionAndFix(
          v.amount0,
          v.token0Decimals,
          v.token0Decimals
        )
        const totalVal = adaptiveFix(Times(token0Price, token0Amount).toFixed())
        if (v.tokenIn === v.token0) {
          token0 = v.token0Symbol
          decimals0 = v.token0Decimals
          amount0 = v.amount0
          token1 = v.token1Symbol
          decimals1 = v.token1Decimals
          amount1 = v.amount1
        } else {
          token0 = v.token1Symbol
          decimals0 = v.token1Decimals
          amount0 = v.amount1
          token1 = v.token0Symbol
          decimals1 = v.token0Decimals
          amount1 = v.amount0
        }
        if (token0 === 'NULS') {
          token0 = NSymbol
          decimals0 = NDecimals
        }
        if (token1 === 'NULS') {
          token1 = NSymbol
          decimals1 = NDecimals
        }
        token0 = replaceNULS(token0)
        token1 = replaceNULS(token1)
        amount0 = divisionAndFix(amount0, decimals0, 4)
        amount1 = divisionAndFix(amount1, decimals1, 4)
        list.push({
          type: v.type,
          hash: v.hash,
          time: dayjs(v.blockTime * 1000).format('MM-DD HH:mm'),
          totalVal: v.type === 'SWAP' ? totalVal : Times(totalVal, 2).toFixed(),
          token0,
          amount0,
          token1,
          amount1,
          address: v.userAddress
        })
      })
      txList.value = list
    } else {
      txList.value = []
    }
  }

  const getHoldersList = async (asset: AssetItem) => {
    const res: IHolder[] = await getTokenHolders(asset.assetKey)
    holdersLoading.value = false
    if (res.length) {
      res.map(v => {
        v.balance = divisionDecimals(v.balance, asset.decimals)
        // @ts-ignore
        v.rate = fixNumber(v.rate / 100, 8) + '%'
      })
      holdersList.value = res
    } else {
      holdersList.value = []
    }
  }

  return {
    swapSymbol,
    txLoading,
    txList,
    holdersLoading,
    holdersList,
    txType,
    selectedAsset,
    chartLoading,
    assetInfo,
    lineData,
    getAssetInfo,
    getTxList,
    getHoldersList
  }
}
