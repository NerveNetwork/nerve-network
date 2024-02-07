import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { isValidNerveAddress } from '@/utils/util';

export default function useRules() {
  const { t } = useI18n();

  const model = reactive({
    tick: '', // mint asset
    feetick: '', // mint fee asset
    fee: '', // mint fee amount
    addr: '', // mint fee addr
    lim: '', // single mint amount
    count: '', // mint limits
    max: '', // hard top
    start: '', // mint time
    unlock: '', // mint asset unlock time
    ratio: '', // LP Addition Ratio
    days: '180', // LP Lock Dayas,
    whitelist: '', //
    minutes: '60', // whitelist mint time
    check: false
  });

  const rules = reactive({
    tick: [
      {
        required: true,
        message: t('mint.mint3'),
        trigger: 'change'
      }
    ],
    fee: [{ validator: validateFee, trigger: 'blur' }],
    feetick: [
      {
        required: true,
        message: t('mint.mint71'),
        trigger: 'change'
      }
    ],
    addr: [{ validator: validateFeeAddress, trigger: 'blur' }],
    lim: [{ validator: validateSingleMintAmount, trigger: 'blur' }],
    count: [{ validator: validateMintLimits, trigger: 'blur' }],
    max: [{ validator: validateHardTop, trigger: 'blur' }],
    days: [{ validator: validataLockDays, trigger: 'blur' }],
    start: [
      {
        type: 'date',
        message: t('mint.mint20'),
        trigger: 'change'
      }
    ],
    unlock: [
      {
        type: 'date',
        message: t('mint.mint23'),
        trigger: 'change'
      }
    ]
  });

  function validateFee(rule: any, value: any, callback: any) {
    if (!value || !model.feetick) {
      callback(t('mint.mint71'));
    } else {
      callback();
    }
  }

  function validateFeeAddress(rule: any, value: any, callback: any) {
    if (!value) {
      callback(t('mint.mint9'));
    } else {
      const isValid = isValidNerveAddress(value);
      if (!isValid) {
        callback(t('mint.mint55'));
      } else {
        callback();
      }
    }
  }
  function validateSingleMintAmount(rule: any, value: any, callback: any) {
    if (!value) {
      callback(t('mint.mint11'));
    } else {
      callback();
    }
  }
  function validateMintLimits(rule: any, value: any, callback: any) {
    if (!value) {
      callback(t('mint.mint14'));
    } else {
      callback();
    }
  }
  function validateHardTop(rule: any, value: any, callback: any) {
    if (!value) {
      callback(t('mint.mint17'));
    } else {
      callback();
    }
  }
  function validataLockDays(rule: any, value: string, callback: any) {
    if (value) {
      const val = Number(value);
      if (val < 30 || val > 720) {
        callback(t('mint.mint300'));
        return;
      } else {
        callback();
      }
    } else {
      callback();
    }
  }
  return {
    model,
    rules
  };
}
