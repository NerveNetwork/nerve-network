<template>
  <div class="common-transfer" v-loading="loading">
    <!-- From -->
    <div class="mb-6">
      <div class="mb-2 text-label">Address</div>
      <Input
        class="bg-input"
        v-model.trim="toAddress"
        :placeholder="$t('transfer.transfer6')" />
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
        :assetList="assetsList"
        :balance="balance"
        :selectedAsset="transferAsset"
        @selectAsset="changeAsset"
        @max="max" />
      <div class="mt-2 text-sm" v-if="showFeeTip">
        {{ $t('public.public15') }}0.01 NVT + 100 NAI
      </div>
    </div>

    <div class="pt-10">
      <Button v-if="disableToNULS" class="w-full" disabled>
        {{ $t('transfer.transfer34') }}
      </Button>
      <Button v-else class="w-full" :disabled="disableTransfer" @click="sendTx">
        {{ amountErrorTip || $t('transfer.transfer10') }}
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import useToast from '@/hooks/useToast'
import Input from '@/components/Base/Input/index.vue'
import CustomInput from '@/components/CustomInput.vue'
import Button from '@/components/Base/Button/index.vue'
import { Minus, timesDecimals, Plus, isBeta, toThousands } from '@/utils/util'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex'
import nerve from 'nerve-sdk-js'
import config from '@/config'
import nerveswap from 'nerveswap-sdk'
import { useWalletStore } from '@/store/wallet'
import useTransfer from './useTransfer'

const nvtFee = 0.01
const nulsFee = 100

const { t } = useI18n()
const { toastError } = useToast()

const walletStore = useWalletStore()
const { nerveAddress } = storeToRefs(walletStore)

const { transferAsset, changeAsset, assetsList } = useTransfer()

const loading = ref(false)
const amount = ref('')

const balance = computed(() => {
  const asset = assetsList.value.find(asset => {
    return asset.assetKey === transferAsset.value.assetKey
  })
  return asset ? asset.available : ''
})
const nvtBalance = computed(() => {
  const asset = assetsList.value.find(asset => {
    return asset.chainId === config.chainId && asset.assetId === config.assetId
  })
  return asset ? asset.available : ''
})
const nulsBalance = computed(() => {
  const asset = assetsList.value.find(asset => {
    return (
      asset.chainId === config.NULSConfig.chainId &&
      asset.assetId === config.NULSConfig.assetId
    )
  })
  return asset ? asset.available : ''
})

const amountErrorTip = computed(() => {
  if (
    !Number(balance.value) ||
    Minus(balance.value, amount.value).toNumber() < 0
  ) {
    return t('transfer.transfer15')
  }
  let tip = ''
  if (type.value === 10) {
    if (isTransferNVT.value) {
      // 转账资产是nvt
      const amountWithFee = Plus(amount.value, nvtFee).toFixed()
      if (
        Minus(balance.value, amountWithFee).toNumber() < 0 ||
        Minus(nvtBalance.value, nvtFee).toNumber() < 0
      ) {
        tip = t('transfer.transfer25')
      }
    } else if (isTransferNULS.value) {
      // 转账资产是nuls
      const amountWithFee = Plus(amount.value, nulsFee).toFixed()
      if (
        Minus(balance.value, amountWithFee).toNumber() < 0 ||
        Minus(nulsBalance.value, nulsFee).toNumber() < 0
      ) {
        tip = t('transfer.transfer25')
      }
    } else {
      if (
        Minus(nulsBalance.value, nulsFee).toNumber() < 0 ||
        Minus(nvtBalance.value, nvtFee).toNumber() < 0
      ) {
        tip = t('transfer.transfer25')
      }
    }
  }
  return tip
})

const isTransferNVT = computed(() => {
  const { chainId, assetId } = transferAsset.value
  return chainId === config.chainId && assetId === config.assetId
})
const isTransferNULS = computed(() => {
  const { chainId, assetId } = transferAsset.value
  return (
    chainId === config.NULSConfig.chainId &&
    assetId === config.NULSConfig.assetId
  )
})

const disableTransfer = computed(() => {
  return !!(
    !toAddress.value ||
    !amount.value ||
    !balance.value ||
    addressError.value ||
    amountErrorTip.value
  )
})

const toAddress = ref('')
const addressError = ref('')
const type = ref(2) // 交易类型 2-普通转账 10-跨链到nuls
watch(
  () => toAddress.value,
  val => {
    if (val) {
      let res: any
      try {
        res = nerve.verifyAddress(val)
        console.log(res, 13465)
        if (res.right) {
          const nulsChainId = isBeta ? 2 : 1
          const isToNULS = res.chainId === nulsChainId
          if (res.chainId === config.chainId) {
            type.value === 2
          } else if (isToNULS) {
            type.value = 10
          } else {
            type.value = 2
            res.right = false
          }
        } else {
          type.value = 2
        }
      } catch (e) {
        type.value = 2
      }
      if (!res || !res.right) {
        addressError.value = t('transfer.transfer24')
      } else if (res.type === 2) {
        // type 1:主网地址 2：合约地址 3:多签地址
        addressError.value = t('transfer.transfer26')
      } else {
        addressError.value = ''
      }
    }
  }
)

const showFeeTip = computed(() => {
  return toAddress.value && type.value === 10
})

// 资产无法跨链到NULS
const disableToNULS = computed(() => {
  return showFeeTip.value && !transferAsset.value.canNuls
})

function max() {
  if (type.value === 10 && (isTransferNVT.value || isTransferNULS.value)) {
    const fee = isTransferNULS.value ? nulsFee : nvtFee
    amount.value = Minus(balance.value, fee).toFixed()
  } else {
    amount.value = balance.value
  }
}

const { getWalletInfo, handleResult } = useBroadcastNerveHex()
async function sendTx() {
  try {
    loading.value = true
    const { chainId, assetId, decimals } = transferAsset.value
    const { provider, EVMAddress, pub } = getWalletInfo()
    const result: any = await nerveswap.transfer.transfer({
      provider,
      from: nerveAddress.value,
      to: toAddress.value,
      assetChainId: chainId,
      assetId: assetId,
      amount: timesDecimals(amount.value, decimals),
      type: type.value,
      EVMAddress,
      pub
    })
    const amountRemark = `${toThousands(amount.value)} ${transferAsset.value.symbol}`
    handleResult(type.value, result, amountRemark)
  } catch (e) {
    console.log(e, 'common-transfer-error')
    toastError(e)
  }
  loading.value = false
}
</script>
