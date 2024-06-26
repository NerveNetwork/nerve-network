import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isValidNerveAddress } from '@/utils/util';

export default function useRules() {
  const { t } = useI18n();

  const advanced = ref(true);
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
    days: '', // LP Lock Dayas,
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
    start: [
      {
        required: true,
        message: t('mint.mint20'),
        trigger: 'change'
      }
    ],
    unlock: [
      {
        required: true,
        message: t('mint.mint23'),
        trigger: 'change'
      }
    ],
    ratio: [{ validator: validataLPRatio, trigger: 'blur' }],
    days: [{ validator: validataLockDays, trigger: 'blur' }],
    minutes: [{ validator: validataMinutes, trigger: 'blur' }]
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
      if (model.max && value > model.max) {
        callback('Single Mint Amount must be less than Hard Top');
      } else {
        callback();
      }
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
      // @ts-ignore
      if (model.lim && value % model.lim !== 0) {
        callback('Hard Top must be divisible by Single Mint Amount');
      } else {
        callback();
      }
    }
  }
  function validataLPRatio(rule: any, value: string, callback: any) {
    if (!advanced.value) {
      callback();
      return;
    }
    if (model.days) {
      if (value) {
        callback();
      } else {
        callback(t('mint.mint26'));
      }
    } else {
      callback();
    }
  }
  function validataLockDays(rule: any, value: string, callback: any) {
    if (!advanced.value) {
      callback();
      return;
    }
    if (value) {
      const val = Number(value);
      if (val < 30 || val > 3000) {
        callback(t('mint.mint300'));
        return;
      }
    }
    if (model.ratio) {
      if (value) {
        callback();
      } else {
        callback(t('mint.mint29'));
      }
    } else {
      callback();
    }
  }
  function validataMinutes(rule: any, value: string, callback: any) {
    const { whitelist } = model;
    if (!advanced.value) {
      callback();
      return;
    }
    const formatWhitelist = whitelist
      .replace(/\s/g, '')
      .split(',')
      .filter(v => v)
      .join(',');
    if (!value && formatWhitelist) {
      callback(t('mint.mint333'));
    } else {
      callback();
    }
  }
  return {
    advanced,
    model,
    rules
  };
}
