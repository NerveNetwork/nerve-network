<template>
  <div
    class="mint-deploy-page w1200 w-full max-w-[500px] rounded-xl bg-card p-6">
    <BackTitle :title="$t('mint.mint1')" />
    <el-form label-position="top" :model="model" :rules="rules" ref="form">
      <el-form-item prop="tick">
        <template #label>
          <div class="flex items-center justify-between">
            <Tip :label="$t('mint.mint2')" :tip="$t('mint.mint4')" />
            <BalanceItem :balance="mintAsset?.available" />
          </div>
        </template>
        <Select
          v-model="model.tick"
          :options="_assetsList"
          filterable
          :placeholder="$t('mint.mint3')"
          dropdown-class="max-h-[300px]" />
        <!-- <el-select
          v-model="model.tick"
          filterable
          :placeholder="$t('mint.mint3')"
          popper-class="asset-select"
        >
          <el-option
            :label="item.symbol + '(' + item.assetKey + ')'"
            :value="item.assetKey"
            v-for="item in assetsList"
            :key="item.assetKey"
          ></el-option>
        </el-select> -->
      </el-form-item>

      <el-form-item prop="fee">
        <template #label>
          <Tip :label="$t('mint.mint5')" :tip="$t('mint.mint7')" />
        </template>
        <div class="flex w-full items-center">
          <Input
            class="mr-2.5 flex-1 bg-input"
            :value="model.fee"
            @input="changeFee"
            :placeholder="$t('mint.mint6')" />
          <Select
            v-model="model.feetick"
            :options="_assetsList"
            filterable
            :placeholder="$t('mint.mint72')"
            class="w-40"
            dropdown-class="max-h-[300px]"
            @change="feeAssetChange" />
        </div>
        <!-- <div class="flex-center" style="width: 100%">
          <el-input
            class="fee-input"
            :model-value="model.fee"
            @input="changeFee"
            :placeholder="$t('mint.mint6')"
          ></el-input>
          <el-select
            v-model="model.feetick"
            filterable
            :placeholder="$t('mint.mint72')"
            popper-class="asset-select"
            @change="feeAssetChange"
          >
            <el-option
              :label="item.symbol + '(' + item.assetKey + ')'"
              :value="item.assetKey"
              v-for="item in assetsList"
              :key="item.assetKey"
            ></el-option>
          </el-select>
        </div> -->
      </el-form-item>
      <el-form-item prop="addr">
        <template #label>
          <Tip :label="$t('mint.mint8')" :tip="$t('mint.mint9')" />
        </template>
        <!-- <el-input
          v-model="model.addr"
          :placeholder="$t('mint.mint9')"
        ></el-input> -->
        <Input
          class="bg-input"
          v-model="model.addr"
          :placeholder="$t('mint.mint9')" />
      </el-form-item>
      <el-form-item prop="lim">
        <template #label>
          <Tip :label="$t('mint.mint10')" :tip="$t('mint.mint12')" />
        </template>
        <!-- <el-input
          :model-value="model.lim"
          @input="changeSingleMintAmount"
          :placeholder="$t('mint.mint11')"
        ></el-input> -->
        <Input
          class="bg-input"
          :value="model.lim"
          @input="changeSingleMintAmount"
          :placeholder="$t('mint.mint11')" />
      </el-form-item>
      <el-form-item prop="count">
        <template #label>
          <Tip :label="$t('mint.mint13')" :tip="$t('mint.mint15')" />
        </template>
        <!-- <el-input
          :model-value="model.count"
          @input="changeMintLimits"
          :placeholder="$t('mint.mint14')"
        ></el-input> -->
        <Input
          class="bg-input"
          :value="model.count"
          @input="changeMintLimits"
          :placeholder="$t('mint.mint14')" />
      </el-form-item>
      <el-form-item prop="max">
        <template #label>
          <Tip :label="$t('mint.mint16')" :tip="$t('mint.mint18')" />
        </template>
        <!-- <el-input
          :model-value="model.max"
          @input="changeHardTop"
          :placeholder="$t('mint.mint17')"
        ></el-input> -->
        <Input
          class="bg-input"
          :value="model.max"
          @input="changeHardTop"
          :placeholder="$t('mint.mint17')" />
      </el-form-item>
      <el-form-item prop="start">
        <template #label>
          <Tip :label="$t('mint.mint19')" :tip="$t('mint.mint21')" />
        </template>
        <el-date-picker
          popper-class="mint-time-picker"
          :placeholder="$t('mint.mint20')"
          v-model="model.start"
          type="datetime"
          :disabledDate="disableTime"></el-date-picker>
      </el-form-item>
      <el-form-item prop="unlock">
        <template #label>
          <Tip :label="$t('mint.mint22')" :tip="$t('mint.mint24')" />
        </template>
        <el-date-picker
          popper-class="mint-time-picker"
          :placeholder="$t('mint.mint3')"
          v-model="model.unlock"
          type="datetime"
          :disabledDate="disableTime"></el-date-picker>
      </el-form-item>
      <div class="flex justify-end">
        <!-- <el-switch
          v-model="advanced"
          :active-text="$t('mint.mint36')"
          :width="35"
        ></el-switch> -->
        <Switch v-model="advanced" :text="$t('mint.mint36')" />
      </div>
      <div v-show="advanced">
        <el-form-item prop="ratio">
          <template #label>
            <Tip :label="$t('mint.mint25')" :tip="$t('mint.mint27')" />
          </template>
          <!-- <el-input
            :model-value="model.ratio"
            @input="changeLPRatio"
            :placeholder="$t('mint.mint26')"
            class="ratio-input"
          >
            <template #append>%</template>
          </el-input> -->
          <Input
            class="bg-input"
            :value="model.ratio"
            @input="changeLPRatio"
            :placeholder="$t('mint.mint26')">
            <template #append>
              <div class="flex items-center">
                <div class="mr-2 h-3 w-px bg-[#494E62]"></div>
                <div>%</div>
              </div>
            </template>
          </Input>
        </el-form-item>
        <el-form-item prop="days">
          <template #label>
            <Tip :label="$t('mint.mint28')" :tip="$t('mint.mint30')" />
          </template>
          <!-- <el-input
            :model-value="model.days"
            @input="changeLockDays"
            :placeholder="$t('mint.mint29')"
          ></el-input> -->
          <Input
            class="bg-input"
            :value="model.days"
            @input="changeLockDays"
            :placeholder="$t('mint.mint29')" />
        </el-form-item>
        <el-form-item prop="whitelist">
          <template #label>
            <Tip :label="$t('mint.mint31')" :tip="$t('mint.mint32')" />
          </template>
          <!-- <el-input
            :model-value="model.whitelist"
            @input="changeWhitelist"
            :autosize="{ minRows: 2, maxRows: 20 }"
            type="textarea"
            :placeholder="$t('mint.mint32')"
          ></el-input> -->
          <Input
            class="bg-input"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 20 }"
            :value="model.whitelist"
            @input="changeWhitelist"
            :placeholder="$t('mint.mint32')" />
        </el-form-item>
        <el-form-item :label="$t('mint.mint33')" prop="minutes">
          <!-- <el-input
            :model-value="model.minutes"
            @input="changeMinutes"
            placeholder=""
          ></el-input> -->
          <Input
            class="bg-input"
            :value="model.minutes"
            @input="changeMinutes"
            placeholder="" />
        </el-form-item>
      </div>

      <el-form-item :label="$t('mint.mint34')" v-if="mintAsset?.symbol">
        <div class="h-10 w-full rounded-xl bg-card2 text-center leading-10">
          {{ totalCost || '--' }} {{ mintAsset?.symbol }}
        </div>
      </el-form-item>
      <el-form-item class="checkbox-item check-notice" prop="check">
        <!-- <el-checkbox
          :label="$t('mint.mint35')"
          v-model="model.check"
        ></el-checkbox> -->
        <Checkbox
          v-model="model.check"
          :text="$t('mint.mint35')"
          text-class="text-label" />
      </el-form-item>
      <el-form-item>
        <!-- <el-button
          type="primary"
          @click="submitForm"
          v-if="nerveAddress"
          :disabled="disabled">
          {{
            insufficientBalance ? $t('transfer.transfer15') : $t('mint.mint1')
          }}
          <el-icon class="is-loading" style="margin-left: 5px" v-if="loading">
            <Loading />
          </el-icon>
        </el-button> -->
        <div class="pt-4 w-full">
          <Button
            class="w-full"
            :loading="loading"
            @click="submitForm"
            v-if="nerveAddress"
            :disabled="disabled">
            {{
              insufficientBalance ? $t('transfer.transfer15') : $t('mint.mint1')
            }}
          </Button>
          <auth-button v-else class="w-full"></auth-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import Tip from './Tip.vue'
import AuthButton from '@/components/AuthButton.vue'
import Input from '@/components/Base/Input/index.vue'
import Select from '@/components/Base/Select/index.vue'
import Switch from '@/components/Base/Switch/index.vue'
import Checkbox from '@/components/Base/Checkbox/index.vue'
import Button from '@/components/Base/Button/index.vue'
import BackTitle from '@/components/BackTitle.vue'
import BalanceItem from '@/components/BalanceItem.vue'
import { useWalletStore } from '@/store/wallet'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex'
import useToast from '@/hooks/useToast'
import useMintBaseInfo from './useMintBaseInfo'
import {
  isValidNerveAddress,
  timesDecimals,
  Times,
  Plus,
  Power
} from '@/utils/util'
import useRules from './useRules'
import { ElForm } from 'element-plus'
import nerveswap from 'nerveswap-sdk'

const router = useRouter()
const { t } = useI18n()

const walletStore = useWalletStore()
const { nerveAddress, assetsList } = storeToRefs(walletStore)

const _assetsList = computed(() => {
  return assetsList.value.map(item => ({
    label: item.symbol + '(' + item.assetKey + ')',
    value: item.assetKey
  }))
})

const { toastError } = useToast()
const { getWalletInfo, handleResult } = useBroadcastNerveHex()
const { targetAddress } = useMintBaseInfo()

const form = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)

const { advanced, model, rules } = useRules()

const mintAsset = computed(() => {
  if (!model.tick) return null
  const asset = assetsList.value.find(v => v.assetKey === model.tick)!
  return asset
})

const minFeeAsset = computed(() => {
  if (!model.feetick) return null
  const asset = assetsList.value.find(v => v.assetKey === model.feetick)!
  return asset
})

const totalCost = computed(() => {
  const { ratio, max } = model
  if (!mintAsset.value?.symbol || !max) return ''
  if (ratio) {
    const mintAssetDecimal = mintAsset.value!.decimals
    const tokenBase = Power(mintAssetDecimal)
    const tokenAmountForLp = Times(max, Times(ratio, 95))
      .times(tokenBase)
      .div(10000)
      .div(tokenBase)
      .toFixed()
    return Plus(max, tokenAmountForLp).toFixed()
  }
  return max
})

const insufficientBalance = computed(() => {
  if (!mintAsset.value) return false
  return mintAsset.value.available - totalCost.value < 0
})

const disabled = computed(() => {
  if (!mintAsset.value) return true
  if (insufficientBalance.value) return true
  return !model.check || loading.value
})

function feeAssetChange() {
  form.value?.validateField('fee', () => {})
}

function getAmountReg(decimals?: number) {
  let reg: RegExp
  if (!decimals) {
    reg = new RegExp('^([1-9][\\d]*|0)(\\.[\\d]*)?$|(^\\.[\\d]*$)')
  } else {
    reg = new RegExp(
      '^([1-9][\\d]*|0)(\\.[\\d]{0,' +
        decimals +
        '})?$|(^\\.[\\d]{0,' +
        decimals +
        '}$)'
      // "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
    )
  }
  return reg
}

const changeFee = (val: string) => {
  const decimals = minFeeAsset.value?.decimals || 8
  const reg = getAmountReg(decimals)
  if (reg.exec(val) || val === '') {
    model.fee = val
  }
}

const changeSingleMintAmount = (val: string) => {
  const decimals = mintAsset.value?.decimals || 8
  const reg = getAmountReg(decimals)
  if (reg.exec(val) || val === '') {
    model.lim = val
    form.value?.validateField('max', () => {})
  }
}
function changeMintLimits(val: string) {
  const reg = /^[1-9]\d*$/
  if (reg.exec(val) || val === '') {
    model.count = val
    if (Number(val) > 100) {
      model.count = '100'
    }
  }
}
const changeHardTop = (val: string) => {
  const decimals = mintAsset.value?.decimals || 8
  const reg = getAmountReg(decimals)
  if (reg.exec(val) || val === '') {
    model.max = val
    form.value?.validateField('lim', () => {})
  }
}
function disableTime(date: Date) {
  return date.getTime() < new Date().getTime()
}
function changeLPRatio(val: string) {
  const reg = getAmountReg(2)
  if (reg.exec(val) || val === '') {
    if (Number(val) - 100 <= 0) {
      model.ratio = val
    } else {
      model.ratio = '100'
    }
  }
}
function changeLockDays(val: string) {
  const reg = /^[1-9]\d*$/
  if (reg.exec(val) || val === '') {
    model.days = val
  }
}

function changeWhitelist(val: string) {
  const trimVal = val.replace(/\s/g, '')
  const list = trimVal.split(',')
  const last = list.length > 1 ? list[list.length - 1] : list[0]
  const isValid = isValidNerveAddress(last)
  if (isValid) {
    val = val + ',' + '\n'
  }
  model.whitelist = val
}

function changeMinutes(val: string) {
  const reg = /^[1-9]\d*$/
  if (reg.exec(val) || val === '') {
    model.minutes = val
  }
}

function submitForm() {
  form.value?.validate(valid => {
    if (valid) {
      const isValidWhitelist = validateWhitelist()
      if (isValidWhitelist) {
        handleDeploy()
      }
    } else {
      console.log('error submit!!')
      return false
    }
  })
}
function validateWhitelist() {
  const str = model.whitelist
  const trimStr = str.replace(/\s/g, '')
  const list = trimStr.split(',').filter(v => v)
  const uniqueList = Array.from(new Set(list))
  /* const formatWhitelist = str
    .replace(/\s/g, '')
    .split(',')
    .filter(v => v)
    .join(',');
  console.log(formatWhitelist, 33); */
  if (uniqueList.length > 200) {
    toastError(t('mint.mint63'))
    return false
  } else if (list.length !== uniqueList.length) {
    toastError(t('mint.mint62'))
    return false
  } else {
    const validList = []
    uniqueList.map(v => {
      const isvalid = isValidNerveAddress(v)
      if (isvalid) {
        validList.push(v)
      }
    })
    if (validList.length !== uniqueList.length) {
      toastError(t('mint.mint61'))
    }
    return true
  }
}

async function handleDeploy() {
  loading.value = true
  try {
    const {
      tick,
      feetick,
      fee,
      addr,
      lim,
      count,
      max,
      start,
      unlock,
      ratio,
      days,
      whitelist,
      minutes,
      check
    } = model
    const mintAssetDecimal = mintAsset.value!.decimals
    const mintFee = timesDecimals(fee, minFeeAsset.value!.decimals)
    const singleMintAmount = timesDecimals(lim, mintAssetDecimal)
    const hardTopAmount = timesDecimals(max, mintAssetDecimal)
    const startTime = Math.floor(new Date(start).getTime() / 1000)
    const unLockTime = Math.floor(new Date(unlock).getTime() / 1000)
    let tokenAmountForLp = '0'
    const formatWhitelist = whitelist
      .replace(/\s/g, '')
      .split(',')
      .filter(v => v)
      .join(',')
    let deploy = {
      p: 'nerve-mint',
      op: 'deploy',
      tick,
      feetick,
      fee: mintFee,
      addr,
      lim: singleMintAmount,
      count,
      max: hardTopAmount,
      start: startTime,
      unlock: unLockTime,
      ratio: ratio || '0',
      days: ratio ? days || '0' : '0',
      whitelist: formatWhitelist,
      minutes: formatWhitelist ? minutes || '0' : '0'
    }
    if (!check) {
      deploy.ratio = '0'
      deploy.days = '0'
      deploy.whitelist = ''
      deploy.minutes = '0'
    }
    if (ratio) {
      const tokenBase = Power(mintAssetDecimal)
      tokenAmountForLp = Times(hardTopAmount, Times(ratio, 95))
        .times(tokenBase)
        .div(10000)
        .div(tokenBase)
        .toFixed()
    }
    const { provider, EVMAddress, pub } = getWalletInfo()
    const [assetChainId, assetId] = tick.split('-')
    const result = await nerveswap.transfer.transfer({
      provider,
      from: nerveAddress.value,
      to: targetAddress.value,
      assetChainId: Number(assetChainId),
      assetId: Number(assetId),
      amount: Plus(hardTopAmount, tokenAmountForLp).toFixed(),
      remark: JSON.stringify(deploy),
      EVMAddress,
      pub
    })
    handleResult(2, result, '')
    if (result && result.hash) {
      model.feetick = ''
      form.value?.resetFields()
      router.push('/mint')
    }
  } catch (e) {
    console.log(e, 'mint-deploy-error')
    toastError(e)
  }
  loading.value = false
}
</script>
