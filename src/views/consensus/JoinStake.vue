<template>
  <Modal
    container-class="w-[460px]"
    :title="$t('staking.staking1')"
    v-model="visible"
    :show-close="false"
    show-back
    @back="visible = false"
    @closed="resetState">
    <div v-loading="loading">
      <el-form
        ref="joinFormRef"
        label-position="top"
        :model="joinStakingModel"
        :rules="joinStakingRule">
        <el-form-item :label="$t('staking.staking4')" prop="currency">
          <Select
            v-model="joinStakingModel.currency"
            :options="canStakingList"
            @change="changeCurrency"
            :placeholder="$t('staking.staking56')" />
        </el-form-item>
        <el-form-item :label="$t('staking.staking17')" prop="deadline">
          <Select
            v-model="joinStakingModel.deadline"
            :options="deadlineList"
            @change="projectedRevenue" />
        </el-form-item>
        <el-form-item
          prop="amount"
          class="append-input">
          <template #label>
            <div class="flex items-center justify-between">
              <span>{{ $t('staking.staking16') }}</span>
              <BalanceItem :balance="currentCurrency.available" />
            </div>
          </template>
          <Input v-model="joinStakingModel.amount" class="bg-input">
            <template #append>
              <div class="flex items-center gap-4">
                <div class="h-4 w-px bg-label"></div>
                <div
                  class="btn cursor-pointer text-primary"
                  @click="joinStakingModel.amount = currentCurrency.available">
                  Max
                </div>
              </div>
            </template>
          </Input>
        </el-form-item>
        <el-form-item :label="$t('staking.staking29')" class="revenue-item">
          <div>
            <span>{{ revenue }} NVT</span>
            <div
              class="leading-[18px] text-label"
              v-show="joinStakingModel.deadline === 0">
              {{ $t('staking.staking51') }}
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div class="pt-5">
        <Button class="w-full" @click="joinStaking">
          {{ $t('public.public9') }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, reactive, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import {
  Division,
  fixNumber,
  Minus,
  Times,
  timesDecimals,
  toThousands
} from '@/utils/util'
import { ElForm } from 'element-plus'
import Modal from '@/components/Base/Modal/index.vue'
import Select from '@/components/Base/Select/index.vue'
import Input from '@/components/Base/Input/index.vue'
import Button from '@/components/Base/Button/index.vue'
import BalanceItem from '@/components/BalanceItem.vue'
import { useWalletStore } from '@/store/wallet'
import useToast from '@/hooks/useToast'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex'
import { CanStakingListItem } from './types'
import nerveswap from 'nerveswap-sdk'

const props = defineProps<{
  address?: string
  show: boolean
  canStakingList: CanStakingListItem[]
}>()

const emit = defineEmits(['update:show', 'refresh'])

const { t } = useI18n()
const { toastError } = useToast()
const { getWalletInfo, handleResult } = useBroadcastNerveHex()
const walletStore = useWalletStore()
const { assetsList } = storeToRefs(walletStore)

const visible = computed({
  get() {
    return props.show
  },
  set(val) {
    emit('update:show', val)
  }
})

const validateJoinCurrency = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error(t('staking.staking26')))
  } else {
    if (joinStakingModel.amount !== '') {
      joinFormRef.value?.validateField('amount', () => {})
      projectedRevenue()
    }
    callback()
  }
}
const validateJoinAmount = (rule: any, value: any, callback: any) => {
  const baseNumber = 1000
  const currencyNumber = Division(baseNumber, nvtPrice).toFixed()
  const maxAvailable = currentCurrency.value.available
  const decimals = currentCurrency.value.decimals //8;
  const reg = new RegExp(
    '^([1-9][\\d]{0,20}|0)(\\.[\\d]{0,' + decimals + '})?$'
  )
  projectedRevenue()
  if (value === '') {
    callback(new Error(t('staking.staking27')))
  } else if (!reg.exec(value)) {
    callback(new Error(t('transfer.transfer17') + ': ' + decimals))
    // @ts-ignore
  } else if (Minus(value, currencyNumber).toFixed() < 0) {
    callback(
      new Error(
        t('staking.staking49') + currencyNumber + currentCurrency.value.symbol
      )
    )
  } else if (!Number(currentCurrency.value.available)) {
    callback(new Error(t('staking.staking55')))
    // @ts-ignore
  } else if (Minus(value, maxAvailable).toFixed() > 0) {
    callback(
      new Error(
        t('staking.staking50') + maxAvailable + currentCurrency.value.symbol
      )
    )
  } else {
    callback()
  }
}
const validateJoinDeadline = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error(t('staking.staking28')))
  } else {
    callback()
  }
}
const joinFormRef = ref<InstanceType<typeof ElForm>>()
const joinStakingModel = reactive({
  currency: '',
  amount: '',
  deadline: 0
})
const joinStakingRule = {
  currency: [{ validator: validateJoinCurrency, trigger: ['blur', 'change'] }],
  amount: [{ validator: validateJoinAmount, trigger: ['blur', 'change'] }],
  deadline: [{ validator: validateJoinDeadline, trigger: ['blur'] }]
}

const defaultCurrency = assetsList.value.filter(v => v.symbol === 'NVT')[0]

// 当前选择的资产
// const currentCurrency = ref(defaultCurrency);

const currentCurrency = computed(() => {
  if (defaultCurrency || joinStakingModel.currency) {
    const assetKey = joinStakingModel.currency || defaultCurrency.assetKey
    return assetsList.value.filter(v => v.assetKey === assetKey)[0]
  } else {
    return { available: '0', symbol: '', decimals: 8, chainId: '', assetId: '' }
  }
})

if (defaultCurrency) {
  joinStakingModel.currency = defaultCurrency.assetKey
  joinStakingModel.deadline = 0
  changeCurrency()
}

const deadlineList = computed(() => {
  return [
    { label: t('staking.staking5'), value: 0 },
    { label: t('staking.staking6'), value: 1 },
    { label: t('staking.staking7'), value: 2 },
    { label: t('staking.staking8'), value: 3 },
    { label: t('staking.staking9'), value: 4 },
    { label: t('staking.staking10'), value: 5 },
    { label: t('staking.staking11'), value: 6 },
    { label: t('staking.staking12'), value: 7 }
  ]
})

// 是否是稳定币资产
const isStableCurrency = computed(() => {
  const currency = joinStakingModel.currency
  return !!props.canStakingList.filter(v => {
    return v.assetKey === currency && !v.canBePeriodically
  }).length
})

// 选择资产的收益率信息
const rateInfo = computed<CanStakingListItem | null>(() => {
  const symbol = currentCurrency.value.symbol
  if (symbol && props.canStakingList.length) {
    return props.canStakingList.find(v => v.symbol === symbol) || null
  }
  return null
})

let nvtPrice = 1
watch(
  () => rateInfo.value,
  val => {
    if (val && val.rate) {
      nvtPrice = val.nvtPrice
      if (!val.canBePeriodically) {
        joinStakingModel.deadline = 0
      }
    }
  }
)

//选择币种下拉
function changeCurrency() {
  nextTick(() => {
    joinFormRef.value?.validateField('amount')
    projectedRevenue()
  }
)
}

// 预估收益值
const revenue = ref('0')

// 估算收益
function projectedRevenue() {
  let rateValue = ''
  const rate = rateInfo.value?.rate
  if (!rate) {
    return 0
  }
  if (joinStakingModel.deadline === 0) {
    //年化/365*30
    let everyDay = Division(rate.NONE, 365)
    rateValue = Times(everyDay, 30).toFixed()
  } else if (joinStakingModel.deadline === 1) {
    rateValue = rate.THREE_MONTHS
  } else if (joinStakingModel.deadline === 2) {
    rateValue = rate.HALF_YEAR
  } else if (joinStakingModel.deadline === 3) {
    rateValue = rate.ONE_YEAR
  } else if (joinStakingModel.deadline === 4) {
    rateValue = rate.TOW_YEARS
  } else if (joinStakingModel.deadline === 5) {
    rateValue = rate.THREE_YEARS
  } else if (joinStakingModel.deadline === 6) {
    rateValue = rate.FIVE_YEARS
  } else if (joinStakingModel.deadline === 7) {
    rateValue = rate.TEN_YEARS
  } else {
    rateValue = rate.TEST
  }

  if (joinStakingModel.deadline.toString() && joinStakingModel.amount) {
    const rewardNumber = Times(rateValue, joinStakingModel.amount)
    // console.log(rateInfo.value, 111, rewardNumber, rateValue);
    // console.log(Times(rewardNumber, rateInfo.value.nvtPrice).toFixed(), 123465);
    const nvtPrice = rateInfo.value?.nvtPrice as number
    revenue.value = fixNumber(Times(rewardNumber, nvtPrice).toFixed(), 3)
  } else {
    revenue.value = '0'
  }
}

const loading = ref(false)

function joinStaking() {
  // console.log(currentCurrency.value, 465)
  joinFormRef.value?.validate(async valid => {
    if (valid) {
      loading.value = true
      try {
        const { chainId, assetId, decimals, symbol } = currentCurrency.value
        const amount = timesDecimals(joinStakingModel.amount, decimals),
          depositType = joinStakingModel.deadline === 0 ? 0 : 1,
          timeType = joinStakingModel.deadline
            ? joinStakingModel.deadline - 1
            : 0
        const transferInfo = {
          from: props.address,
          assetsChainId: chainId,
          assetsId: assetId,
          amount: amount,
          fee: 0
        }
        const txData = {
          address: props.address,
          deposit: amount,
          assetsChainId: chainId,
          assetsId: assetId,
          depositType: depositType,
          timeType: timeType
        }
        const { provider, EVMAddress, pub } = getWalletInfo()
        const result = await nerveswap.staking.joinStaking({
          provider,
          from: props.address!,
          assetChainId: chainId as number,
          assetId: assetId as number,
          amount: amount,
          depositType: depositType,
          timeType: timeType,
          EVMAddress,
          pub
        })
        const amountRemark = `${toThousands(joinStakingModel.amount)} ${symbol}`
        handleResult(5, result, amountRemark)
        if (result && result.hash) {
          emit('refresh')
          visible.value = false
        }
        /* const result: any = await handleTxInfo(transferInfo, 5, txData);
        if (result && result.hash) {
          emit('refresh');
          visible.value = false;
        } */
      } catch (e) {
        console.log(e, 'join-error')
        toastError(e)
      }
      loading.value = false
    }
  })
}
function resetState() {
  loading.value = false
  joinFormRef.value?.resetFields()
}
</script>
