<template>
  <div class="w1200">
    <div
      class="create-farm card-wrapper mx-auto max-w-[470px]"
      v-loading="loading">
      <BackTitle :title="$t('farm.farm12')" />

      <el-form label-position="top" :model="model" :rules="rules" ref="form">
        <el-form-item :label="$t('farm.farm13')" prop="tokenA">
          <Select
            v-model="model.tokenA"
            :options="stakeTokenList"
            :placeholder="$t('createFarm.createFarm1')" />
          <!-- <el-select
            v-model="model.tokenA"
            filterable
            :placeholder="$t('createFarm.createFarm1')"
            popper-class="asset-select"
          >
            <el-option
              :label="item.symbol + '(' + item.assetKey + ')'"
              :value="item.assetKey"
              v-for="item in stakeTokenList"
              :key="item.assetKey"
            ></el-option>
          </el-select> -->
        </el-form-item>

        <el-form-item :label="$t('farm.farm15')" prop="tokenB">
          <Select
            v-model="model.tokenB"
            :options="earnTokenList"
            :placeholder="$t('createFarm.createFarm3')" />
          <!-- <el-select
            v-model="model.tokenB"
            filterable
            :placeholder="$t('createFarm.createFarm3')"
            popper-class="asset-select"
          >
            <el-option
              :label="item.symbol + '(' + item.assetKey + ')'"
              :value="item.assetKey"
              v-for="item in earnTokenList"
              :key="item.assetKey"
            ></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item :label="$t('farm.farm16')" prop="syrupPerDay">
          <Input
            v-model="model.syrupPerDay"
            :placeholder="$t('createFarm.createFarm4')" />
          <!-- <el-input
            v-model="model.syrupPerDay"
            :placeholder="$t('createFarm.createFarm4')"
          ></el-input> -->
        </el-form-item>
        <el-form-item prop="syrupTotalAmount">
          <template #label>
            <div class="flex items-center justify-between">
              <span>{{ $t('farm.farm17') }}</span>
              <BalanceItem :balance="balance" />
            </div>
          </template>
          <Input
            v-model="model.syrupTotalAmount"
            :placeholder="$t('createFarm.createFarm5')" />
          <!-- <el-input
            v-model="model.syrupTotalAmount"
            :placeholder="$t('createFarm.createFarm5')"
          ></el-input> -->
        </el-form-item>
        <div class="mb-4 flex justify-end">
          <Switch v-model="advanced" :text="$t('createFarm.createFarm12')" />
          <!-- <el-switch
            v-model="advanced"
            :active-text="$t('createFarm.createFarm12')"
            :width="35"
          ></el-switch> -->
        </div>
        <el-form-item
          :label="$t('farm.farm22')"
          prop="startTime"
          v-if="advanced">
          <el-date-picker
            :placeholder="$t('createFarm.createFarm6')"
            v-model="model.startTime"
            type="datetime"
            :disabledDate="disableTime"></el-date-picker>
        </el-form-item>
        <el-form-item
          :label="$t('farm.farm14')"
          prop="lockedTime"
          v-if="advanced">
          <el-date-picker
            :placeholder="$t('createFarm.createFarm2')"
            v-model="model.lockedTime"
            type="datetime"
            :disabledDate="disableTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="" prop="modifiable" v-if="advanced">
          <Switch v-model="model.modifiable" :text="$t('Can be modified')" />
          <!-- <el-switch
            v-model="model.modifiable"
            active-text="Can be modified"
            :width="35"
          ></el-switch> -->
        </el-form-item>
        <el-form-item class="checkbox-item" prop="check">
          <Checkbox v-model="model.checkContact" text-class="text-label">
            <template #text>
              <i18n-t keypath="farm.farm26" tag="label">
                <a
                  href="https://discord.gg/PBkHeD7"
                  target="_blank"
                  class="text-primary">
                  {{ $t('farm.farm27') }}
                </a>
              </i18n-t>
            </template>
          </Checkbox>
          <!-- <el-checkbox :label="$t('farm.farm26')" v-model="model.checkContact">
            <i18n-t keypath="farm.farm26" tag="label">
              <a href="https://discord.gg/PBkHeD7" target="_blank" class="link">
                {{ $t('farm.farm27') }}
              </a>
            </i18n-t>
          </el-checkbox> -->
        </el-form-item>
        <el-form-item class="checkbox-item check-notice" prop="check">
          <!-- <el-checkbox
            :label="$t('farm.farm18')"
            v-model="model.check"
          ></el-checkbox> -->
          <Checkbox
            v-model="model.check"
            :text="$t('farm.farm18')"
            text-class="text-error" />
        </el-form-item>
        <el-form-item>
          <div class="w-full pt-7">
            <Button
              class="w-full"
              @click="submitForm"
              v-if="nerveAddress"
              :disabled="disabledConfirm">
              {{ $t('farm.farm19') }}
            </Button>
            <auth-button class="w-full" v-else></auth-button>
          </div>

          <!-- <el-button
            type="primary"
            @click="submitForm"
            v-if="nerveAddress"
            :disabled="disabledConfirm"
          >
            {{ $t('farm.farm19') }}
          </el-button> -->
        </el-form-item>
      </el-form>
      <div class="pt-5" v-if="myFarms.length">
        <h3 class="text-base font-medium">
          {{ $t('createFarm.createFarm13') }}
        </h3>
        <ul>
          <li v-for="item in myFarms" :key="item.hash">
            <span @click="toMyFarm(item)" class="cursor-pointer text-primary">{{
              item.name
            }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { getBlockInfo } from '@/service/api'
import { Minus, timesDecimals, Division } from '@/utils/util'
import dayjs from 'dayjs'
import AuthButton from '@/components/AuthButton.vue'
import Input from '@/components/Base/Input/index.vue'
import Select from '@/components/Base/Select/index.vue'
import Checkbox from '@/components/Base/Checkbox/index.vue'
import Switch from '@/components/Base/Switch/index.vue'
import Button from '@/components/Base/Button/index.vue'
import BackTitle from '@/components/BackTitle.vue'
import BalanceItem from '@/components/BalanceItem.vue'
import { useWalletStore } from '@/store/wallet'
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex'
import useToast from '@/hooks/useToast'
import useMyFarm from './hooks/useMyFarm'
import { ElForm } from 'element-plus'
import nerveswap from 'nerveswap-sdk'

import { AssetItem } from '@/store/types'

const walletStore = useWalletStore()
const { nerveAddress, assetsList: assetList } = storeToRefs(walletStore)
const { t } = useI18n()
const router = useRouter()
const { toastError } = useToast()

const form = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)
const model = reactive({
  tokenA: '', // 质押的token
  lockedTime: '', // 质押token解锁时间
  tokenB: '', // 奖励的token
  syrupPerDay: '', // 每天可获得token奖励
  syrupTotalAmount: '', // 奖励token总量
  startTime: '', // 开始时间
  modifiable: false,
  checkContact: false,
  check: false
})
const { myFarms, toMyFarm, updateMyFarms } = useMyFarm()
const rules = reactive({
  tokenA: [
    {
      required: true,
      message: t('createFarm.createFarm1'),
      trigger: 'change'
    }
  ],
  lockedTime: [
    {
      type: 'date',
      message: t('createFarm.createFarm2'),
      trigger: 'change'
    }
  ],
  tokenB: [
    {
      required: true,
      message: t('createFarm.createFarm3'),
      trigger: 'change'
    }
  ],
  syrupPerDay: [
    {
      required: true,
      message: t('createFarm.createFarm4'),
      trigger: 'change'
    },
    { validator: validateSyrupTotalAmount, trigger: 'blur' }
  ],
  syrupTotalAmount: [
    {
      required: true,
      message: t('createFarm.createFarm5'),
      trigger: 'change'
    },
    { validator: validateSyrupTotalAmount, trigger: 'blur' }
  ],
  startTime: [
    {
      type: 'date',
      message: t('createFarm.createFarm6'),
      trigger: 'change'
    }
  ]
})

const disabledConfirm = computed(() => {
  return !model.check || !model.checkContact
})

const stakeTokenList = computed(() => {
  // return assetList.value.filter(v => v.symbol.indexOf('_') > -1);
  return assetList.value
    .filter(v => v)
    .map(k => ({
      ...k,
      label: k.symbol + '(' + k.assetKey + ')',
      value: k.assetKey
    }))
})

const earnTokenList = computed(() => {
  return assetList.value
    .filter(v => v.symbol.indexOf('_') === -1)
    .map(k => ({
      ...k,
      label: k.symbol + '(' + k.assetKey + ')',
      value: k.assetKey
    }))
})

const balance = computed(() => {
  const tokenB = assetList.value.find(v => v.assetKey === model.tokenB)
  if (!tokenB) return '0'
  return tokenB.available
})
function validateSyrupPerDay(rule: any, value: any, callback: any) {
  // const reg = new RegExp("^([1-9][\\d]{0,20}|0)(\\.[\\d])?$");
  const reg = new RegExp('^([1-9][\\d]{0,1})$')
  if (!reg.exec(value)) {
    callback(t('createFarm.createFarm8'))
  } else {
    callback()
  }
}
function validateSyrupTotalAmount(rule: any, value: any, callback: any) {
  if (!model.tokenB) {
    const reg = new RegExp('^([1-9][\\d]*|0)(\\.[\\d]*)?$')
    if (!reg.exec(value)) {
      callback(t('createFarm.createFarm11'))
    } else {
      callback()
    }
  } else {
    const tokenB = assetList.value.find(
      (v: AssetItem) => v.assetKey === model.tokenB
    ) as AssetItem
    const { decimals, available } = tokenB
    const reg = new RegExp(
      '^([1-9][\\d]{0,20}|0)(\\.[\\d]{0,' + decimals + '})?$'
    )
    // console.log(available, value, available < value);
    if (Minus(available, value).toNumber() < 0) {
      callback(t('createFarm.createFarm10'))
    } else if (!reg.exec(value)) {
      callback(t('createFarm.createFarm9') + decimals)
    } else {
      callback()
    }
  }
}
function validateCheck(rule: any, value: any, callback: any) {
  if (!value) {
    callback(t('createFarm.createFarm7'))
  } else {
    callback()
  }
}

function disableTime(date: Date) {
  // console.log(date, 132465)
  return new Date().getTime() > new Date(date).getTime()
}

function submitForm() {
  form.value?.validate(valid => {
    if (valid) {
      createFarm()
    }
  })
}
const { getWalletInfo, handleResult } = useBroadcastNerveHex()
async function createFarm() {
  loading.value = true
  try {
    const { provider, EVMAddress, pub } = getWalletInfo()
    const { lockedTime, syrupPerDay, syrupTotalAmount, startTime, modifiable } =
      model
    const tokenA = assetList.value.find(
      (v: AssetItem) => v.assetKey === model.tokenA
    ) as AssetItem
    const tokenB = assetList.value.find(
      (v: AssetItem) => v.assetKey === model.tokenB
    ) as AssetItem
    const syrupPerDay_amount = Division(syrupPerDay, (24 * 60 * 60) / 2)
    const syrupPerBlock = timesDecimals(
      syrupPerDay_amount,
      tokenB.decimals
    ).split('.')[0]
    const blockInfo: any = await getBlockInfo()
    const currentHeight = blockInfo.blockHeight
    const diffSeconds = dayjs(startTime).diff(dayjs(new Date()), 'seconds')
    const startBlockHeight = advanced.value
      ? Math.floor(Number(currentHeight) + diffSeconds / 2)
      : 1
    const lockTo = advanced.value ? dayjs(lockedTime).unix() : 1
    const _modifiable = advanced.value ? modifiable : false
    const result = await nerveswap.farm.createFarm({
      provider,
      from: nerveAddress.value,
      stakeAssetKey: tokenA.chainId + '-' + tokenA.assetId,
      rewardAssetKey: tokenB.chainId + '-' + tokenB.assetId,
      totalReward: timesDecimals(syrupTotalAmount, tokenB.decimals),
      rewardPerBlock: syrupPerBlock,
      startBlockHeight,
      lockedTime: lockTo,
      modifiable: _modifiable,
      remark: '',
      EVMAddress,
      pub
    })
    const amountRemark = `${tokenA.symbol}-${tokenB.symbol}`
    handleResult(62, result, amountRemark)
    if (result && result.hash) {
      updateMyFarms({
        type: tokenA.symbol.indexOf('_') > -1 ? 'farm' : 'pool',
        hash: result.hash,
        name: tokenA.symbol
      })
      form.value?.resetFields()
    }
  } catch (e) {
    console.log(e, 'create-farm-error')
    toastError(e)
  }
  loading.value = false
}

const advanced = ref(false)
</script>
