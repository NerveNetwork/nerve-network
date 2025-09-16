<template>
  <div class="btc-cross-in" v-loading="loading">
    <!-- From -->
    <div class="mb-6">
      <div class="mb-2 text-label">From</div>
      <div class="flex h-[68px] items-center rounded-xl bg-input px-4">
        <div class="mr-6 flex items-center gap-2">
          <img :src="chainInfo.logo" alt="" class="h-7 w-7 rounded-full" />
          <span>{{ chainInfo.label }}</span>
        </div>
        <div
          class="flex cursor-pointer items-center text-base text-primary"
          @click="openAddress">
          <span class="mr-1.5">
            {{ superLong(currentAddress, 6) }}
          </span>
          <i-custom-open />
        </div>
      </div>
    </div>

    <!-- Deposited -->
    <CustomInput
      v-model:inputVal="amount"
      :label="$t('public.public11')"
      :icon="transferAsset.symbol"
      :assetList="[]"
      :balance="btcBalance"
      :show-amount="false"
      :selectedAsset="transferAsset"
      disableSelect
      @max="max" />

    <div v-if="!assetCanCross" class="mt-2 text-error">
      The current network does not support cross-chain transfers of this asset.
      Please switch networks or select another asset.
    </div>

    <div class="pt-10">
      <Button class="w-full" v-if="!assetCanCross" @click="showReConnect">
        Switch Network
      </Button>
      <Button v-else class="w-full" :disabled="disableTransfer" @click="sendTx">
        {{ amountErrorTip ? amountErrorTip : $t('transfer.transfer9') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import CustomInput from '@/components/CustomInput.vue'
import Button from '@/components/Base/Button/index.vue'
import useToast, { parseErrorMsg } from '@/hooks/useToast'
import { useI18n } from 'vue-i18n'
import nerveswap from 'nerveswap-sdk'
import { setAccountTxs } from '@/hooks/useBroadcastNerveHex'
import {
  superLong,
  openL1Explorer,
  Minus,
  isBeta,
  timesDecimals,
  divisionDecimals,
  toThousands
} from '@/utils/util'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import { HeterogeneousInfo } from '@/store/types'
import { getProvider } from '@/utils/providerUtil'
import { useWalletStore } from '@/store/wallet'
import useTransfer from '../useTransfer'

const { t } = useI18n()
const { toastSuccess, toastError } = useToast()

const walletStore = useWalletStore()
const { chainInfo, currentAddress, nerveAddress, addressInfo, wrongChain } =
  storeToRefs(walletStore)

const { transferAsset, assetCanCross, showReConnect } = useTransfer()

const btcBalance = ref('')
const amount = ref('')
let provider: any

onMounted(async () => {
  const p = getProvider()
  provider = p.provider
  const balance = await provider.getBalance()
  btcBalance.value = divisionDecimals(balance.confirmed, 8)
  calFee()
})

const openAddress = () => {
  openL1Explorer('BTC', 'address', currentAddress.value)
}

const amountErrorTip = ref('')
watch(
  () => amount.value,
  val => {
    if (val) {
      if (
        !btcBalance.value ||
        Minus(btcBalance.value, amount.value).toNumber() < 0
      ) {
        amountErrorTip.value = t('transfer.transfer15')
      } else if (Minus(amount.value, 0.0001).toNumber() < 0) {
        amountErrorTip.value = t('transfer.transfer38')
      } else {
        amountErrorTip.value = ''
      }
    }
  }
)

const fee = ref('')
async function calFee() {
  try {
    const heterogeneousChainId = _networkInfo.BTC.chainId
    const heterogeneousInfo = transferAsset.value.heterogeneousList?.find(
      v => v.heterogeneousChainId === heterogeneousChainId
    ) as HeterogeneousInfo
    const result = await nerveswap.btc.calTxFee({
      from: currentAddress.value,
      multySignAddress: heterogeneousInfo.heterogeneousChainMultySignAddress,
      nerveAddress: nerveAddress.value,
      amount: '10000',
      isMainnet: !isBeta
    })
    fee.value = divisionDecimals(result, 8)
  } catch (e) {
    //
  }
}

function max() {
  amount.value =
    Minus(btcBalance.value, fee.value).toNumber() > 0
      ? Minus(btcBalance.value, fee.value).toFixed()
      : '0'
}

const disableTransfer = computed(() => {
  return !!(
    !amount.value ||
    !btcBalance.value ||
    amountErrorTip.value ||
    wrongChain.value
  )
})

const loading = ref(false)
const sendTx = async () => {
  loading.value = true
  try {
    const heterogeneousChainId = _networkInfo.BTC.chainId
    const heterogeneousInfo = transferAsset.value.heterogeneousList?.find(
      v => v.heterogeneousChainId === heterogeneousChainId
    ) as HeterogeneousInfo
    const hash = await nerveswap.btc.crossIn({
      provider,
      from: currentAddress.value,
      multySignAddress: heterogeneousInfo.heterogeneousChainMultySignAddress,
      nerveAddress: nerveAddress.value,
      amount: timesDecimals(amount.value, 8),
      pub: addressInfo.value.pub,
      isMainnet: !isBeta
    })
    const amountRemark = `${toThousands(amount.value)} ${transferAsset.value.symbol}`
    handleTx(hash, amountRemark)
  } catch (e) {
    console.log(e, '333')
    const { message } = parseErrorMsg(e)
    const _message = message.includes('dust') ? 'Not enough utxo' : message
    toastError(_message)
  }
  loading.value = false
}

function handleTx(hash: string, amountRemark: string) {
  amount.value = ''
  toastSuccess(t('transfer.transfer14'))
  setAccountTxs(addressInfo.value.pub, {
    hash,
    time: new Date().getTime(),
    status: 0,
    L1Chain: 'BTC',
    L1Type: 'Cross In',
    address: currentAddress.value,
    amountRemark
  })
}
</script>
