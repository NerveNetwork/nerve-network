<template>
  <div class="bg-card2 p-4 rounded-b-xl">
    <div class="mb-4" v-if="showInfo">
      <div class="text-base">{{ $t('liquidity.liquidity15') }}</div>
      <div>
        <div class="flex justify-between py-3">
          <span class="text-label">{{ props.info && props.info.token0.symbol }}</span>
          <span>{{ (!!expectedAmountA && expectedAmountA) || 0 }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-label">{{ props.info && props.info.token1.symbol }}</span>
          <span>{{ (!!expectedAmountB && expectedAmountB) || 0 }}</span>
        </div>
      </div>
    </div>
    <div class="detail-bar">
      <Input v-model="quitNumber"
        @input="handleInput" />
      <div class="text-error" v-if="amountError">{{ amountError }}</div>
      <div class="rate flex mt-3 mb-5 gap-5">
        <div
          :class="[
            'flex-1 cursor-pointer h-7 leading-7 text-center rounded-md text-white',
            currentIndex === index ? 'bg-primary' : 'bg-card'
          ]"
          v-for="(item, index) in rates"
          :key="item"
          @click="getNumber(item, index)"
        >
          {{ item }}%
        </div>
      </div>
      <div class="pt-6">
        <Button class="w-full" :disabled="quitNumber === '' || !!amountError"
          @click="quit">{{ $t('liquidity.liquidity6') }}</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, PropType } from 'vue';
import { Times, timesDecimals, divisionDecimals, Minus, toThousands } from '@/utils/util';
import { useI18n } from 'vue-i18n';
import nerveswap from 'nerveswap-sdk';
import Input from '@/components/Base/Input/index.vue'
import Button from '@/components/Base/Button/index.vue'
import useToast from '@/hooks/useToast';
import { LiquidityItem } from './types';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';

const props = defineProps({
  info: {
    type: Object as PropType<LiquidityItem>,
    default: () => {}
  },
  nerveAddress: String
});

const emit = defineEmits(['loading', 'updateList']);

const { t } = useI18n();
const { toastError } = useToast();
const rates = ref([25, 50, 75, 100]);
const quitNumber = ref('');
const showInfo = ref(false);
const expectedAmountA = ref('');
const expectedAmountB = ref('');
const currentIndex = ref(-1);
const amountError = ref('');
function handleInput(val: string) {
  if (!Number(val)) showInfo.value = false;
  const availableLiquidity = props.info.amount;
  currentIndex.value = -1;
  if (Minus(availableLiquidity, val).toNumber() < 0) {
    showInfo.value = false;
    amountError.value = t('liquidity.liquidity16');
    return;
  } else {
    amountError.value = '';
    if (Number(val) !== 0) {
      showInfo.value = true;
      calRemoveLiquidity();
    } else {
      showInfo.value = false;
    }
  }
}

async function getNumber(item: number, index: number) {
  amountError.value = '';
  currentIndex.value = index;
  showInfo.value = true;
  quitNumber.value = Times(props.info.amount, item / 100).toFixed();
  await calRemoveLiquidity();
}
// 计算撤出流动性将获得的资产
async function calRemoveLiquidity() {
  const { token0, token1, lpTokenAmount } = props.info;
  const tokenAStr = `${token0['assetChainId']}-${token0['assetId']}`;
  const tokenBStr = `${token1['assetChainId']}-${token1['assetId']}`;
  const { tokenAAmount, tokenBAmount } =
    await nerveswap.liquidity.calRemoveLiquidity({
      tokenAKey: tokenAStr,
      tokenBKey: tokenBStr,
      amount: timesDecimals(quitNumber.value, lpTokenAmount.token.decimals)
    });
  expectedAmountA.value = divisionDecimals(tokenAAmount, token0.decimals);
  expectedAmountB.value = divisionDecimals(tokenBAmount, token1.decimals);
}

const { handleResult, getWalletInfo } = useBroadcastNerveHex();
async function quit() {
  if (!Number(quitNumber.value)) return;
  const { provider, EVMAddress, pub } = getWalletInfo();
  try {
    emit('loading', true);
    const LP = props.info.lpTokenAmount;
    const tokenA = props.info.token0;
    const tokenB = props.info.token1;
    const removeAmount = timesDecimals(
      quitNumber.value,
      LP.token.decimals
    ).split('.')[0];

    const res = await nerveswap.liquidity.removeLiquidity({
      provider,
      from: props.nerveAddress!,
      removeAmount,
      tokenA: {
        assetChainId: tokenA.assetChainId,
        assetId: tokenA.assetId
      },
      tokenB: {
        assetChainId: tokenB.assetChainId,
        assetId: tokenB.assetId
      },
      tokenLP: {
        assetChainId: LP.token.assetChainId,
        assetId: LP.token.assetId
      },
      EVMAddress,
      pub
    });
    const amounRemark = `${toThousands(quitNumber.value)} ${LP.token.symbol}`
    handleResult(65, res, amounRemark);
    if (res && res.hash) {
      quitNumber.value = '';
      setTimeout(() => {
        emit('updateList');
      }, 200);
    }
  } catch (e) {
    console.log(e, 'Remove-liquidity-error');
    toastError(e);
  }
  emit('loading', false);
}
</script>
