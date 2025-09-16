<template>
  <Modal container-class="w-[480px]" title="Additional Fee" v-model="visible" @closed="onAddFeeModalClosed">
    <template v-if="isLoading">
      <div class="mb-3 flex items-center justify-between">
        <span class="text-label">Paid</span>
        <Skeleton class="h-6 w-20" />
      </div>
      <div class="mb-1 text-label">Append</div>
      <Skeleton titleClass="h-10" />
    </template>
    <template v-else>
      <div class="mb-3 flex items-center justify-between">
        <span class="text-label">Paid</span>
        <span>{{
          txInfo?.feeInfo?.symbol
            ? txInfo?.feeInfo?.value + txInfo?.feeInfo?.symbol
            : '--'
        }}</span>
      </div>
      <div class="mb-1 text-label">Append</div>
      <Input
        placeholder="Enter append amount"
        input-class="bg-[#08090B]"
        :decimals="txInfo.decimals"
        v-model="addFeeAmount" />
    </template>

    <div class="mt-7 flex gap-4">
      <Button class="flex-1" variant="outline" @click="closeAddFeeModal">
        Cancel
      </Button>
      <Button
        class="flex-1"
        @click="confirm"
        :loading="addFeeLoading"
        :disabled="disabledTx">
        Confirm
      </Button>
    </div>
  </Modal>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import nerveswap from 'nerveswap-sdk'
import Input from '@/components/Base/Input/index.vue'
import { getTx } from '@/service/api'
import { useWalletStore } from '@/store/wallet'
import useToast from '@/hooks/useToast'
import useCrossOutFee from '@/views/transfer/hooks/useCrossOutFee'
import useBTCsCrossOut from '@/views/transfer/hooks/useBTCsCrossOut'
import { TxInfo } from '@/store/types'
import { divisionDecimals, timesDecimals, toThousands } from '@/utils/util'
import { _networkInfo } from '@/utils/heterogeneousChainConfig'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex'

const props = defineProps<{
  modelValue: boolean
  tx: TxInfo
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', status: boolean): void
  (e: 'confirm'): void
}>()

const { t } = useI18n()
const walletStore = useWalletStore()
const { assetsList, nerveAddress } = storeToRefs(walletStore)
const { toastSuccess, toastError } = useToast()
const { getAddFeeAmount } = useCrossOutFee()

const { btcFeePaiedEnough, canAdd, getBTCsAddFeeAmount } = useBTCsCrossOut()

const { getWalletInfo, handleResult } = useBroadcastNerveHex()

const visible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

const isLoading = ref(true)
const addFeeAmount = ref('')
const addFeeLoading = ref(false)
const txInfo: any = ref({})
let feeCoin: any = {}

const disabledTx = computed(() => {
  return (
    !props.tx.hash ||
    !props.tx.hId ||
    !addFeeAmount.value ||
    !canAdd.value ||
    isLoading.value
  )
})

const getTxInfo = async () => {
  const { hash, hId } = props.tx
  const tx = await getTx(hash)
  const txData = tx?.txData
  if (txData) {
    feeCoin = assetsList.value.find(
      asset =>
        asset.chainId === txData.feeCoin.chainId &&
        asset.assetId === txData.feeCoin.assetId
    )!

    const txAsset = assetsList.value.find(
      asset =>
        asset.chainId === txData.assetChainId &&
        asset.assetId === txData.assetId
    )!
    txInfo.value = {
      hash,
      hId,
      decimals: txAsset.decimals,
      outerTxHash: txData.outerTxHash,
      feeInfo: {
        value: divisionDecimals(txData.fee, feeCoin.decimals),
        symbol: feeCoin.symbol,
        decimals: feeCoin.decimals,
        assetKey: feeCoin.assetKey
      }
    }
  }
}

async function checkBTCWithdrawalStatus() {
  const { feeInfo, hash, hId, outerTxHash } = txInfo.value

  const isBTCs = [201, 202, 203].includes(hId)
  if (isBTCs) {
    addFeeAmount.value = await getBTCsAddFeeAmount({
      feeInfo,
      hash,
      hId,
      outerTxHash
    })
  } else {
    const targetChainInfo = Object.values(_networkInfo).find(
      v => v.chainId === hId
    )
    addFeeAmount.value = await getAddFeeAmount(
      {
        hId,
        feeDecimals: feeInfo.decimals,
        feeAssetKey: feeInfo.assetKey,
        useMainAsset: feeInfo.assetKey === targetChainInfo!.assetKey,
        isNVT: feeInfo.symbol === 'NVT',
        isTRX: feeInfo.symbol === 'TRX'
      },
      feeInfo.value
    )
  }
  isLoading.value = false
}

async function confirm() {
  if (!addFeeAmount.value) {
    toastError(t('transfer.transfer34'))
  } else {
    if (txInfo.value.hId === 201) {
      await additionFee(addFeeAmount.value, btcFeePaiedEnough.value)
    } else {
      await additionFee(addFeeAmount.value)
    }
  }
}

async function additionFee(amount: string, BTCSpeedUp?: boolean) {
  addFeeLoading.value = true
  try {
    const { provider, EVMAddress, pub } = getWalletInfo()
    const result = await nerveswap.transfer.addFee({
      provider,
      from: nerveAddress.value,
      amount: timesDecimals(amount, feeCoin.decimals),
      assetChainId: feeCoin.chainId,
      assetId: feeCoin.assetId,
      txHash: txInfo.value.hash,
      EVMAddress,
      pub,
      BTCSpeedUp
    })

    if (result?.hash) {
      const amountRemark = `${toThousands(amount)} ${feeCoin.symbol}`
      handleResult(56, result, amountRemark)
      toastSuccess('Success')
      emit('confirm')
    } else {
      toastError(result?.error)
    }
  } catch (e) {
    console.log(e, 'addition-fee-error')
    toastError(e)
  }
  addFeeLoading.value = false
}

const closeAddFeeModal = () => {
  visible.value = false
}
const onAddFeeModalClosed = () => {
  addFeeAmount.value = ''
  addFeeLoading.value = false
  isLoading.value = true
  feeCoin = {}
  txInfo.value = {}
}

watch(
  () => props.tx,
  val => {
    if (val?.hash) {
      getTxInfo().then(checkBTCWithdrawalStatus)
    }
  }
)
</script>
