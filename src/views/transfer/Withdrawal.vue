<template>
  <div class="cross-out" v-loading="loading">
    <!-- To -->
    <div class="mb-6">
      <div class="mb-2 text-label">To {{ chain }}</div>
      <Input
        class="bg-input"
        borderColor="border-transparent"
        v-model.trim="toAddress"
        :placeholder="$t('transfer.transfer28')" />
      <div class="mt-2 text-sm text-error" v-if="addressError">
        {{ addressError }}
      </div>
    </div>

    <!-- Asset -->
    <div>
      <CustomInput
        v-model:inputVal="amount"
        :label="$t('transfer.transfer19')"
        :icon="transferAsset.symbol"
        :assetList="crossList"
        :balance="balance"
        :selectedAsset="transferAsset"
        @selectAsset="changeAsset"
        @max="max" />
      <div v-if="!assetCanCross" class="mt-2 text-error">
        The current network does not support cross-chain transfers of this
        asset. Please switch networks or select another asset.
      </div>
      <div v-else class="mt-2 flex items-center text-sm text-label">
        <span class="mr-1">{{ $t('public.public15') }}</span>
        <i-custom-loading class="h-4 w-4 animate-spin text-label" v-if="!fee" />
        <span v-else>{{ fee + ' ' + feeSymbol }}</span>
        <div
          class="ml-5 flex cursor-pointer items-center text-primary"
          @click="showFeeDialog = true">
          <i-custom-change class="mr-1" />
          <span>{{ $t('transfer.transfer22') }}</span>
        </div>
      </div>
      <div class="pt-5">
        <Checkbox
          labelClass="items-start"
          textClass="text-error leading-[18px]"
          v-model="confirmTip"
          :text="$t('transfer.transfer30')" />
      </div>
    </div>

    <div class="pt-10">
      <Button class="w-full" v-if="!assetCanCross" @click="showReConnect">
        Switch Network
      </Button>
      <Button v-else class="w-full" :disabled="disableTransfer" @click="sendTx">
        {{ amountErrorTip || $t('transfer.transfer11') }}
      </Button>
    </div>

    <AssetsDialog
      v-model:showDialog="showFeeDialog"
      hideSearchInput
      :assetList="supportedFeeAssets"
      :showBalance="true"
      :showAmount="true"
      :selectedAsset="selectedFeeAsset"
      @changeSelect="changeFeeAsset"></AssetsDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import nerve from 'nerve-sdk-js'
import useToast from '@/hooks/useToast'
import CustomInput from '@/components/CustomInput.vue'
import Checkbox from '@/components/Base/Checkbox/index.vue'
import AssetsDialog from '@/components/AssetsDialog.vue'
import { Minus, timesDecimals, Plus, toThousands } from '@/utils/util'
import { ETransfer } from '@/utils/api'
import TronLinkApi from '@/utils/tronLink'
import config from '@/config'
import useCrossOutFee from './hooks/useCrossOutFee'
import useBTCsCrossOut from './hooks/useBTCsCrossOut'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex'
import { useWalletStore } from '@/store/wallet'
import useTransfer from './useTransfer'
import { HeterogeneousInfo, AssetItem } from '@/store/types'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import storage from '@/utils/storage'
import nerveswap from 'nerveswap-sdk'
import { NSymbol } from '@/constants/constants'

const { t } = useI18n()
const { toastError } = useToast()

const walletStore = useWalletStore()
const {
  chainInfo,
  currentAddress,
  chain,
  nerveAddress,
  addressInfo,
  wrongChain
} = storeToRefs(walletStore)

const {
  assetsList,
  transferAsset,
  assetCanCross,
  crossList,
  heterogeneousInfo,
  changeAsset,
  showReConnect
} = useTransfer()

const { getCrossOutFee } = useCrossOutFee()

const {
  isBTCs,
  isTBC,
  btcHid,
  validBTCsAddress,
  getBTCsWithdrawalInfo,
  getBTCsCrossOutFee
} = useBTCsCrossOut(chain.value)

const loading = ref(false)
const toAddress = ref(currentAddress.value)
const addressError = ref('')
const fee = ref('')
const confirmTip = ref(false)

watch(
  () => toAddress.value,
  val => {
    if (val) {
      let flag = true
      const { type } = chainInfo.value
      try {
        if (type === 'NVM') {
          validateNVMAddress(val)
          return
        }
        if (chain.value === 'TRON') {
          const tron = new TronLinkApi()
          flag = tron.validAddress(val)
        } else if (isBTCs) {
          flag = validBTCsAddress(val)
        } else {
          const transfer = new ETransfer()
          flag = transfer.validateAddress(val)
        }
      } catch (e) {
        flag = false
      }
      addressError.value = flag ? '' : t('transfer.transfer29')
    } else {
      addressError.value = ''
    }
  }
)

const validateNVMAddress = (address: string) => {
  if (address) {
    let res: any
    try {
      res = nerve.verifyAddress(address)
    } catch (e) {}
    if (!res || !res.right || res.chainId !== 1) {
      addressError.value = t('transfer.transfer29')
    } else if (res.type === 2) {
      // type 1:主网地址 2：合约地址 3:多签地址
      addressError.value = t('transfer.transfer26')
    } else {
      addressError.value = ''
    }
  } else {
    addressError.value = ''
  }
}

const amount = ref('')

const balance = computed(() => {
  const asset = crossList.value.find(asset => {
    return asset.assetKey === transferAsset.value.assetKey
  })
  return asset ? asset.available : ''
})

const amountErrorTip = ref('')
const disableTransfer = computed(() => {
  return !!(
    !fee.value ||
    !amount.value ||
    !balance.value ||
    amountErrorTip.value ||
    wrongChain.value ||
    !toAddress.value ||
    addressError.value ||
    !confirmTip.value
  )
})
const feeSymbol = ref('')
const showFeeDialog = ref(false)

const selectedFeeAsset = ref<AssetItem>({} as AssetItem) // 手续费资产信息--L1网络在nerve上的主资产
const supportedFeeAssets = ref<AssetItem[]>([]) // 可充当提现手续费的资产

watch(
  () => transferAsset.value,
  (val, old) => {
    if (val.assetKey && val.assetKey !== old?.assetKey) {
      selectAsset()
    }
  }
)

onMounted(async () => {
  if (wrongChain.value) return
  getFeeAssetInfo()
  // selectAsset()
  const crossChainInfo = storage.get('crossChainInfo')
  if (isBTCs) {
    const multySignAddress = crossChainInfo[btcHid].multySignAddress
    if (isTBC) {
      getBTCCrossOutFeeHandle()
    } else {
      await getBTCsWithdrawalInfo(multySignAddress)
      getBTCCrossOutFeeHandle()
      if (chain.value === 'BTC') {
        // getBTCCrossOutFeeHandle()
      }
    }
  } else {
    getCrossOutFeeHandle()
  }
})

function getFeeAssetInfo() {
  const network = chain.value
  const feeAssets: AssetItem[] = []
  const htgMainAsset = Object.values(_networkInfo).filter(
    v => v.name !== NSymbol
  )
  assetsList.value.map(v => {
    htgMainAsset.map(item => {
      const exist = feeAssets.find(k => k.assetKey === v.assetKey)
      if (item.assetKey === v.assetKey && !exist) {
        feeAssets.push(v)
      }
    })
  })
  const defaultFeeAsset = _networkInfo[network] || _networkInfo.NERVE
  selectedFeeAsset.value = assetsList.value.find(asset => {
    return asset.assetKey === defaultFeeAsset.assetKey
  }) as AssetItem
  feeSymbol.value =
    network === 'ENULS' ? NSymbol : _networkInfo[network]?.mainAsset
  supportedFeeAssets.value = feeAssets
}

// 手续费与交易资产是否是同一个资产
const FeeAsset_TransferAsset_IsSame = computed(() => {
  // if (!selectedFeeAsset.value || !transferAsset.value) return false;
  return (
    selectedFeeAsset.value.chainId === transferAsset.value.chainId &&
    selectedFeeAsset.value.assetId === transferAsset.value.assetId
  )
})

// 选择交易资产
function selectAsset() {
  fee.value = ''
  amount.value = ''
  if (heterogeneousInfo.value) {
    getCrossOutFeeHandle()
  }
}

watch(
  () => amount.value,
  val => {
    if (Number(val) && isBTCs && !isTBC) {
      getBTCCrossOutFeeHandle()
    }
  }
)

// calculate fee
async function getCrossOutFeeHandle() {
  const withdrawalChain = chain.value
  if (isBTCs) {
    getBTCCrossOutFeeHandle()
  } else {
    const {
      chainId,
      assetId,
      decimals,
      originNetwork: feeChain
    } = selectedFeeAsset.value
    const { isToken, heterogeneousChainId } = heterogeneousInfo.value!
    const feeIsNVT = chainId === config.chainId && assetId === config.assetId
    fee.value = await getCrossOutFee({
      hId: heterogeneousChainId,
      useMainAsset: feeChain === withdrawalChain,
      feeDecimals: decimals,
      feeAssetKey: chainId + '-' + assetId,
      isNVT: feeIsNVT,
      isTRX: feeChain === 'TRON'
    })
  }
}

// BTCs calculate fee
async function getBTCCrossOutFeeHandle() {
  const withdrawalChain = chain.value
  const {
    chainId,
    assetId,
    decimals,
    originNetwork: feeChain
  } = selectedFeeAsset.value
  const feeIsNVT = chainId === config.chainId && assetId === config.assetId
  fee.value = await getBTCsCrossOutFee({
    amount: amount.value,
    useMainAsset: feeChain === withdrawalChain,
    feeDecimals: decimals,
    feeAssetKey: chainId + '-' + assetId,
    isNVT: feeIsNVT,
    withdrawalChain
  })
  validateAmount()
}

// NVM calculate fee
async function getNVMCrossOutFeeHandle() {
  const {
    chainId,
    assetId,
    decimals,
    originNetwork: feeChain
  } = selectedFeeAsset.value
  const { isToken, heterogeneousChainId } = heterogeneousInfo.value!
  const feeIsNVT = chainId === config.chainId && assetId === config.assetId
  fee.value = await getCrossOutFee({
    hId: heterogeneousChainId,
    useMainAsset: feeChain === 'NULS AI',
    feeDecimals: decimals,
    feeAssetKey: chainId + '-' + assetId,
    isNVT: feeIsNVT,
    isTRX: feeChain === 'TRON'
  })
}

async function changeFeeAsset(asset: AssetItem) {
  showFeeDialog.value = false
  selectedFeeAsset.value = asset
  feeSymbol.value = asset.symbol
  fee.value = ''
  await getCrossOutFeeHandle()
  validateAmount()
}

function validateAmount() {
  const { available } = selectedFeeAsset.value
  if (
    !Number(balance.value) ||
    Minus(balance.value, amount.value).toNumber() < 0 ||
    (FeeAsset_TransferAsset_IsSame.value &&
      Minus(balance.value, Plus(amount.value, fee.value)).toNumber() < 0)
  ) {
    amountErrorTip.value = t('transfer.transfer15')
  } else if (isBTCs && Minus(amount.value, 0.00000546).toNumber() < 0) {
    amountErrorTip.value = 'Minimum quantity is 0.00000546'
  } else if (Minus(available, fee.value).toNumber() < 0) {
    amountErrorTip.value = t('transfer.transfer18')
  } else {
    amountErrorTip.value = ''
  }
}

watch(
  () => amount.value,
  val => {
    if (val) {
      validateAmount()
    }
  }
)

function max() {
  if (!balance.value || !Number(balance.value)) return
  if (FeeAsset_TransferAsset_IsSame.value) {
    if (!fee.value) return
    if (Minus(balance.value, fee.value).toNumber() > 0) {
      amount.value = Minus(balance.value, fee.value).toString()
    } else {
      amount.value = balance.value
    }
  } else {
    amount.value = balance.value
  }
}

const { getWalletInfo, handleResult } = useBroadcastNerveHex()
async function sendTx() {
  if (!Number(fee.value)) {
    toastError('The Cross Out Network is in queue, please wait')
    return
  }
  loading.value = true
  try {
    const { chainId, assetId, decimals } = transferAsset.value
    const {
      chainId: feeChainId,
      assetId: feeAssetId,
      decimals: feeDecimals
    } = selectedFeeAsset.value
    const transferInfo = {
      from: nerveAddress.value,
      assetsChainId: chainId,
      assetsId: assetId,
      amount: timesDecimals(amount.value, decimals),
      fee: 0,
      withdrawalFee: timesDecimals(fee.value, feeDecimals),
      fee_asset: {
        chainId: feeChainId,
        assetId: feeAssetId
      }
    }
    console.log(transferInfo, '===transferInfo===')

    const { provider, EVMAddress, pub } = getWalletInfo()
    let targetAddress = toAddress.value
    if (
      chain.value === 'BCH' &&
      !targetAddress.startsWith(nerveswap.bch.addressPrefix)
    ) {
      targetAddress = nerveswap.bch.addressPrefix + toAddress.value
    }
    const result = await nerveswap.transfer.withdrawal({
      provider,
      from: nerveAddress.value,
      assetChainId: chainId,
      assetId: assetId,
      amount: timesDecimals(amount.value, decimals),
      feeInfo: {
        amount: timesDecimals(fee.value, feeDecimals),
        assetChainId: feeChainId,
        assetId: feeAssetId
      },
      heterogeneousAddress: targetAddress,
      heterogeneousChainId: heterogeneousInfo.value!.heterogeneousChainId,
      EVMAddress,
      pub
    })
    const amountRemark = `${toThousands(amount.value)} ${transferAsset.value.symbol}`

    handleResult(
      43,
      result,
      amountRemark,
      heterogeneousInfo.value!.heterogeneousChainId
    )
  } catch (e) {
    console.log(e, 'withdrawal-error')
    toastError(e)
  }
  loading.value = false
}
</script>
