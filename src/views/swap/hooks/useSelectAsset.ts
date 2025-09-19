import { onMounted, reactive, ref } from 'vue'
import nerve from 'nerve-sdk-js'
import config from '@/config'
import { useWalletStore } from '@/store/wallet'
import {
  userTradeHistoryPage,
  userStableTradeHistoryPage,
  getStablePairListForSwapTrade,
  getTokenAnalytics,
  getTokenInfo
} from '@/service/api'
import dayjs from 'dayjs'
import {
  Division,
  divisionAndFix,
  divisionDecimals,
  fixNumber,
  getOriginChain,
  priceFormat
} from '@/utils/util'
import { SwapSymbol, OrderItem, Pager, DefaultAsset, AssetItem } from '../types'
import { NDecimals, NSymbol } from '@/constants/constants'
import { ChartItem } from '@/views/info/types'

export default function useSelectAsset() {
  const walletStore = useWalletStore()
  // let selectedAsset = null as DefaultAsset | null;

  let stablePairList: any = []
  const getStablePairList = async () => {
    const res = await getStablePairListForSwapTrade()
    if (res) {
      stablePairList = res
    }
  }
  onMounted(getStablePairList)

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

  const listLoading = ref(true)
  const orderList = ref<OrderItem[]>([] as OrderItem[])
  const pager = reactive<Pager>({
    index: 1,
    size: 5,
    total: 0
  })
  const txType = ref('swap') // swap | multiRouting

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

  async function selectAsset(fromAsset?: AssetItem, toAsset?: AssetItem) {
    if (!walletStore.nerveAddress || !fromAsset || !toAsset) return
    selectedAsset.value = {
      from: fromAsset,
      to: toAsset
    }
    swapSymbol.value = {
      from: fromAsset.symbol,
      to: toAsset.symbol
    }
    const fromToken = nerve.swap.token(fromAsset.chainId, fromAsset.assetId)
    const toToken = nerve.swap.token(toAsset.chainId, toAsset.assetId)
    const pairAddress = nerve.swap.getStringPairAddress(
      config.chainId,
      fromToken,
      toToken
    )
    const data = {
      pairAddress,
      userAddress: walletStore.nerveAddress,
      // userAddress: 'NERVEepb65YYwPnX3rcMhd8u8jFfy9QMweY9rA',
      pageIndex: pager.index,
      pageSize: pager.size
    }
    // state.orderLoading = true;
    const isMultiRouting = txType.value === 'multiRouting'
    let res: any
    if (isMultiRouting) {
      stablePairList.map((pair: any) => {
        if (
          pair.groupCoin[fromAsset.assetKey] &&
          pair.groupCoin[toAsset.assetKey]
        ) {
          // 稳定币换稳定币
          data.pairAddress = pair.address
        } else if (
          pair.lpToken === fromAsset.assetKey &&
          pair.groupCoin[toAsset.assetKey]
        ) {
          // 稳定币N换稳定币
          data.pairAddress = pair.address
        } else if (
          pair.lpToken === toAsset.assetKey &&
          pair.groupCoin[fromAsset.assetKey]
        ) {
          // 稳定币换稳定币N
          data.pairAddress = pair.address
        } else {
          //
        }
      })
      // console.log(data, '------------data-------------', pairAddress);
      res = await userStableTradeHistoryPage(data)
      // console.log(res, '77675555');
    } else {
      res = await userTradeHistoryPage(data)
    }
    // state.orderLoading = false;
    if (res) {
      pager.total = res.total || 0
      const list: OrderItem[] = []
      res.list.map((v: any) => {
        const fromToken = v.paidTokenAmount.token
        const fromAmount = v.paidTokenAmount.amount
        const toToken = v.receivedTokenAmount.token
        const toAmount = v.receivedTokenAmount.amount
        const fromChain = getOriginChain(fromToken.heterogeneousChainId)
        const toChain = getOriginChain(toToken.heterogeneousChainId)
        if (fromToken.symbol === 'NULS') {
          fromToken.symbol = NSymbol
          fromToken.decimals = NDecimals
        }
        if (toToken.symbol === 'NULS') {
          toToken.symbol = NSymbol
          toToken.decimals = NDecimals
        }
        list.push({
          time: dayjs(v.txTime * 1000).format('MM-DD HH:mm'),
          fromAmount: divisionDecimals(fromAmount, fromToken.decimals),
          fromSymbol: isMultiRouting
            ? fromToken.symbol + '(' + fromChain + ')'
            : fromToken.symbol,
          toAmount: divisionDecimals(toAmount, toToken.decimals),
          toSymbol: isMultiRouting
            ? toToken.symbol + '(' + toChain + ')'
            : toToken.symbol,
          status: true,
          hash: v.hash
        })
      })
      orderList.value = list
    }
    listLoading.value = false
  }
  return {
    swapSymbol,
    listLoading,
    orderList,
    pager,
    txType,
    selectAsset,
    selectedAsset,
    chartLoading,
    assetInfo,
    lineData,
    getAssetInfo
  }
}
