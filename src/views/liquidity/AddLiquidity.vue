<template>
  <div class="add-liquidity" v-loading="state.loading">
    <div class="head title-label">
      <el-icon class="back" @click="handleBack">
        <back style="font-weight: 600" />
      </el-icon>
      <h3>
        {{
          state.insufficient
            ? $t('liquidity.liquidity12')
            : $t('liquidity.liquidity7')
        }}
      </h3>
    </div>
    <div class="create-liquidity-tip" v-show="state.insufficient">
      {{ $t('liquidity.liquidity10') }}
    </div>
    <custom-input
      v-model:inputVal="state.fromAmount"
      :icon="state.fromAsset && state.fromAsset.symbol"
      :assetList="fromAssetsList"
      :balance="state.fromAsset && state.fromAsset.available"
      :selectedAsset="state.fromAsset || null"
      @selectAsset="selectAsset($event, 'from')"
      @max="max('from')"
    ></custom-input>
    <div class="add">
      <img src="../../assets/img/add-liquid.svg" alt="" />
    </div>
    <custom-input
      v-model:inputVal="state.toAmount"
      :icon="state.toAsset && state.toAsset.symbol"
      :assetList="toAssetsList"
      :balance="state.toAsset && state.toAsset.available"
      :selectedAsset="state.toAsset || null"
      @selectAsset="asset => selectAsset(asset, 'to')"
      @max="max('to')"
    ></custom-input>
    <div class="liquidity-info" v-if="priceInfo">
      <div class="name">{{ $t('liquidity.liquidity8') }}</div>
      <div class="content">
        <div class="flex1">
          <div>{{ priceInfo.from_to }}</div>
          <p>
            {{ state.toAsset && state.toAsset.symbol }} Per
            {{ state.fromAsset && state.fromAsset.symbol }}
          </p>
        </div>
        <div class="flex1">
          <div>{{ priceInfo.to_from }}</div>
          <p>
            {{ state.fromAsset && state.fromAsset.symbol }} Per
            {{ state.toAsset && state.toAsset.symbol }}
          </p>
        </div>
        <div class="flex1">
          <div>{{ priceInfo.share }}%</div>
          <p>{{ $t('liquidity.liquidity11') }}</p>
        </div>
      </div>
    </div>
    <div class="confirm-wrap">
      <template v-if="props.nerveAddress">
        <el-button
          type="primary"
          v-if="state.insufficient"
          @click="createPair"
          :disabled="
            disableCreate || !!state.fromAmountError || !!state.toAmountError
          "
        >
          {{
            state.fromAmountError ||
            state.toAmountError ||
            $t('liquidity.liquidity13')
          }}
        </el-button>
        <el-button
          type="primary"
          v-else
          @click="addLiquidity"
          :disabled="
            disableAdd || !!state.fromAmountError || !!state.toAmountError
          "
        >
          {{
            state.fromAmountError ||
            state.toAmountError ||
            $t('liquidity.liquidity9')
          }}
        </el-button>
      </template>
      <template v-else>
        <AuthButton @loading="handleLoading" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  reactive,
  watch,
  nextTick,
  computed,
  onBeforeUnmount,
  onMounted,
  PropType
} from 'vue';
import AuthButton from '@/components/AuthButton.vue';
import CustomInput from '@/components/CustomInput.vue';
import {
  Minus,
  Division,
  fixNumber,
  timesDecimals,
  divisionAndFix,
  Times,
  divisionDecimals,
  Plus,
  isBeta
} from '@/utils/util';
import { useI18n } from 'vue-i18n';
import nerveswap from 'nerveswap-sdk';
import { AssetItem, AddLiquidityState } from './types';
import { DefaultAsset } from '@/views/swap/types';
import useToast from '@/hooks/useToast';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';

const props = defineProps({
  assetsList: {
    type: Array as PropType<AssetItem[]>,
    default: () => []
  },
  nerveAddress: String,
  defaultAsset: {
    type: Object as PropType<DefaultAsset>,
    default: () => {}
  }
});

const emit = defineEmits(['updateList', 'update:show']);

const { t } = useI18n();
const { toastError } = useToast();
let storedSwapPairInfo = {}; // 缓存的swapPairInfo
const state = reactive<AddLiquidityState>({
  feeRate: '0.3', // 千三的手续费
  fromAmount: '',
  toAmount: '',
  fromAsset: null,
  toAsset: null,
  fromAmountError: '',
  toAmountError: '',
  disableWatchFromAmount: false, // 停止监听fromAmount
  disableWatchToAmount: false, // 停止监听toAmount
  insufficient: false, // 流动性不足
  loading: false,
  disableCreate: false
});
let customType = 'from'; // 输入的input是from还是to， 默认from

// 所有链主资产assetKey
const mainAssetsKey = Object.values(_networkInfo).map(v => v.assetKey);
const USDTNKey = isBeta ? '5-102' : '9-220';
mainAssetsKey.push(USDTNKey);
const specialPair = ['1-276', '1-281']; // 遗留已添加流动性的交易对
const fromAssetsList = computed(() => {
  const toAssetKey = state.toAsset?.assetKey;
  if (!toAssetKey) {
    return props.assetsList;
  } else if (mainAssetsKey.includes(toAssetKey)) {
    return props.assetsList;
  } else if (specialPair.includes(toAssetKey)) {
    // 如果为遗留的交易对 可继续添加
    const newAssetsKey = [...mainAssetsKey].concat(specialPair);
    return props.assetsList?.filter(v => {
      return newAssetsKey.includes(v.assetKey);
    });
  } else {
    return props.assetsList?.filter(v => {
      return mainAssetsKey.includes(v.assetKey);
    });
  }
});

const toAssetsList = computed(() => {
  const fromAssetKey = state.fromAsset?.assetKey;
  if (!fromAssetKey) {
    return props.assetsList;
  } else if (mainAssetsKey.includes(fromAssetKey)) {
    return props.assetsList;
  } else if (specialPair.includes(fromAssetKey)) {
    // 如果为遗留的交易对 可继续添加
    const newAssetsKey = [...mainAssetsKey].concat(specialPair);
    return props.assetsList?.filter(v => {
      return newAssetsKey.includes(v.assetKey);
    });
  } else {
    return props.assetsList?.filter(v => {
      return mainAssetsKey.includes(v.assetKey);
    });
  }
});

function handleLoading(status: boolean) {
  state.loading = status;
}

function selectAsset(asset: AssetItem, type: string) {
  // console.log(asset, type, 9999);
  state.fromAmount = '';
  state.toAmount = '';
  if (type === 'from') {
    if (state.toAsset && state.toAsset.assetKey === asset.assetKey) {
      state.toAsset = { ...state.fromAsset } as AssetItem;
      state.fromAsset = asset;
    } else {
      state.fromAsset = asset;
      if (state.toAsset) {
        if (
          state.fromAsset &&
          state.fromAsset.assetKey === state.toAsset.assetKey
        ) {
          state.toAsset = null;
        }
      }
    }
  } else {
    if (state.fromAsset && asset.assetKey === state.fromAsset.assetKey) {
      state.fromAsset = { ...state.toAsset } as AssetItem;
      state.toAsset = asset;
    } else {
      state.toAsset = asset;
      if (
        state.fromAsset &&
        state.fromAsset.assetKey === state.toAsset.assetKey
      ) {
        state.fromAsset = null;
      }
    }
  }

  state.insufficient = false;

  storeSwapPairInfo();
}

async function storeSwapPairInfo(refresh = false) {
  const fromAssetKey = state.fromAsset?.assetKey;
  const toAssetKey = state.toAsset?.assetKey;
  const key = fromAssetKey + '_' + toAssetKey;
  if (fromAssetKey && toAssetKey) {
    const info = await nerveswap.liquidity.getPairInfo(
      fromAssetKey,
      toAssetKey,
      refresh
    );
    if (info) {
      storedSwapPairInfo[key] = info;
      state.insufficient = false;
      if (state.fromAmount && state.toAmount) {
        refreshRate();
      }
    } else {
      state.insufficient = true;
    }
  }
}

function max(type: string) {
  if (type === 'from') {
    state.fromAmount = state.fromAsset?.available || '';
  } else {
    state.toAmount = state.toAsset?.available || '';
  }
}
// 默认选择的资产
watch(
  () => props.defaultAsset,
  val => {
    if (val) {
      state.fromAsset = val.from;
      state.toAsset = val.to || null;
      storeSwapPairInfo();
    }
  },
  {
    deep: true,
    immediate: true
  }
);

// 监听fromAmount变化
watch(
  () => state.fromAmount,
  async val => {
    if (!state.disableWatchFromAmount) {
      customType = 'from';
    }
    if (val && state.fromAsset) {
      if (
        !Number(state.fromAsset.available) ||
        Minus(state.fromAsset.available, val).toNumber() < 0
      ) {
        state.fromAmountError = `${state.fromAsset.symbol || ''}${t(
          'transfer.transfer15'
        )}`;
      } else {
        state.fromAmountError = '';
      }
      if (state.insufficient) return;
      if (!state.disableWatchFromAmount) {
        const res = await getLiquidAmount(val, 'to'); // 通过from计算to
        if (res) {
          state.disableWatchToAmount = true; // 避免进入无限循环计算
          state.toAmount = res;
          // getSwapRate();
          await nextTick();
          state.disableWatchToAmount = false;
        } else {
          // getSwapRate(true);
        }
      }
    } else {
      state.toAmount = '';
      state.toAmountError = '';
      state.fromAmountError = '';
      // getSwapRate(true);
    }
  }
);
watch(
  () => state.toAmount,
  async val => {
    if (!state.disableWatchToAmount) {
      customType = 'to';
    }
    if (val && state.toAsset) {
      if (
        !Number(state.toAsset.available) ||
        Minus(state.toAsset.available, val).toNumber() < 0
      ) {
        state.toAmountError = `${state.toAsset.symbol || ''}${t(
          'transfer.transfer15'
        )}`;
      } else {
        state.toAmountError = '';
      }
      if (state.insufficient) return;
      if (!state.disableWatchToAmount) {
        const res = await getLiquidAmount(val, 'from'); // 通过to计算from
        if (res) {
          state.disableWatchFromAmount = true;
          state.fromAmount = res;
          // getSwapRate();
          await nextTick();
          state.disableWatchFromAmount = false;
        } else {
          // getSwapRate(true);
        }
      }
    } else {
      state.fromAmount = '';
      state.fromAmountError = '';
      state.toAmountError = '';
      // getSwapRate(true);
    }
  }
);
watch(
  () => props.assetsList,
  val => {
    if (val) {
      if (state.fromAsset) {
        const asset = val.find(
          asset => asset.assetKey === state.fromAsset?.assetKey
        );
        if (asset) {
          state.fromAsset = asset;
        }
      }
      if (state.toAsset) {
        const asset = val.find(
          asset => asset.assetKey === state.toAsset?.assetKey
        );
        if (asset) {
          state.toAsset = asset;
        }
      }
    }
  },
  {
    deep: true
  }
);

// 计算需添加的数量 type- 计算from/to的数量
async function getLiquidAmount(amount: string, type: string) {
  const amount_number = Number(amount);
  if (
    state.fromAsset &&
    state.toAsset &&
    !isNaN(amount_number) &&
    amount_number > 0
  ) {
    const fromAssetKey = state.fromAsset.assetKey;
    const toAssetKey = state.toAsset.assetKey;
    const fromDecimal =
      type === 'from' ? state.toAsset.decimals : state.fromAsset.decimals;
    const toDecimal =
      type === 'from' ? state.fromAsset.decimals : state.toAsset.decimals;
    amount = timesDecimals(amount, fromDecimal);

    const amountRes = await nerveswap.liquidity.calAddLiquidity({
      tokenAKey: fromAssetKey,
      tokenBKey: toAssetKey,
      amount
    });
    return amountRes
      ? divisionAndFix(amountRes.toString(), toDecimal, toDecimal)
      : '';
  } else {
    return '';
  }
}

async function refreshRate() {
  if (!state.fromAmount && !state.toAmount) return;
  let res;
  if (customType === 'from') {
    res = await getLiquidAmount(state.fromAmount, 'to'); // 通过from计算to
  } else if (customType === 'to') {
    res = await getLiquidAmount(state.toAmount, 'from'); // 通过from计算to
  }
  if (res) {
    state.disableWatchFromAmount = true;
    state.disableWatchToAmount = true; // 避免进入无限循环计算
    if (customType === 'from') {
      state.toAmount = res;
    } else {
      state.fromAmount = res;
    }
    // getSwapRate();
    await nextTick();
    state.disableWatchFromAmount = false;
    state.disableWatchToAmount = false;
  } else {
    // getSwapRate(true);
  }
}

const priceInfo = computed(() => {
  const { fromAmount, toAmount, fromAsset, toAsset } = state;
  if (!fromAsset || !toAsset) {
    return null;
  } else {
    const fromKey = fromAsset.assetKey;
    const toKey = toAsset.assetKey;
    const info = storedSwapPairInfo[fromKey + '_' + toKey];
    // console.log(info, 666);
    if (!info || info.reserveFrom == 0 || info.reserveTo == 0) {
      // 创建交易对
      let from_to = '-';
      let to_from = '-';
      let share = '0';
      console.log(Division(fromAmount, toAmount), 798798);
      if (fromAmount && toAmount) {
        from_to = fixNumber(Division(toAmount, fromAmount).toFixed(), 6);
        to_from = fixNumber(Division(fromAmount, toAmount).toFixed(), 6);
        share = '100';
      }
      return {
        from_to,
        to_from,
        share
      };
    } else {
      // 添加流动性
      const from_to = fixNumber(
        Division(
          divisionDecimals(info.reserveTo, toAsset.decimals),
          divisionDecimals(info.reserveFrom, fromAsset.decimals)
        ).toFixed(),
        6
      );
      const to_from = fixNumber(
        Division(
          divisionDecimals(info.reserveFrom, fromAsset.decimals),
          divisionDecimals(info.reserveTo, toAsset.decimals)
        ).toFixed(),
        6
      );
      let share = '0';
      if (fromAmount && toAmount) {
        const allReserveFrom = Plus(
          timesDecimals(fromAmount, fromAsset.decimals),
          info.reserveFrom
        );
        share = fixNumber(
          Division(
            timesDecimals(fromAmount, fromAsset.decimals),
            allReserveFrom
          ).toFixed(),
          4
        );
        share =
          Minus(share, 0.0001).toNumber() > 0
            ? fixNumber(Times(share, 100).toFixed(), 2)
            : '<0.01';
      }
      return {
        from_to,
        to_from,
        share
      };
    }
  }
});

const disableCreate = computed(() => {
  return (
    !state.fromAmount ||
    !state.fromAsset?.symbol ||
    !state.toAmount ||
    !state.toAsset?.symbol ||
    !props.nerveAddress ||
    state.disableCreate
  );
});

const disableAdd = computed(() => {
  return (
    !state.fromAmount ||
    !state.fromAsset?.symbol ||
    !state.toAmount ||
    !state.toAsset?.symbol ||
    state.insufficient ||
    !props.nerveAddress
  );
});

const { getWalletInfo, handleResult } = useBroadcastNerveHex();

async function createPair() {
  const { provider, EVMAddress, pub } = getWalletInfo();
  const { fromAsset, toAsset } = state;
  if (fromAsset && toAsset) {
    state.loading = true;
    try {
      const res = await nerveswap.liquidity.createPair({
        provider,
        from: props.nerveAddress!,
        tokenA: {
          assetChainId: fromAsset.chainId,
          assetId: fromAsset.assetId
        },
        tokenB: {
          assetChainId: toAsset.chainId,
          assetId: toAsset.assetId
        },
        remark: '',
        EVMAddress,
        pub
      });
      handleResult(61, res);
      if (res && res.hash) {
        refreshNewPair(fromAsset.assetKey, toAsset.assetKey);
      }
    } catch (e) {
      console.log(e, 'Create Pair-error');
      toastError(e);
    }
    state.loading = false;
  }
}

let refreshPairTimer: number;
// 创建流动性后刷新缓存的交易对信息，直到新创建的交易对生效
function refreshNewPair(fromKey: string, toKey: string) {
  const key = fromKey + '_' + toKey;
  state.disableCreate = true;
  refreshPairTimer = window.setInterval(() => {
    if (storedSwapPairInfo[key]) {
      state.disableCreate = false;
      clearInterval(refreshPairTimer);
    } else {
      storeSwapPairInfo(true);
    }
  }, 2000);
}
onBeforeUnmount(() => {
  clearInterval(refreshPairTimer);
});

async function addLiquidity() {
  const { fromAsset, toAsset, fromAmount, toAmount } = state;
  const { provider, EVMAddress, pub } = getWalletInfo();
  if (fromAsset && toAsset) {
    state.loading = true;
    try {
      const amountA = timesDecimals(fromAmount, fromAsset.decimals);
      const amountB = timesDecimals(toAmount, toAsset.decimals);

      const res = await nerveswap.liquidity.addLiquidity({
        provider,
        from: props.nerveAddress!,
        tokenA: {
          assetChainId: fromAsset.chainId,
          assetId: fromAsset.assetId,
          amount: amountA
        },
        tokenB: {
          assetChainId: toAsset.chainId,
          assetId: toAsset.assetId,
          amount: amountB
        },
        remark: '',
        EVMAddress,
        pub
      });
      handleResult(64, res);

      if (res && res.hash) {
        state.fromAmount = '';
        state.toAmount = '';
        setTimeout(() => {
          emit('updateList');
        }, 200);
      }
    } catch (e) {
      console.log(e, 'Add-Liquidity-error');
      toastError(e);
    }
    state.loading = false;
  }
}

function handleBack() {
  emit('update:show', false);
}

let timer: number; // 5s刷新一次流动性兑换比例
onMounted(() => {
  timer = window.setInterval(() => {
    storeSwapPairInfo(true);
  }, 5000);
});
onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style lang="scss" scoped>
@import '../../assets/css/style.scss';
.add-liquidity {
  overflow: hidden;
  padding: 30px;
  .head {
    position: relative;
    margin-bottom: 40px;
    h3 {
      text-align: center;
      font-size: 24px;
      line-height: 1;
    }
    .back {
      position: absolute;
      top: 0;
      left: 0;
      cursor: pointer;
      font-weight: 600;
      font-size: 30px;
    }
  }
  .create-liquidity-tip {
    padding: 16px 20px;
    font-size: 14px;
    text-align: center;
    background-color: #e3eeff;
    margin: -20px 0 20px;
    border-radius: 10px;
    color: #4a5ef2;
  }
  .add {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 12px 0;
  }
  .liquidity-info {
    margin-top: 30px;
    .name {
      color: $labelColor;
      margin-bottom: 8px;
    }
    .content {
      //border: 1px solid #e4efff;
      //background-color: #242449;
      border: 1px solid #ced3e5;
      border-radius: 15px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
      /* height: 94px; */
      padding: 15px;
      .flex1 {
        /* height: 100%; */
        /* flex: 1; */
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        div {
          font-size: 18px;
        }
        p {
          font-size: 14px;
          color: $labelColor;
        }
      }
    }
  }
  .confirm-wrap {
    margin: 40px 0 20px;
  }
  @media screen and (max-width: 1200px) {
    padding: 15px;
  }
  @media screen and (max-width: 500px) {
    .head {
      margin-bottom: 30px;
      h3 {
        font-size: 20px;
      }
      .back {
        font-size: 24px;
      }
    }
    .liquidity-info {
      margin-top: 20px;
      .name {
        font-size: 15px;
      }
      .content {
        padding: 8px;
        .flex1 {
          padding: 0 5px;
          div {
            font-size: 16px;
          }
          p {
            font-size: 14px;
            color: #7e87c2;
          }
        }
      }
    }
    .confirm-wrap {
      margin: 30px 0 20px;
    }
  }
}
</style>
