<template>
  <div>
    <div class="info-bar" v-if="showInfo">
      <div class="text-e3 size-20">{{ $t('liquidity.liquidity15') }}</div>
      <div class="detail-info">
        <div>
          <span>{{ props.info && props.info.token0.symbol }}</span>
          <span>{{ (!!expectedAmountA && expectedAmountA) || 0 }}</span>
        </div>
        <div>
          <span>{{ props.info && props.info.token1.symbol }}</span>
          <span>{{ (!!expectedAmountB && expectedAmountB) || 0 }}</span>
        </div>
      </div>
    </div>
    <div class="detail-bar">
      <!--:value="quitNumber"-->
      <el-input
        placeholder=""
        v-model="quitNumber"
        @input="handleInput"
      ></el-input>
      <div class="text-red" v-if="amountError">{{ amountError }}</div>
      <div class="rate">
        <span
          class="click"
          v-for="(item, index) in rates"
          :key="item"
          :class="{ active_click: currentIndex === index }"
          @click="getNumber(item, index)"
        >
          {{ item }}%
        </span>
      </div>
      <div class="confirm-wrap">
        <el-button
          :disabled="quitNumber === '' || !!amountError"
          @click="quit"
          type="primary"
        >
          {{ $t('liquidity.liquidity6') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, PropType } from 'vue';
import { Times, timesDecimals, divisionDecimals, Minus } from '@/utils/util';
import { useI18n } from 'vue-i18n';
import nerveswap from 'nerveswap-sdk';
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
    handleResult(65, res);
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

<style lang="scss" scoped>
@import '../../assets/css/style.scss';
.detail-bar {
  min-height: 174px;
  padding: 20px;
  border-radius: 20px;
  background-color: $detailBar;
  //border: 1px solid #e4efff;
  .rate {
    margin: 10px 0 20px;
    display: flex;
    span {
      width: 65px;
      height: 28px;
      background-color: #e4e7ff;
      color: #4a5ef2;
      text-align: center;
      line-height: 28px;
      border-radius: 6px;
      margin-right: 30px;
      &:last-child {
        margin-right: 0;
      }
      &.active_click {
        background-color: #4a5ef2;
        color: #ffffff;
      }
    }
  }
  :deep(.el-input) {
    //border: 1px solid #e4efff;
    .el-input__inner {
      //border: 0;
    }
  }
  @media screen and (max-width: 500px) {
    padding: 16px;
    :deep(.el-input) {
      line-height: 36px;
      .el-input__inner {
        height: 36px;
        line-height: 36px;
      }
    }

    .rate {
      margin: 10px 0 20px;
      display: flex;
      flex-wrap: wrap;
      span {
        width: 22%;
        margin-right: 4%;
      }
    }
  }
}
.info-bar {
  .text-e3 {
    color: $labelColor;
  }
  .size-20 {
    font-size: 14px;
  }
  .detail-info {
    font-size: 13px;
    div {
      display: flex;
      margin-top: 15px;
      align-items: center;
      justify-content: space-between;
      &:nth-child(2) {
        margin-bottom: 15px;
      }
    }
  }
  @media screen and (max-width: 500px) {
    .detail-info {
      div {
        margin-top: 8px;
      }
    }
  }
}
.text-red {
  color: #f56c6c;
  font-size: 12px;
}
</style>
