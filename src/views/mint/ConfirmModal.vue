<template>
  <el-dialog
    center
    width="470px"
    custom-class="mint-modal"
    v-model="visible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="close"
  >
    <template #title>
      <img
        class="click"
        src="../../assets/img/back-icon.svg"
        alt=""
        @click="emit('update:show', false)"
      />
      <span>Mint</span>
    </template>
    <div v-loading="loading">
      <div class="info-item">
        <div class="left">{{ $t('mint.mint37') }}</div>
        <div class="right">
          <p>{{ info.mintAssetSymbol }}</p>
          <span class="id-info">
            {{ info.registerChain }} | ID:{{ info.mintAsset }}
          </span>
        </div>
      </div>
      <div class="info-item">
        <div class="left">{{ $t('mint.mint51') }}</div>
        <div class="right">
          {{ $thousands(info.mintEach) }}/{{ $thousands(info.mintMax) }}
        </div>
      </div>
      <div class="info-item">
        <div class="left">{{ $t('mint.mint41') }}</div>
        <div class="right">
          {{ $thousands(info.mintFee) }} {{ info.mintFeeAssetSymbol }}
        </div>
      </div>
      <div class="info-item">
        <div class="left">{{ $t('mint.mint52') }}</div>
        <div class="right">{{ remainMintCount }}/{{ info.mintCountLimit }}</div>
      </div>
      <div class="info-item">
        <div class="left">{{ $t('mint.mint42') }}</div>
        <div class="right">
          {{ info.poolRatio }}%｜{{ info.lpLockDay }}
          {{ $t('mint.mint56') }}
        </div>
      </div>
      <div class="info-item">
        <div class="left">{{ $t('mint.mint40') }}</div>
        <div class="right">{{ info.assetUnlockTime }}</div>
      </div>
      <template v-if="remainMintCount">
        <div class="info-item">
          <div class="left">{{ $t('mint.mint53') }}</div>
          <div class="right" style="position: relative">
            <el-input
              :model-value="mintCount"
              @input="changeInput"
              class="mint-count-input"
            />
            <span v-if="!mintCount" class="el-form-item__error">
              {{ $t('mint.mint64') }}
            </span>
          </div>
        </div>
        <div class="info-item cost">
          <div class="left flex-between">
            <span>{{ $t('mint.mint59') }}</span>
            <span>
              {{ $t('public.public16') }}
              {{ feeAsset.available || 0 }} {{ info.mintFeeAssetSymbol }}
            </span>
          </div>
          <div class="right">{{ totalCost }} {{ info.mintFeeAssetSymbol }}</div>
        </div>
        <el-checkbox :label="$t('mint.mint54')" v-model="check"></el-checkbox>
        <div class="confirm-btn">
          <el-button type="primary" :disabled="disabled" @click="handleMint">
            {{ btnText }}
            <el-icon
              class="is-loading"
              style="margin-left: 5px"
              v-if="txLoading"
            >
              <Loading />
            </el-icon>
          </el-button>
        </div>
      </template>
      <template v-else>
        <div class="confirm-btn">
          <el-button type="primary" disabled>
            {{ $t('mint.mint47') }}
          </el-button>
        </div>
      </template>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import nerveswap from 'nerveswap-sdk';
import useStoreState from '@/hooks/useStoreState';
import useToast from '@/hooks/useToast';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import {
  divisionDecimals,
  fixNumber,
  Division,
  Times,
  timesDecimals
} from '@/utils/util';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import { getMinterInfo } from '@/service/api/mint';
import { IMintItem } from '@/service/api/types/mint';
import { AssetItem } from '../swap/types';
import { NKey, NDecimals, NSymbol } from '@/constants/constants';

const props = defineProps<{
  show: boolean;
  id: number;
  targetAddress: string;
}>();

const emit = defineEmits(['update:show', 'refresh']);

const { t } = useI18n();

const { nerveAddress, assetsList } = useStoreState();
const { toastError } = useToast();
const { getWalletInfo, handleResult } = useBroadcastNerveHex();

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('update:show', val);
  }
});
const loading = ref(true);
const txLoading = ref(false);
const info = ref<IMintItem>({} as IMintItem);
const check = ref(false);
const mintCount = ref(1);

watch(
  () => visible.value,
  val => {
    if (val) {
      txLoading.value = false;
      info.value = {} as IMintItem;
      check.value = false;
      mintCount.value = 1;
      getInfo();
    }
  }
);

async function getInfo() {
  loading.value = true;
  const result = await getMinterInfo(props.id, nerveAddress.value);
  if (result.mintAsset === NKey) {
    result.mintAssetDecimals = NDecimals;
    result.mintAssetSymbol = NSymbol;
  }
  if (result.mintFeeAsset === NKey) {
    result.mintFeeAssetDecimals = NDecimals;
    result.mintFeeAssetSymbol = NSymbol;
  }
  result.startTime = dayjs(+result.startTime * 1000).format(
    'YYYY-MM-DD HH:mm:ss'
  );
  result.assetUnlockTime = dayjs(+result.assetUnlockTime * 1000).format(
    'YYYY-MM-DD HH:mm:ss'
  );
  result.mintEach = divisionDecimals(result.mintEach, result.mintAssetDecimals);
  result.mintMax = divisionDecimals(result.mintMax, result.mintAssetDecimals);
  result.mintFee = divisionDecimals(
    result.mintFee,
    result.mintFeeAssetDecimals
  );
  result.progress = fixNumber(Division(result.progress, 100).toFixed(), 2);
  result.registerChain = Object.values(_networkInfo).find(
    k => k.chainId === result.mintAssetSourceChainId
  )!.name;
  info.value = result;
  loading.value = false;
}

const totalCost = computed(() => {
  if (!mintCount.value || !info.value.mintFee) return '0';
  return Times(mintCount.value, info.value.mintFee);
});

const remainMintCount = computed(() => {
  const { mintCount, mintCountLimit, remainingTotalMintCount } = info.value;
  if (!mintCountLimit) return 1;
  const userLimit = mintCountLimit - mintCount!;
  return Math.min.apply(null, [userLimit, remainingTotalMintCount]);
});

function changeInput(val: string) {
  const reg = /^[1-9]\d*$/;
  if (reg.exec(val) || val === '') {
    const v = Number(val);
    if (v > remainMintCount.value) {
      mintCount.value = remainMintCount.value;
    } else {
      // @ts-ignore
      mintCount.value = val;
    }
  }
}

const feeAsset = computed(() => {
  if (!info.value.mintFeeAsset || !assetsList.value.length) {
    return {} as AssetItem;
  }
  return assetsList.value.find(v => v.assetKey === info.value.mintFeeAsset)!;
});

const btnText = computed(() => {
  const balance = feeAsset.value.available;
  if (!balance) {
    return t('transfer.transfer15');
  } else if (balance - totalCost.value < 0) {
    return t('transfer.transfer15');
  } else {
    return t('mint.mint60');
  }
});

const disabled = computed(() => {
  const balance = feeAsset.value.available;
  return (
    !check.value ||
    txLoading.value ||
    !remainMintCount.value ||
    !mintCount.value ||
    !Number(balance) ||
    balance - totalCost.value < 0
  );
});

async function handleMint() {
  txLoading.value = true;
  try {
    const { mintFeeAsset, mintFeeAssetDecimals } = info.value;
    const { provider, EVMAddress, pub } = getWalletInfo();
    const [assetChainId, assetId] = mintFeeAsset.split('-');
    const mint = {
      p: 'nerve-mint',
      op: 'mint',
      pid: '' + props.id
    };
    const result = await nerveswap.transfer.transfer({
      provider,
      from: nerveAddress.value,
      to: props.targetAddress,
      assetChainId: Number(assetChainId),
      assetId: Number(assetId),
      amount: timesDecimals(totalCost.value, mintFeeAssetDecimals),
      remark: JSON.stringify(mint),
      EVMAddress,
      pub
    });
    setTimeout(() => {
      handleResult(2, result);
      if (result.hash) {
        emit('refresh');
        emit('update:show', false);
      }
      txLoading.value = false;
    }, 2000);
  } catch (e) {
    console.log(e, 'mint-error');
    toastError(e);
    txLoading.value = false;
  }
}

const close = () => {
  //
};
</script>
<style lang="scss">
@import '../../assets/css/style.scss';
.mint-modal {
  .el-dialog__header {
    border: none !important;
    font-size: 20px;
    font-weight: 500;
    position: relative;
    img {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .info-item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 20px;
    .left,
    .right {
      width: 50%;
    }
    .left {
      color: $subLabelColor;
    }
    .id-info {
      font-size: 12px;
      color: $subLabelColor;
    }
    .mint-count-input {
      .el-input__inner {
        width: 132px;
        height: 36px;
        line-height: 36px;
        border-radius: 10px;
      }
    }
  }
  .cost {
    padding-top: 20px;
    .left {
      width: 100%;
    }
    .right {
      width: 100%;
      height: 44px;
      line-height: 44px;
      font-size: 15px;
      border-radius: 10px;
      margin-top: 10px;
      text-align: center;
      border: 1px solid $borderColor;
      background-color: #f7f9ff;
    }
  }
  .el-checkbox {
    .el-checkbox__inner {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      &::after {
        height: 8px;
        left: 6px;
        top: 2px;
        width: 4px;
      }
    }
    .el-checkbox__label {
      white-space: normal;
      font-size: 13px;
      line-height: 16px;
      color: #aab2c9;
    }
  }
  .confirm-btn {
    width: 100%;
    padding-top: 30px;
    button {
      width: 100%;
    }
  }
}
</style>
