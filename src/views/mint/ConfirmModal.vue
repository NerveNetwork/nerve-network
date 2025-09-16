<template>
  <Modal
    title="Mint"
    container-class="mt-[15vh]"
    v-model="visible"
    :show-close="false"
    show-back
    :closeOnBackdropClick="false"
    @back="emit('update:show', false)"
    @closed="close"
  >
    <div v-loading="loading">
      <div class="flex items-center justify-between mb-4">
        <div class="text-label">{{ $t('mint.mint37') }}</div>
        <div class="text-right">
          <div class="text-base font-medium">{{ info.mintAssetSymbol }}</div>
          <div class="text-xs text-label">
            {{ info.registerChain }} | ID:{{ info.mintAsset }}
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="text-label">{{ $t('mint.mint51') }}</div>
        <div>
          {{ $thousands(info.mintEach) }}/{{ $thousands(info.mintMax) }}
        </div>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="text-label">{{ $t('mint.mint41') }}</div>
        <div>
          {{ $thousands(info.mintFee) }} {{ info.mintFeeAssetSymbol }}
        </div>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="text-label">{{ $t('mint.mint52') }}</div>
        <div>{{ remainMintCount }}/{{ info.mintCountLimit }}</div>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="text-label">{{ $t('mint.mint42') }}</div>
        <div>
          {{ info.poolRatio }}%｜{{ info.lpLockDay }}
          {{ $t('mint.mint56') }}
        </div>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="text-label">{{ $t('mint.mint40') }}</div>
        <div>{{ info.assetUnlockTime }}</div>
      </div>
      <template v-if="remainMintCount">
        <div class="mb-6">
          <div class="text-label mb-3">{{ $t('mint.mint53') }}</div>
          <div class="relative">
            <Input :value="mintCount"
              @input="changeInput" class="bg-input" input-class="text-center" />
            <span v-if="!mintCount" class="el-form-item__error">
              {{ $t('mint.mint64') }}
            </span>
          </div>
          <!-- <div class="right" style="position: relative">
            <el-input
              :model-value="mintCount"
              @input="changeInput"
              class="mint-count-input"
            />
            <span v-if="!mintCount" class="el-form-item__error">
              {{ $t('mint.mint64') }}
            </span>
          </div> -->
        </div>
        <div class="mb-6">
          <div class="text-label flex justify-between mb-3">
            <span>{{ $t('mint.mint59') }}</span>
            <span>Balance: {{ feeAsset.available || 0 }}</span>
          </div>
          <div class="h-12 leading-[48px] bg-[#878DAB66] rounded-xl text-center">
            {{ totalCost }} {{ info.mintFeeAssetSymbol }}
          </div>
          <!-- <div class="left flex-between">
            <span>{{ $t('mint.mint59') }}</span>
            <span>
              {{ $t('public.public16') }}
              {{ feeAsset.available || 0 }} {{ info.mintFeeAssetSymbol }}
            </span>
          </div>
          <div class="right">{{ totalCost }} {{ info.mintFeeAssetSymbol }}</div> -->
        </div>
        <!-- <el-checkbox :label="$t('mint.mint54')" v-model="check"></el-checkbox> -->
        <Checkbox v-model="check" :text="$t('mint.mint54')" /> 
        <div class="mt-7">
          <Button :loading="txLoading" :disabled="disabled" @click="handleMint" class="w-full">{{ btnText }}</Button>
        </div>
        <!-- <div class="confirm-btn">
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
        </div> -->
      </template>
      <template v-else>
        <div class="pt-4">
          <Button disabled class="w-full">{{ $t('mint.mint47') }}</Button>
        </div>
        <!-- <div class="confirm-btn">
          <el-button type="primary" disabled>
            {{ $t('mint.mint47') }}
          </el-button>
        </div> -->
      </template>
    </div>
  </Modal>
</template>
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import nerveswap from 'nerveswap-sdk';
import Modal from '@/components/Base/Modal/index.vue'
import Input from '@/components/Base/Input/index.vue'
import Checkbox from '@/components/Base/Checkbox/index.vue'
import Button from '@/components/Base/Button/index.vue'
import { useWalletStore } from '@/store/wallet';
import useToast from '@/hooks/useToast';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import {
  divisionDecimals,
  fixNumber,
  Division,
  Times,
  timesDecimals,
  toThousands
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

const walletStore = useWalletStore()
const { nerveAddress, assetsList } = storeToRefs(walletStore)

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
  console.log(result, 234);
  info.value = result;
  loading.value = false;
}

const totalCost = computed(() => {
  if (!mintCount.value || !info.value.mintFee) return '0';
  return Times(mintCount.value, info.value.mintFee).toFixed();
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
    const { mintFeeAsset, mintFeeAssetDecimals, mintFeeAssetSymbol } = info.value;
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
      const amoutnRemark = `${toThousands(totalCost.value)} ${mintFeeAssetSymbol}`
      handleResult(2, result, amoutnRemark);
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
