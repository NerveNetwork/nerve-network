<template>
  <div v-loading="loading">
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
      :balance="balance"
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
import useToast, { parseErrorMsg } from '@/hooks/useToast'
import { useI18n } from 'vue-i18n'
import nerveswap from 'nerveswap-sdk'
import CustomInput from '@/components/CustomInput.vue'
import Button from '@/components/Base/Button/index.vue'
import { setAccountTxs } from '@/hooks/useBroadcastNerveHex'
import {
  superLong,
  openL1Explorer,
  Minus,
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
const { chainInfo, currentAddress, nerveAddress, addressInfo, wrongChain, chain } =
  storeToRefs(walletStore)

const { transferAsset, assetCanCross, showReConnect } = useTransfer()

const balance = ref('')
const amount = ref('')
let provider: any

onMounted(async () => {
  const p = getProvider()
  provider = p.provider
  const _balance = await provider.getBalance()
  balance.value =
    chain.value === 'BCH' ? _balance : divisionDecimals(_balance, 8)
  calFee()
})

const openAddress = () => {
  openL1Explorer(chain.value, 'address', currentAddress.value)
}

const amountErrorTip = ref('')
watch(
  () => amount.value,
  val => {
    if (val) {
      if (!balance.value || Minus(balance.value, amount.value).toNumber() < 0) {
        amountErrorTip.value = t('transfer.transfer15')
      } else {
        amountErrorTip.value = ''
      }
    }
  }
)

const fee = ref('')
async function calFee() {
  try {
    const provider = chain.value === 'FCH' ? nerveswap.fch : nerveswap.bch
    const result = await provider.calTxFee({
      from: currentAddress.value,
      nerveAddress: nerveAddress.value,
      amount: balance.value || '0.001'
    })
    console.log(result, 34)
    fee.value = divisionDecimals(result, 8)
  } catch (e) {
    // console.log(e, '--e--')
  }
}

function max() {
  console.log(fee.value, 212)
  amount.value =
    Minus(balance.value, fee.value).toNumber() > 0
      ? Minus(balance.value, fee.value).toFixed()
      : '0'
}

const disableTransfer = computed(() => {
  return !!(
    !amount.value ||
    !balance.value ||
    amountErrorTip.value ||
    wrongChain.value
  )
})

const loading = ref(false)
const sendTx = async () => {
  loading.value = true
  try {
    const heterogeneousChainId = _networkInfo[chain.value].chainId
    const heterogeneousInfo = transferAsset.value.heterogeneousList?.find(
      v => v.heterogeneousChainId === heterogeneousChainId
    ) as HeterogeneousInfo
    const provider = chain.value === 'FCH' ? nerveswap.fch : nerveswap.bch
    const hash = await provider.crossIn({
      multySignAddress: heterogeneousInfo.heterogeneousChainMultySignAddress,
      nerveAddress: nerveAddress.value,
      amount: amount.value
    })
    console.log(hash, '===hash===')
    const amountRemark = `${toThousands(amount.value)} ${transferAsset.value.symbol}`
    handleTx(hash, amountRemark)
  } catch (e) {
    console.log(e, '333')
    const { message } = parseErrorMsg(e)
    toastError(message)
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
    L1Chain: chain.value,
    L1Type: 'Cross In',
    address: currentAddress.value,
    amountRemark
  })
}
</script>
