<template>
  <div class="mint-deploy-page w1200">
    <div class="deploy-header">
      <img src="../../assets/img/back-icon.svg" @click="router.go(-1)" />
      <h3>{{ $t('mint.mint1') }}</h3>
    </div>
    <el-form label-position="top" :model="model" :rules="rules" ref="form">
      <div class="balance">
        {{ $t('public.public12') }}{{ mintAsset?.available || '0' }}
      </div>
      <el-form-item prop="tick">
        <template #label>
          <Tip :label="$t('mint.mint2')" :tip="$t('mint.mint4')" />
        </template>
        <el-select
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
        </el-select>
      </el-form-item>

      <el-form-item prop="fee">
        <template #label>
          <Tip :label="$t('mint.mint5')" :tip="$t('mint.mint7')" />
        </template>
        <div class="flex-center" style="width: 100%">
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
        </div>
      </el-form-item>
      <el-form-item prop="addr">
        <template #label>
          <Tip :label="$t('mint.mint8')" :tip="$t('mint.mint9')" />
        </template>
        <el-input
          v-model="model.addr"
          :placeholder="$t('mint.mint9')"
        ></el-input>
      </el-form-item>
      <el-form-item prop="lim">
        <template #label>
          <Tip :label="$t('mint.mint10')" :tip="$t('mint.mint12')" />
        </template>
        <el-input
          :model-value="model.lim"
          @input="changeSingleMintAmount"
          :placeholder="$t('mint.mint11')"
        ></el-input>
      </el-form-item>
      <el-form-item prop="count">
        <template #label>
          <Tip :label="$t('mint.mint13')" :tip="$t('mint.mint15')" />
        </template>
        <el-input
          :model-value="model.count"
          @input="changeMintLimits"
          :placeholder="$t('mint.mint14')"
        ></el-input>
      </el-form-item>
      <el-form-item prop="max">
        <template #label>
          <Tip :label="$t('mint.mint16')" :tip="$t('mint.mint18')" />
        </template>
        <el-input
          :model-value="model.max"
          @input="changeHardTop"
          :placeholder="$t('mint.mint17')"
        ></el-input>
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
          :disabledDate="disableTime"
        ></el-date-picker>
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
          :disabledDate="disableTime"
        ></el-date-picker>
      </el-form-item>
      <div class="advanced">
        <el-switch
          v-model="advanced"
          :active-text="$t('mint.mint36')"
          :width="35"
        ></el-switch>
      </div>
      <div v-show="advanced">
        <el-form-item prop="ratio">
          <template #label>
            <Tip :label="$t('mint.mint25')" :tip="$t('mint.mint27')" />
          </template>
          <el-input
            :model-value="model.ratio"
            @input="changeLPRatio"
            :placeholder="$t('mint.mint26')"
            class="ratio-input"
          >
            <template #append>%</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="days">
          <template #label>
            <Tip :label="$t('mint.mint28')" :tip="$t('mint.mint30')" />
          </template>
          <el-input
            :model-value="model.days"
            @input="changeLockDays"
            :placeholder="$t('mint.mint29')"
          ></el-input>
        </el-form-item>
        <el-form-item prop="whitelist">
          <template #label>
            <Tip :label="$t('mint.mint31')" :tip="$t('mint.mint32')" />
          </template>
          <el-input
            :model-value="model.whitelist"
            @input="changeWhitelist"
            :autosize="{ minRows: 2, maxRows: 20 }"
            type="textarea"
            :placeholder="$t('mint.mint32')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('mint.mint33')" prop="minutes">
          <el-input
            :model-value="model.minutes"
            @input="changeMinutes"
            placeholder=""
          ></el-input>
        </el-form-item>
      </div>

      <el-form-item :label="$t('mint.mint34')" v-if="mintAsset?.symbol">
        <div class="total-amount">
          {{ totalCost || '--' }} {{ mintAsset?.symbol }}
        </div>
      </el-form-item>
      <el-form-item class="checkbox-item check-notice" prop="check">
        <el-checkbox
          :label="$t('mint.mint35')"
          v-model="model.check"
        ></el-checkbox>
      </el-form-item>
      <el-form-item class="confirm-wrap">
        <el-button
          type="primary"
          @click="submitForm"
          v-if="nerveAddress"
          :disabled="disabled"
        >
          {{
            insufficientBalance ? $t('transfer.transfer15') : $t('mint.mint1')
          }}
          <el-icon class="is-loading" style="margin-left: 5px" v-if="loading">
            <Loading />
          </el-icon>
        </el-button>
        <auth-button v-else></auth-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Tip from './Tip.vue';
import AuthButton from '@/components/AuthButton.vue';
import useStoreState from '@/hooks/useStoreState';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import useToast from '@/hooks/useToast';
import useMintBaseInfo from './useMintBaseInfo';
import {
  isValidNerveAddress,
  timesDecimals,
  Times,
  Plus,
  Power
} from '@/utils/util';
import useRules from './useRules';
import { ElForm } from 'element-plus';
import nerveswap from 'nerveswap-sdk';
import config from '@/config';

const router = useRouter();
const { t } = useI18n();
const { nerveAddress, assetsList } = useStoreState();
const { toastError } = useToast();
const { getWalletInfo, handleResult } = useBroadcastNerveHex();
const { targetAddress } = useMintBaseInfo();

const defaultWhitelist = 'NERVEepb61R6tii7FzrXFpagKi2muBxnEcqQpp';

watch(
  () => nerveAddress.value,
  val => {
    if (!config.isBeta && val !== defaultWhitelist) {
      router.replace('/mint');
    }
  }
);

const form = ref<InstanceType<typeof ElForm>>();
const loading = ref(false);

const { advanced, model, rules } = useRules();

const mintAsset = computed(() => {
  if (!model.tick) return null;
  const asset = assetsList.value.find(v => v.assetKey === model.tick)!;
  return asset;
});

const minFeeAsset = computed(() => {
  if (!model.feetick) return null;
  const asset = assetsList.value.find(v => v.assetKey === model.feetick)!;
  return asset;
});

const totalCost = computed(() => {
  const { ratio, max } = model;
  if (!mintAsset.value?.symbol || !max) return '';
  if (ratio) {
    const mintAssetDecimal = mintAsset.value!.decimals;
    const tokenBase = Power(mintAssetDecimal);
    const tokenAmountForLp = Times(max, Times(ratio, 95))
      .times(tokenBase)
      .div(10000)
      .div(tokenBase)
      .toFixed();
    return Plus(max, tokenAmountForLp).toFixed();
  }
  return max;
});

const insufficientBalance = computed(() => {
  if (!mintAsset.value) return false;
  return mintAsset.value.available - totalCost.value < 0;
});

const disabled = computed(() => {
  if (!mintAsset.value) return true;
  if (insufficientBalance.value) return true;
  return !model.check || loading.value;
});

function feeAssetChange() {
  form.value?.validateField('fee', () => {});
}

function getAmountReg(decimals?: number) {
  let reg: RegExp;
  if (!decimals) {
    reg = new RegExp('^([1-9][\\d]*|0)(\\.[\\d]*)?$|(^\\.[\\d]*$)');
  } else {
    reg = new RegExp(
      '^([1-9][\\d]*|0)(\\.[\\d]{0,' +
        decimals +
        '})?$|(^\\.[\\d]{0,' +
        decimals +
        '}$)'
      // "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
    );
  }
  return reg;
}

const changeFee = (val: string) => {
  const decimals = minFeeAsset.value?.decimals || 8;
  const reg = getAmountReg(decimals);
  if (reg.exec(val) || val === '') {
    model.fee = val;
  }
};

const changeSingleMintAmount = (val: string) => {
  const decimals = mintAsset.value?.decimals || 8;
  const reg = getAmountReg(decimals);
  if (reg.exec(val) || val === '') {
    model.lim = val;
  }
};
function changeMintLimits(val: string) {
  const reg = /^[1-9]\d*$/;
  if (reg.exec(val) || val === '') {
    model.count = val;
  }
}
const changeHardTop = (val: string) => {
  const decimals = mintAsset.value?.decimals || 8;
  const reg = getAmountReg(decimals);
  if (reg.exec(val) || val === '') {
    model.max = val;
  }
};
function disableTime(date: Date) {
  return date.getTime() < new Date().getTime();
}
function changeLPRatio(val: string) {
  const reg = getAmountReg(2);
  if (reg.exec(val) || val === '') {
    if (Number(val) - 100 <= 0) {
      model.ratio = val;
    } else {
      model.ratio = '100';
    }
  }
}
function changeLockDays(val: string) {
  const reg = /^[1-9]\d*$/;
  if (reg.exec(val) || val === '') {
    model.days = val;
  }
}

function changeWhitelist(val: string) {
  const trimVal = val.replace(/\s/g, '');
  const list = trimVal.split(',');
  const last = list.length > 1 ? list[list.length - 1] : list[0];
  const isValid = isValidNerveAddress(last);
  if (isValid) {
    val = val + ',' + '\n';
  }
  model.whitelist = val;
}

function changeMinutes(val: string) {
  const reg = /^[1-9]\d*$/;
  if (reg.exec(val) || val === '') {
    model.minutes = val;
  }
}

function submitForm() {
  if (nerveAddress.value !== defaultWhitelist) {
    return;
  }
  form.value?.validate(valid => {
    if (valid) {
      const isValidWhitelist = validateWhitelist();
      if (isValidWhitelist) {
        handleDeploy();
      }
    } else {
      console.log('error submit!!');
      return false;
    }
  });
}
function validateWhitelist() {
  const str = model.whitelist;
  const trimStr = str.replace(/\s/g, '');
  const list = trimStr.split(',').filter(v => v);
  const uniqueList = Array.from(new Set(list));
  /* const formatWhitelist = str
    .replace(/\s/g, '')
    .split(',')
    .filter(v => v)
    .join(',');
  console.log(formatWhitelist, 33); */
  if (uniqueList.length > 200) {
    toastError(t('mint.mint63'));
    return false;
  } else if (list.length !== uniqueList.length) {
    toastError(t('mint.mint62'));
    return false;
  } else {
    const validList = [];
    uniqueList.map(v => {
      const isvalid = isValidNerveAddress(v);
      if (isvalid) {
        validList.push(v);
      }
    });
    if (validList.length !== uniqueList.length) {
      toastError(t('mint.mint61'));
    }
    return true;
  }
}

async function handleDeploy() {
  loading.value = true;
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
    } = model;
    const mintAssetDecimal = mintAsset.value!.decimals;
    const mintFee = timesDecimals(fee, minFeeAsset.value!.decimals);
    const singleMintAmount = timesDecimals(lim, mintAssetDecimal);
    const hardTopAmount = timesDecimals(max, mintAssetDecimal);
    const startTime = Math.floor(new Date(start).getTime() / 1000);
    const unLockTime = Math.floor(new Date(unlock).getTime() / 1000);
    let tokenAmountForLp = '0';
    const formatWhitelist = whitelist
      .replace(/\s/g, '')
      .split(',')
      .filter(v => v)
      .join(',');
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
    };
    if (!check) {
      deploy.ratio = '0';
      deploy.days = '0';
      deploy.whitelist = '';
      deploy.minutes = '0';
    }
    if (ratio) {
      const tokenBase = Power(mintAssetDecimal);
      tokenAmountForLp = Times(hardTopAmount, Times(ratio, 95))
        .times(tokenBase)
        .div(10000)
        .div(tokenBase)
        .toFixed();
    }
    const { provider, EVMAddress, pub } = getWalletInfo();
    const [assetChainId, assetId] = tick.split('-');
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
    });
    handleResult(2, result);
    if (result && result.hash) {
      model.feetick = '';
      form.value?.resetFields();
      router.push('/mint');
    }
  } catch (e) {
    console.log(e, 'mint-deploy-error');
    toastError(e);
  }
  loading.value = false;
}
</script>

<style lang="scss">
@import '../../assets/css/style.scss';
.mint-deploy-page {
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  border-radius: 20px;
  padding: 30px 60px;
  background-color: #fff;
  .deploy-header {
    position: relative;
    text-align: center;
    margin-bottom: 30px;
    img {
      cursor: pointer;
      position: absolute;
      left: -30px;
      top: 5px;
    }
    h3 {
      font-size: 20px;
      font-weight: 500;
    }
  }
  .el-form {
    .el-form-item {
      margin-bottom: 16px;
    }
    .is-required .el-form-item__label::before {
      display: none;
    }
    .el-form-item__label {
      line-height: 30px;
      padding-bottom: 0;
    }
    .el-input__inner {
      border-radius: 10px;
    }
    .ratio-input {
      .el-input__inner {
        border-radius: 10px 0 0 10px;
      }
      .el-input-group__append {
        border-radius: 0 10px 10px 0;
        padding: 0 15px;
      }
    }
    .balance {
      float: right;
      line-height: 20px;
      padding-bottom: 0;
      font-size: 14px;
      color: $subLabelColor;
    }
    .el-select {
      width: 100%;
    }
    .fee-input {
      flex: 1;
      margin-right: 10px;
      & + .el-select {
        width: 160px;
      }
    }
    .checkbox-item {
      margin-bottom: 5px;
      .el-checkbox__label {
        color: #475472;
        display: inline;
      }
      .el-form-item__content {
        line-height: initial;
      }
      .el-checkbox {
        height: auto;
      }
      .el-form-item__error {
        padding-top: 2px;
      }
    }
    .check-notice {
      .el-checkbox__label {
        color: #aab2c9;
      }
    }
    .el-checkbox {
      white-space: inherit;
    }
    .el-checkbox__inner {
      //border-color: #4a5ef2;
      width: 18px;
      height: 18px;
      &::after {
        height: 8px;
        left: 6px;
        top: 2px;
        width: 4px;
      }
    }
    .el-date-editor.el-input,
    .el-date-editor.el-input__inner {
      width: 100%;
    }
    .confirm-wrap {
      margin-top: 30px;
      .auth-button {
        width: 100%;
      }
    }
  }
  .advanced {
    display: flex;
    justify-content: flex-end;
    .el-switch__label span {
      color: #475472;
    }
    .is-active span {
      color: #2688f7;
    }
  }
  .total-amount {
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    border-radius: 10px;
    margin-top: 10px;
    text-align: center;
    border: 1px solid $borderColor;
    background-color: #f7f9ff;
  }
  @media screen and (max-width: 560px) {
    padding: 15px 30px;
    .deploy-header {
      img {
        left: -15px;
        top: 5px;
      }
    }
  }
}

/* .mint-time-picker {
  .el-picker-panel__footer {
    .el-button:first-of-type {
      display: none;
    }
  }
} */
</style>
