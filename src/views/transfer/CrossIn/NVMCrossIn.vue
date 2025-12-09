<template>
  <div class="cross-in" v-loading="loading">
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
          @click="openUrl(currentAddress)">
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
      :assetList="crossList"
      :balance="balance"
      :show-amount="false"
      :selectedAsset="transferAsset"
      @selectAsset="changeAsset"
      @max="max" />

    <div v-if="!assetCanCross" class="mt-2 text-error">
      The current network does not support cross-chain transfers of this asset.
      Please switch networks or select another asset.
    </div>

    <div class="pt-10">
      <Button class="w-full" v-if="!assetCanCross" @click="showReConnect">
        Switch Network
      </Button>
      <Button
        class="w-full"
        v-else-if="!needAuth || authLoading"
        :disabled="disableTransfer"
        @click="handleSendTx">
        {{
          amountErrorTip ? $t('transfer.transfer15') : $t('transfer.transfer9')
        }}
      </Button>
      <Button class="w-full" v-else @click="handleApprove">
        {{ $t('transfer.transfer13') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import useToast from '@/hooks/useToast'
import CustomInput from '@/components/CustomInput.vue'
import Button from '@/components/Base/Button/index.vue'
import { superLong, Minus, toThousands, openExplorer, timesDecimals } from '@/utils/util'
import { useI18n } from 'vue-i18n'
import useNVMCrossIn from '../hooks/useNVMCrossIn'

import { HeterogeneousInfo } from '@/store/types'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import { setAccountTxs } from '@/hooks/useBroadcastNerveHex'
import { useWalletStore } from '@/store/wallet'
import useTransfer from '../useTransfer'

const walletStore = useWalletStore()
const {
  chainInfo,
  currentAddress,
  chain,
  nerveAddress,
  addressInfo,
  wrongChain
} = storeToRefs(walletStore)

const { transferAsset, assetCanCross, crossList, changeAsset, showReConnect } =
  useTransfer()


const { t } = useI18n()
const { toastSuccess, toastError } = useToast()

const loading = ref(false)
const amount = ref('')
const {
  balance,
  getBalance,
  fee,
  getFee,
  needAuth,
  authLoading,
  updateAuthState,
  getNRC20Allowance,
  approveNRC20,
  sendTx
} = useNVMCrossIn(chain)

const amountErrorTip = ref('')
let checkAuthTimer: number
watch(
  () => amount.value,
  val => {
    if (checkAuthTimer) {
      clearTimeout(checkAuthTimer)
    }
    if (val) {
      if (!balance.value || Minus(balance.value, amount.value).toNumber() < 0) {
        amountErrorTip.value = t('transfer.transfer15')
      } else {
        amountErrorTip.value = ''

        checkAuthTimer = window.setTimeout(() => {
          startCheckAuth()
        }, 500)
      }
    }
  }
)

const disableTransfer = computed(() => {
  return !!(
    !fee.value ||
    !amount.value ||
    !balance.value ||
    amountErrorTip.value ||
    authLoading.value ||
    wrongChain.value
  )
})

let timer: number
let heterogeneousInfo: HeterogeneousInfo
watch(
  () => transferAsset.value,
  (val, old) => {
    if (val.assetKey && val.assetKey !== old?.assetKey) {
      selectAsset()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

async function selectAsset() {
  if (timer) clearInterval(timer)
  const heterogeneousList = transferAsset.value.heterogeneousList || []
  heterogeneousInfo = heterogeneousList.find(
    v => v.heterogeneousChainId === _networkInfo[chain.value].chainId
  ) as HeterogeneousInfo

  updateAuthState(heterogeneousInfo?.isToken ? true : false, true)

  if (heterogeneousInfo) {
    await checkAsset()
    timer = window.setInterval(() => {
      checkAsset()
    }, 10000)
  }
}

async function checkAsset() {
  if (!heterogeneousInfo) {
    return
  }
  await getFee()
  getBalance(
    heterogeneousInfo,
    currentAddress.value,
    transferAsset.value.decimals
  )
}

function startCheckAuth() {
  const asset = transferAsset.value
  if (!asset.assetKey) {
    return
  }

  const heterogeneousList = asset.heterogeneousList || []
  const heterogeneousChainId = _networkInfo[chain.value]?.chainId
  if (!heterogeneousChainId || !currentAddress.value) return
  heterogeneousInfo = heterogeneousList.find(
    v => v.heterogeneousChainId === heterogeneousChainId
  ) as HeterogeneousInfo

  updateAuthState(
    heterogeneousInfo?.isToken ? true : false,
    heterogeneousInfo?.isToken
  )
  if (heterogeneousInfo.isToken) {
    getNRC20Allowance(
      heterogeneousInfo,
      currentAddress.value,
      amount.value,
      asset.decimals
    )
  }
}


function max() {
  if (!balance.value || !Number(balance.value)) {
    amount.value = '0'
    return
  }
  if (heterogeneousInfo?.isToken) {
    amount.value = balance.value
  } else {
    if (!fee.value) return
    amount.value = Minus(balance.value, fee.value).toString()
  }
}

async function handleApprove() {
  loading.value = true
  try {
    const _amount = timesDecimals(amount.value, transferAsset.value.decimals)
    const res = await approveNRC20(heterogeneousInfo, currentAddress.value, _amount)
    handleMsg(res, 'Approve', '')
  } catch (e) {
    toastError(e)
  }
  loading.value = false
}


async function handleSendTx() {
  loading.value = true
  try {
    const res = await sendTx(
      heterogeneousInfo,
      currentAddress.value,
      nerveAddress.value,
      amount.value,
      transferAsset.value.decimals
    )
    const amountRemark = `${toThousands(amount.value)} ${transferAsset.value.symbol}`
    handleMsg(res, 'Cross In', amountRemark)
  } catch (e) {
    console.log(e, 'crossin-transfer-error')
    toastError(e)
  }
  loading.value = false
}
function handleMsg(data: any, type: string, amountRemark: string) {
  if (data.hash) {
    if (type === 'Cross In') {
      amount.value = ''
    }
    toastSuccess(t('transfer.transfer14'))
    setAccountTxs(addressInfo.value.pub, {
      hash: data.hash,
      time: new Date().getTime(),
      status: 0,
      L1Chain: chain.value,
      L1Type: type,
      amountRemark,
      isNVM: true
    })
  } else {
    toastError(data)
  }
}
function openUrl(address: string) {
  openExplorer('address', address, true, chain.value)
}
</script>
