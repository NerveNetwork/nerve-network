<template>
  <div>
    <div
      class="mb-5 w-full min-w-full rounded-xl bg-card p-6 pt-4 sm:w-[37%] sm:min-w-[460px]"
      v-loading="loading">
      <div class="flex items-center justify-between">
        <div class="h-6 w-6">
          <button
            class="btn flex h-full w-full items-center justify-center rounded-md bg-card2"
            v-if="state.fromAsset && state.toAsset"
            @click="toggleExpand">
            <i-custom-on-expand v-if="!showOverview" />
            <i-custom-off-expand v-else />
          </button>
        </div>

        <div class="flex items-center gap-3">
          <button
            :disabled="!canRefresh"
            :class="
              clsxm(
                'flex h-5 w-5 items-center justify-center',
                !canRefresh && 'cursor-not-allowed'
              )
            "
            @click="forceRefresh">
            <span
              :class="
                clsxm(
                  'flex h-full w-full items-center justify-center overflow-hidden',
                  !canRefresh && 'animate-refreshing origin-center'
                )
              ">
              <i-custom-refresh />
            </span>
          </button>
          <button
            class="flex h-5 w-5 items-center justify-center"
            @click="copyPair">
            <i-custom-share />
          </button>
          <button
            class="flex h-5 w-5 items-center justify-center"
            @click="toggleSettingDialog">
            <i-custom-settings />
          </button>
        </div>
      </div>
      <div>
        <div class="pt-4">
          <CustomInput
            v-model:inputVal="state.fromAmount"
            @input="(event: any) => getToByFrom(event.target.value)"
            ref="customInput"
            :label="$t('trading.trading4')"
            :icon="(state.fromAsset && state.fromAsset.symbol) || ''"
            :assetList="assetsList"
            :hotAssets="hotAssets"
            :balance="(state.fromAsset && state.fromAsset.available) || ''"
            :selectedAsset="state.fromAsset"
            @selectAsset="selectAsset($event, 'from')"
            @max="max('from')" />
        </div>
        <div class="relative h-6">
          <div
            class="absolute left-1/2 top-1/2 flex h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card p-3">
            <button
              @click="changeDirection"
              class="btn flex h-full w-full items-center justify-center rounded-full bg-btn-primary">
              <i-custom-switch class="text-white" />
            </button>
          </div>
        </div>

        <CustomInput
          v-model:inputVal="state.toAmount"
          @input="(event: any) => getFromByTo(event.target.value)"
          :label="$t('trading.trading3')"
          :icon="(state.toAsset && state.toAsset.symbol) || ''"
          :assetList="assetsList"
          :hotAssets="hotAssets"
          :balance="(state.toAsset && state.toAsset.available) || ''"
          :selectedAsset="state.toAsset || null"
          @selectAsset="asset => selectAsset(asset, 'to')"
          @max="max('to')" />

        <div class="mt-7">
          <Button
            class="w-full"
            v-if="nerveAddress"
            :disabled="
              disableTx ||
              !!state.fromAmountError ||
              !!state.toAmountError ||
              impactButton === 2
            "
            @click="swapTrade">
            {{ confirmText }}
          </Button>
          <template v-else>
            <AuthButton class="w-full" @loading="handleLoading" />
          </template>
        </div>
      </div>

      <!-- swap info -->
      <div class="mt-7 rounded-xl bg-input" v-show="swapRate">
        <!-- swap rate -->
        <div
          class="flex h-11 items-center justify-between border-b border-line px-4">
          <span class="text-label">Rate</span>
          <div class="flex items-center gap-1.5">
            <span>{{ swapRate }}</span>
            <button class="btn" @click="toggleDirection">
              <i-custom-switch class="rotate-90 text-primary" />
            </button>
          </div>
        </div>
        <!-- info -->
        <div class="border-b border-line p-4">
          <div class="mb-2.5 flex items-center justify-between">
            <span class="text-label">{{ $t('trading.trading6') }}</span>
            <span>{{ state.protectPercent || '0.5' }}%</span>
          </div>
          <div class="mb-2.5 flex items-center justify-between">
            <span class="text-label">{{ $t('trading.trading7') }}</span>
            <span
              :style="{
                color:
                  (priceImpactFloat === '<0.01%' && 'green') || priceImpactColor
              }"
              >{{ priceImpactFloat }}</span
            >
          </div>
          <div class="mb-2.5 flex items-center justify-between">
            <template v-if="state.direction === 'from'">
              <span class="text-label">{{ $t('trading.trading8') }}</span>
              <span
                >{{ minReceive }}
                {{ state.toAsset && state.toAsset.symbol }}</span
              >
            </template>
            <template v-if="state.direction === 'to'">
              <span class="text-label">{{ $t('trading.trading15') }}</span>
              <span
                >{{ maxSale }}
                {{ state.fromAsset && state.fromAsset.symbol }}</span
              >
            </template>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-label">{{ $t('trading.trading9') }}</span>
            <span
              >{{ fee }} {{ state.fromAsset && state.fromAsset.symbol }}</span
            >
          </div>
        </div>

        <!-- route -->
        <div class="px-4 py-3">
          <div class="mb-1 text-label">{{ $t('trading.trading10') }}</div>
          <div class="flex flex-wrap items-center">
            <template
              v-for="(item, index) in state.routesSymbol"
              :key="item.assetKey">
              <div class="flex items-center">
                <SymbolIcon
                  class="h-4 w-4 md:h-4 md:w-4"
                  :icon="item.icon"
                  :asset-key="item.assetKey" />
                <span class="ml-1">{{ item.icon }}</span>
                <i-custom-arrow-right
                  class="mx-3"
                  v-if="index !== state.routesSymbol.length - 1" />
              </div>
            </template>
          </div>
        </div>
      </div>

      <SwapSetting
        v-model:show="settingDialog"
        v-model:slippageTolerance="state.protectPercent"
        @close="setUserSlippage" />
    </div>
    <p class="text-center text-primary">
      <router-link to="/asset-center">{{
        $t('trading.trading49')
      }}</router-link>
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import CustomInput from '@/components/CustomInput.vue'
import Button from '@/components/Base/Button/index.vue'
import AuthButton from '@/components/AuthButton.vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import SwapSetting from './SwapSetting.vue'
import clsxm from '@/utils/clsxm'
import {
  Division,
  divisionAndFix,
  divisionDecimals,
  fixNumber,
  Minus,
  Times,
  timesDecimals,
  tofix,
  formatFloat,
  getCurrentAccount,
  toThousands
} from '@/utils/util'
import { useI18n } from 'vue-i18n'
import nerve from 'nerve-sdk-js'
import config from '@/config'
import useToast from '@/hooks/useToast'
import useCopy from '@/hooks/useCopy'
import { useWalletStore } from '@/store/wallet'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex'
import { AssetItem, DefaultAsset, SwapState, HotAsset } from '../types'
import { Account } from '@/store/types'
import storage from '@/utils/storage'
import nerveswap from 'nerveswap-sdk'

interface Props {
  assetsList: AssetItem[]
  hotAssets: HotAsset[]
  defaultAsset: DefaultAsset
  showOverview: boolean
}

interface Emits {
  (e: 'updateRate', rate: string): void
  (e: 'selectAsset', fromAsset: AssetItem, toAsset: AssetItem): void
  (e: 'toggleExpand'): void
}

const props = withDefaults(defineProps<Props>(), {
  assetsList: () => [],
  hotAssets: () => [],
  defaultAsset: () => ({}) as DefaultAsset
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { toastError } = useToast()
const { copy } = useCopy()
const walletStore = useWalletStore()
const { nerveAddress } = storeToRefs(walletStore)

const state = reactive<SwapState>({
  feeRate: '0.3', // 千三的手续费
  fromAmount: '',
  toAmount: '',
  fromAsset: null,
  toAsset: null,
  fromAmountError: '',
  toAmountError: '',
  disableWatchFromAmount: false, // 停止监听fromAmount
  disableWatchToAmount: false, // 停止监听toAmount
  insufficient: false, // 流动性不足
  protectPercent: '', // 划点保护
  // protectSets: ["0.5", "1", "3"],
  routesSymbol: [],
  fee: '',
  priceImpact: '', // 价格影响
  direction: '',
  protectError: '',
  showLoading: false
})

const fee = ref('0')

const canRefresh = ref(true) // can click to refresh
const stopRefresh = ref(false) // stop interval refresh

const { getWalletInfo, handleResult } = useBroadcastNerveHex()

const swap = new nerveswap.swap()

onMounted(() => {
  const currentAccount = getCurrentAccount(nerveAddress.value)
  state.protectPercent = currentAccount?.slippageTolerance || '0.5'
})

function setUserSlippage() {
  const accountList: Account[] = storage.get('accountList') || []
  accountList.map(v => {
    if (v.address.NERVE === nerveAddress.value) {
      v.slippageTolerance = state.protectPercent
    }
  })
  storage.set('accountList', accountList)
}

const loading = ref(false)
function handleLoading(status: boolean) {
  loading.value = status
}
// 选择swap资产 asset-选择的资产, type-from/to
async function selectAsset(asset: AssetItem, type: string) {
  // console.log(asset, type, 9999);
  if (!asset) return false
  state.fromAmount = ''
  state.toAmount = ''
  state.priceImpact = ''
  if (type === 'from') {
    if (state.toAsset && state.toAsset.assetKey === asset.assetKey) {
      state.toAsset = { ...state.fromAsset } as AssetItem
      state.fromAsset = asset
    } else {
      state.fromAsset = asset
      if (state.toAsset) {
        if (
          state.fromAsset &&
          state.fromAsset.assetKey === state.toAsset.assetKey
        ) {
          state.toAsset = null
        }
      }
    }
  } else {
    if (state.fromAsset && asset.assetKey === state.fromAsset.assetKey) {
      state.fromAsset = { ...state.toAsset } as AssetItem
      state.toAsset = asset
    } else {
      state.toAsset = asset
      if (
        state.fromAsset &&
        state.fromAsset.assetKey === state.toAsset.assetKey
      ) {
        state.fromAsset = null
      }
    }
  }

  state.insufficient = false

  getSwapRate(true)
  emit('updateRate', '')

  if (
    state.toAsset &&
    state.fromAsset &&
    state.fromAsset.assetKey &&
    state.toAsset.assetKey
  ) {
    swap.checkIsSpecialSwap()
    // TODO
    emit('selectAsset', state.fromAsset, state.toAsset)
    storeSwapPairInfo(false, false)
    storeSwapPairInfo(false, true)
  } else {
    emit('updateRate', '')
  }
}

function changeDirectionType(type: string) {
  state.direction = type
}

// 缓存交易对的兑换信息 refresh-刷新, isTemp-反向计算
async function storeSwapPairInfo(refresh = false, isTemp = false) {
  let fromAssetKey, toAssetKey, tokenInAmount, tokenInDecimal
  if (!isTemp) {
    fromAssetKey = state.fromAsset?.assetKey
    toAssetKey = state.toAsset?.assetKey
    tokenInAmount = state.fromAmount || '1'
    tokenInDecimal = state.fromAsset?.decimals
  } else {
    fromAssetKey = state.toAsset?.assetKey
    toAssetKey = state.fromAsset?.assetKey
    tokenInAmount = state.toAmount || '1'
    tokenInDecimal = state.toAsset?.decimals
  }
  if (!fromAssetKey || !toAssetKey) return
  const amount = timesDecimals(tokenInAmount, tokenInDecimal)
  await swap.storePairInfo(fromAssetKey, toAssetKey, amount, refresh)

  // console.log(state.direction,  state.fromAmount, state.toAmount, isTemp, 999999999999999)
  if (state.direction && state.fromAmount && state.toAmount && !isTemp) {
    // refreshRate();
  }

  if (!isTemp) {
    // getSwapAmount('1', 'from', true);
  }
}

async function changeDirection() {
  if (!state.fromAsset || !state.toAsset) {
    return false
  }
  const tempToAsset = { ...state.toAsset }
  const tempFromAsset = { ...state.fromAsset }
  state.fromAsset = tempToAsset
  state.toAsset = tempFromAsset
  await storeSwapPairInfo(false, false)

  // getSwapAmount('1', 'from', true);
  emit('selectAsset', state.fromAsset, state.toAsset)
  await getAmountByToggleSwap()
}

// 通过from计算to
async function getToByFrom(val: string) {
  // console.log(val, '-----getToByFrom-----')
  changeDirectionType('from')
  if (val) {
    if (!state.fromAsset || !state.toAsset) return false
    if (
      !Number(state.fromAsset.available) ||
      // @ts-ignore
      Minus(state.fromAsset.available, val) < 0
    ) {
      state.fromAmountError =
        ((state.fromAsset && state.fromAsset.symbol) || '') +
        ' ' +
        t('transfer.transfer15')
    } else {
      state.fromAmountError = ''
    }

    const [res, priceImpact] = await getSwapAmount(val, 'from') // 通过from计算to
    state.priceImpact = priceImpact || '0'
    state.insufficient = !Number(res)
    if (Number(res)) {
      state.toAmount = res
      getSwapRate(false)
    } else {
      getSwapRate(true)
    }
  } else {
    state.priceImpact = ''
    // if (!state.fromAmountError) {
    state.toAmount = ''
    state.fromAmountError = ''
    // }
    getSwapRate(true)
  }
}
// 通过to计算from
async function getFromByTo(val: string) {
  // console.log(val, '-----getFromByTo-----')
  changeDirectionType('to')
  if (val) {
    if (!state.fromAsset || !state.toAsset) return false
    const [res, priceImpact] = await getSwapAmount(val, 'to') // 通过to计算from
    // console.log(res, priceImpact, 666);
    state.priceImpact = priceImpact || '0'
    state.insufficient = !Number(res)
    if (Number(res)) {
      state.fromAmount = res
      getSwapRate(false)
    } else {
      getSwapRate(true)
    }
  } else {
    state.priceImpact = ''
    state.fromAmount = ''
    state.fromAmountError = ''
    getSwapRate(true)
  }
}

async function getAmountByToggleSwap() {
  const fromAmount = state.fromAmount
  const toAmount = state.toAmount
  state.fromAmount = ''
  state.toAmount = ''
  // console.log(state.customerType, fromAmount, toAmount);
  if (state.direction === 'from') {
    state.toAmount = fromAmount
    await getFromByTo(fromAmount)
  } else if (state.direction === 'to') {
    state.fromAmount = toAmount
    await getToByFrom(toAmount)
  }
}

watch(
  () => props.defaultAsset,
  val => {
    if (val) {
      state.fromAsset = val.from
      state.toAsset = val.to || null
      if (val.from && val.to) {
        storeSwapPairInfo()
      }
    }
  },
  { immediate: true, deep: true }
)
watch(
  () => props.assetsList,
  val => {
    if (val) {
      if (state.fromAsset) {
        const fromAsset = val.find(
          asset =>
            state.fromAsset && asset.assetKey === state.fromAsset.assetKey
        )
        state.fromAsset = fromAsset || null
      }
      if (state.toAsset) {
        const toAsset = val.find(
          asset => state.toAsset && asset.assetKey === state.toAsset.assetKey
        )
        state.toAsset = toAsset || null
      }
    }
  },
  {
    deep: true
  }
)

async function refresh() {
  const startTime = new Date().getTime()
  try {
    canRefresh.value = false
    await storeSwapPairInfo(true)
    await storeSwapPairInfo(true, true)
    refreshRate()
  } catch (e) {
    //
  }
  const endTime = new Date().getTime()
  const diff = endTime - startTime
  if (diff < 1500) {
    setTimeout(() => {
      canRefresh.value = true
    }, 1500 - diff)
  } else {
    canRefresh.value = true
  }
}
async function forceRefresh() {
  if (timer) clearInterval(timer)
  await refresh()
  timer = window.setInterval(async () => {
    await refresh()
  }, 10000)
}

async function refreshRate() {
  if (!state.fromAmount && !state.toAmount) return
  if (stopRefresh.value) return
  let calResult
  if (state.direction === 'from') {
    calResult = await getSwapAmount(state.fromAmount, 'from') // 通过from计算to
  } else {
    calResult = await getSwapAmount(state.toAmount, 'to') // 通过from计算to
  }
  const res = calResult[0]
  const priceImpact = calResult[1]
  state.priceImpact = priceImpact || '0'
  // console.log(res, "fff");
  state.insufficient = !Number(res)
  if (Number(res)) {
    if (state.direction === 'from') {
      state.toAmount = res
    } else {
      state.fromAmount = res
    }
    getSwapRate(false)
  } else {
    getSwapRate(true)
  }
}

let timer: number // 5s刷新一次交易对信息&兑换比例
onMounted(() => {
  timer = window.setInterval(async () => {
    await refresh()
  }, 10000)
})
onBeforeUnmount(() => {
  clearInterval(timer)
})

// 计算能兑换的数量 direction- 计算from/to的数量, getInitialRate- 计算兑换比例1/n
async function getSwapAmount(
  amount: string,
  direction: 'from' | 'to'
): Promise<[swapAmount: string, priceImpact: string]> {
  try {
    stopRefresh.value = true
    const fromAssetKey = state.fromAsset?.assetKey
    const toAssetKey = state.toAsset?.assetKey
    const fromDecimal = state.fromAsset?.decimals
    const toDecimal = state.toAsset?.decimals
    if (
      fromAssetKey &&
      toAssetKey &&
      !isNaN(Number(amount)) &&
      Number(amount) > 0
    ) {
      const decimals = direction === 'from' ? fromDecimal : toDecimal
      amount = timesDecimals(amount, decimals)
      const {
        amount: amountBig,
        priceImpact,
        routes,
        fee: feeRes
      } = await swap.getSwapInfo({
        fromAssetKey,
        toAssetKey,
        amount,
        direction
      })

      // console.log(routes, '-------------------------------')
      fee.value = fixNumber(divisionDecimals(feeRes, fromDecimal), fromDecimal)
      const routesRes: typeof state.routesSymbol = []
      if (routes.length) {
        routes.map((route: string) => {
          props.assetsList.map(v => {
            if (route === v.assetKey) {
              routesRes.push({
                icon: v.symbol,
                assetKey: route
              })
            }
          })
        })
      }
      state.routesSymbol = routesRes
      const targetDeciaml = direction === 'from' ? toDecimal : fromDecimal
      const amountRes = divisionAndFix(amountBig, targetDeciaml, targetDeciaml)
      stopRefresh.value = false
      return [amountRes, priceImpact]
    }
  } catch (e) {
    //
  }
  stopRefresh.value = false
  return ['0', '0']
}

// 通过输入from获取最佳兑换信息
function bestTradeExactIn(
  amount: string,
  pairs: any,
  fromAsset = state.fromAsset,
  toAsset = state.toAsset
) {
  const tokenAmountIn = nerve.swap.tokenAmount(
    fromAsset?.chainId,
    fromAsset?.assetId,
    amount
  )
  const tokenOut = nerve.swap.token(toAsset?.chainId, toAsset?.assetId)
  const maxPairSize = 3
  const res = nerve.swap.bestTradeExactIn(
    config.chainId,
    pairs,
    tokenAmountIn,
    tokenOut,
    maxPairSize
  )
  if (res && Object.values(res).length) {
    return res
  } else {
    return null
  }
}

function getSwapRate(clear = false) {
  if (clear) {
    swapRate.value = ''
    // console.log(state.toAsset.symbol, 9888);
    return
  }
  const fromAmount = state.fromAmount
  const toAmount = state.toAmount
  if (swapDirection.value === 'to-from') {
    swapRate.value = `1 ${state.fromAsset?.symbol} ≈ ${formatFloat(
      Division(toAmount, fromAmount).toFixed(),
      1
    )} ${state.toAsset?.symbol}`
  } else {
    swapRate.value = `1 ${state.toAsset?.symbol} ≈ ${formatFloat(
      Division(fromAmount, toAmount).toFixed(),
      1
    )} ${state.fromAsset?.symbol}`
  }
}

const minReceive = computed(() => {
  if (!state.toAmount) return ''
  if (swap.isStableCoinSwap) {
    return state.toAmount
  }
  if (swap.isStableCoinForStableCoin) {
    return fixNumber(
      Minus(state.toAmount, fee.value).toFixed(),
      state.toAsset?.decimals
    )
  }
  return fixNumber(
    Times(state.toAmount, 1 - Number(state.protectPercent) / 100).toFixed(),
    state.toAsset?.decimals
  )
})

const maxSale = computed(() => {
  // 最多卖出
  if (!state.fromAmount) return ''
  if (swap.isStableCoinSwap || swap.isStableCoinForStableCoin) {
    return state.fromAmount
  }
  return fixNumber(
    Times(state.fromAmount, 1 + Number(state.protectPercent) / 100).toFixed(),
    state.fromAsset?.decimals
  )
})

const swapRate = ref('') // swap兑换比例
const swapDirection = ref('from-to') // 比例方向

function toggleDirection() {
  swapDirection.value =
    swapDirection.value === 'from-to' ? 'to-from' : 'from-to'
  getSwapRate(false)
}

function max(type: string) {
  if (type === 'from') {
    state.fromAmount = (state.fromAsset && state.fromAsset.available) || ''
    getToByFrom(state.fromAmount)
  } else {
    state.toAmount = (state.toAsset && state.toAsset.available) || ''
    getFromByTo(state.toAmount)
  }
}

const disableTx = computed(() => {
  return (
    !state.fromAmount ||
    !state.fromAsset?.symbol ||
    !state.toAmount ||
    !state.toAsset?.symbol ||
    state.insufficient ||
    !nerveAddress.value
  )
})
const impactButton = ref(0)
const priceImpactFloat = computed(() => {
  const tempPriceImpact = state.priceImpact.toString().slice(0, 6)
  let str = tofix(Times(tempPriceImpact, 100).toFixed(), 2, -1)
  // @ts-ignore
  if (Minus(str, 0.01) < 0) {
    return `<${0.01}%`
  }
  str += '%'
  return str + ''
})

watch(
  () => state.priceImpact,
  val => {
    impactButton.value = 0
    if (!val) return
    const tempPriceImpact = state.priceImpact.toString().slice(0, 6)
    let str = tofix(Times(tempPriceImpact, 100).toFixed(), 2, -1)
    // @ts-ignore
    if (Minus(str, 10) > 0) {
      impactButton.value = 1
    }
    // @ts-ignore
    if (Minus(str, 20) > 0) {
      impactButton.value = 2
    }
  }
)

const confirmText = computed(() => {
  if (state.insufficient) {
    return t('trading.trading17')
  } else if (impactButton.value === 1) {
    return t('trading.trading19')
  } else if (impactButton.value === 2) {
    return t('trading.trading20')
  } else {
    return state.fromAmountError || t('public.public10')
  }
})

const priceImpactColor = computed(() => {
  let { value } = priceImpactFloat
  if (!value) return ''
  const floatNum = Division(value.split('%')[0], 1)
  // @ts-ignore
  if (Minus(floatNum, 0.3) <= 0) {
    return 'green'
    // @ts-ignore
  } else if (Minus(floatNum, 0.3) > 0 && Minus(floatNum, 1) < 0) {
    return '#fd9d2d'
    // @ts-ignore
  } else if (Minus(floatNum, 1) >= 0) {
    return '#c33030'
  } else {
    return ''
  }
})

const settingDialog = ref(false)
function toggleExpand() {
  // if (!state.fromAsset.symbol || !state.toAsset.symbol) return;
  emit('toggleExpand')
}
function toggleSettingDialog() {
  settingDialog.value = !settingDialog.value
}

function protectPercentInput(val: string) {
  let decimals = 2
  const patrn = new RegExp(
    '^([1-9][\\d]{0,20}|0)(\\.[\\d]{0,' + decimals + '})?$'
  )
  if (patrn.exec(val) || val === '') {
    if (Number(val) > 100) {
      state.protectPercent = '100'
    } else {
      state.protectPercent = val
    }
  }
}

async function swapTrade() {
  const { provider, EVMAddress, pub } = getWalletInfo()
  loading.value = true
  const fromAssetKey = state.fromAsset?.assetKey as string
  const toAssetKey = state.toAsset?.assetKey as string
  const fromDecimal = state.fromAsset?.decimals
  try {
    const fromAddress = nerveAddress.value
    const amountIn = timesDecimals(state.fromAmount, fromDecimal)
    const res = await swap.swapTrade({
      provider,
      from: fromAddress,
      fromAssetKey,
      toAssetKey,
      amount: amountIn,
      slippage: state.protectPercent,
      EVMAddress,
      pub
    })
    const amountRemark = `${toThousands(state.fromAmount)} ${state.fromAsset?.symbol}`
    handleResult(63, res, amountRemark)
    if (res && res.hash) {
      emit('selectAsset', state.fromAsset!, state.toAsset!)
      forceRefresh()
      // state.fromAmount = ''
      // state.toAmount = ''
      // state.priceImpact = ''
    }
  } catch (e) {
    console.log(e, 'Swap-error')
    toastError(e)
  }
  loading.value = false
}

// 复制交易对url
function copyPair() {
  const { fromAsset, toAsset } = state
  const fromKey = fromAsset?.assetKey
  const toKey = toAsset?.assetKey
  if (!fromKey || !toKey) return
  const defaultUrl = window.location.origin
  const routeName = 'swap' //route.name;
  copy(`${defaultUrl}/${routeName}/${fromKey}/${toKey}`)
}
</script>
