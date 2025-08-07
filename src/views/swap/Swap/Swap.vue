<template>
  <div>
    <div class="swap pd_40_rd_20" v-loading="loading">
      <div class="icon-wrap flex-between">
        <div class="left">
          <i
            class="iconfont icon-zhankai click"
            @click="toggleExpand"
            v-if="fromAsset && toAsset"
          ></i>
        </div>
        <div class="right flex-center">
          <span
            @click="forceRefresh"
            :class="{ refreshing: !canRefresh }"
            :style="{ cursor: canRefresh ? 'pointer' : 'not-allowed' }"
          >
            <i class="iconfont icon-shuaxin"></i>
          </span>
          <span><i class="iconfont icon-fenxiang" @click="copyPair"></i></span>
          <span @click="toggleSettingDialog">
            <i class="iconfont icon-shezhi"></i>
          </span>
        </div>
      </div>
      <div class="swap-area">
        <div class="from-symbol">
          <custom-input
            v-model:inputVal="fromAmount"
            @input="event => getToByFrom(event.target.value)"
            ref="customInput"
            :label="$t('trading.trading4')"
            :icon="fromAsset && fromAsset.symbol"
            :assetList="assetsList"
            :hotAssets="hotAssets"
            :balance="fromAsset && fromAsset.available"
            :selectedAsset="fromAsset || null"
            @selectAsset="selectAsset($event, 'from')"
            @max="max('from')"
          ></custom-input>
        </div>
        <div class="change-direction">
          <img
            @click="changeDirection"
            class="click"
            src="../../../assets/img/swap-to.svg"
            alt=""
          />
        </div>
        <div class="to-symbol">
          <custom-input
            v-model:inputVal="toAmount"
            @input="event => getFromByTo(event.target.value)"
            :label="$t('trading.trading3')"
            :icon="toAsset && toAsset.symbol"
            :assetList="assetsList"
            :hotAssets="hotAssets"
            :balance="toAsset && toAsset.available"
            :selectedAsset="toAsset || null"
            @selectAsset="asset => selectAsset(asset, 'to')"
            @max="max('to')"
          ></custom-input>
        </div>
        <div class="exchange-rate" v-if="swapRate">
          {{ swapRate }}
          <span class="change-icon" @click="toggleDirection">
            <img src="@/assets/img/exchange.svg" alt="" />
          </span>
        </div>
        <div class="confirm-wrap">
          <el-button
            type="primary"
            v-if="nerveAddress"
            :class="{
              deep_color:
                !toAmountError &&
                !fromAmountError &&
                !insufficient &&
                priceImpactColor === 'red'
            }"
            :disabled="
              disableTx ||
              !!fromAmountError ||
              !!toAmountError ||
              impactButton === 2
            "
            @click="swapTrade"
          >
            {{
              confirmText
              /* insufficient
              ? $t("trading.trading17")
              : impactButton === 1
              ? $t("trading.trading19")
              : fromAmountError || $t("public.public10")*/
            }}
          </el-button>
          <template v-else>
            <AuthButton @loading="handleLoading" />
          </template>
        </div>
      </div>
      <div
        v-show="swapRate"
        :class="['setting-and-route', swapRate ? 'show' : '']"
      >
        <div class="swap-setting-info">
          <div class="info-item flex-between">
            <div class="left">{{ $t('trading.trading6') }}</div>
            <div class="right">{{ protectPercent || '0.5' }}%</div>
          </div>
          <div class="info-item flex-between">
            <div class="left">{{ $t('trading.trading7') }}</div>
            <div
              class="right"
              :style="{
                color:
                  (priceImpactFloat === '<0.01%' && 'green') || priceImpactColor
              }"
            >
              {{ priceImpactFloat }}
            </div>
          </div>
          <div class="info-item flex-between" v-if="direction === 'from'">
            <div class="left">{{ $t('trading.trading8') }}</div>
            <div class="right">
              {{ minReceive }} {{ toAsset && toAsset.symbol }}
            </div>
          </div>
          <div class="info-item flex-between" v-if="direction === 'to'">
            <div class="left">{{ $t('trading.trading15') }}</div>
            <div class="right">
              {{ maxSale }} {{ fromAsset && fromAsset.symbol }}
            </div>
          </div>
          <div class="info-item flex-between">
            <div class="left">{{ $t('trading.trading9') }}</div>
            <div class="right">
              {{ fee }} {{ fromAsset && fromAsset.symbol }}
            </div>
          </div>
        </div>
        <div class="swap-route">
          <div class="name">{{ $t('trading.trading10') }}</div>
          <div class="route-network flex-center">
            <div
              class="route-item"
              v-for="(item, index) in routesSymbol"
              :key="item.assetKey"
            >
              <div class="flex-center">
                <symbol-icon
                  :icon="item.icon"
                  :asset-key="item.assetKey"
                ></symbol-icon>
                <span>{{ item.icon }}</span>
              </div>
              <el-icon
                class="icon-arrow-right"
                v-if="index !== routesSymbol.length - 1"
              >
                <arrow-right />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
      <SwapSetting
        v-model:show="settingDialog"
        v-model:slippageTolerance="protectPercent"
        @close="setUserSlippage"
      />
    </div>
    <p class="swap-to-asset">
      <span @click="toAssetPage">{{ $t('trading.trading49') }}</span>
    </p>
  </div>
</template>

<script lang="ts">
import {
  PropType,
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
  getCurrentInstance
} from 'vue';
import CustomInput from '@/components/CustomInput.vue';
import AuthButton from '@/components/AuthButton.vue';
import SymbolIcon from '@/components/SymbolIcon.vue';
import SwapSetting from './SwapSetting.vue';
import {
  Division,
  divisionAndFix,
  divisionDecimals,
  fixNumber,
  Minus,
  Times,
  timesDecimals,
  tofix,
  formatFloat,
  getCurrentAccount
} from '@/utils/util';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import nerve from 'nerve-sdk-js';
import config from '@/config';
import useToast from '@/hooks/useToast';
import useStoreState from '@/hooks/useStoreState';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import { ComponentInternalInstance } from '@vue/runtime-core';
import { AssetItem, DefaultAsset, SwapState, HotAsset } from '../types';
import { Account } from '@/store/types';
import storage from '@/utils/storage';
import nerveswap from 'nerveswap-sdk';

export default defineComponent({
  name: 'swap',
  components: {
    CustomInput,
    SymbolIcon,
    AuthButton,
    SwapSetting
  },
  props: {
    assetsList: {
      type: Array as PropType<AssetItem[]>,
      default: () => []
    },
    hotAssets: {
      type: Array as PropType<HotAsset[]>,
      default: () => []
    },
    defaultAsset: {
      type: Object as PropType<DefaultAsset>,
      default: () => {}
    }
  },
  setup(props, context) {
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const router = useRouter();
    const { t } = useI18n();
    const { toastError } = useToast();
    const { nerveAddress } = useStoreState();
    const state = reactive<SwapState>({
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
      protectPercent: '', // 划点保护
      // protectSets: ["0.5", "1", "3"],
      routesSymbol: [],
      fee: '',
      priceImpact: '', // 价格影响
      direction: '',
      protectError: '',
      showLoading: false
    });

    const fee = ref('0');

    const canRefresh = ref(true); // can click to refresh
    const stopRefresh = ref(false); // stop interval refresh

    const { getWalletInfo, handleResult } = useBroadcastNerveHex();

    const swap = new nerveswap.swap();

    onMounted(() => {
      const currentAccount = getCurrentAccount(nerveAddress.value);
      state.protectPercent = currentAccount?.slippageTolerance || '0.5';
      /* swap
        .getSwapInfo({
          fromAssetKey: '5-72',
          toAssetKey: '2-1',
          amount: timesDecimals(1, 18)
          // direction: 'to'
        })
        .then((res: any) => console.log(res, '==res==')); */
      // nerveswap.getSwapTx('', '5-1', '2-1', '100000000', '0.5')

      /* nerveswap.swapTrade({
        provider: 'ethereum',
        from: 'TNVTdTSPRnXkDiagy7enti1KL75NU5AxC9sQA',
        fromAssetKey: '5-72',
        toAssetKey: '5-73',
        amount: '1000000000000000000',
        EVMAddress: '0xc11D9943805e56b630A401D4bd9A29550353EFa1',
        pub: '0369b20002bc58c74cb6fd5ef564f603834393f53bed20c3314b4b7aba8286a7e0'
      }); */
    });

    function setUserSlippage() {
      const accountList: Account[] = storage.get('accountList') || [];
      accountList.map(v => {
        if (v.address.NERVE === nerveAddress.value) {
          v.slippageTolerance = state.protectPercent;
        }
      });
      storage.set('accountList', accountList);
    }

    const loading = ref(false);
    function handleLoading(status: boolean) {
      loading.value = status;
    }
    // 选择swap资产 asset-选择的资产, type-from/to
    async function selectAsset(asset: AssetItem, type: string) {
      // console.log(asset, type, 9999);
      if (!asset) return false;
      state.fromAmount = '';
      state.toAmount = '';
      state.priceImpact = '';
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

      getSwapRate(true);
      context.emit('updateRate', '');

      if (
        state.toAsset &&
        state.fromAsset &&
        state.fromAsset.assetKey &&
        state.toAsset.assetKey
      ) {
        swap.checkIsSpecialSwap();
        context.emit('selectAsset', state.fromAsset, state.toAsset);
        storeSwapPairInfo(false, false);
        storeSwapPairInfo(false, true);
      } else {
        context.emit('updateRate', '');
      }
    }

    function changeDirectionType(type: string) {
      state.direction = type;
    }

    // 缓存交易对的兑换信息 refresh-刷新, isTemp-反向计算
    async function storeSwapPairInfo(refresh = false, isTemp = false) {
      let fromAssetKey, toAssetKey, tokenInAmount, tokenInDecimal;
      if (!isTemp) {
        fromAssetKey = state.fromAsset?.assetKey;
        toAssetKey = state.toAsset?.assetKey;
        tokenInAmount = state.fromAmount || '1';
        tokenInDecimal = state.fromAsset?.decimals;
      } else {
        fromAssetKey = state.toAsset?.assetKey;
        toAssetKey = state.fromAsset?.assetKey;
        tokenInAmount = state.toAmount || '1';
        tokenInDecimal = state.toAsset?.decimals;
      }
      if (!fromAssetKey || !toAssetKey) return;
      const amount = timesDecimals(tokenInAmount, tokenInDecimal);
      await swap.storePairInfo(fromAssetKey, toAssetKey, amount, refresh);

      // console.log(state.direction,  state.fromAmount, state.toAmount, isTemp, 999999999999999)
      if (state.direction && state.fromAmount && state.toAmount && !isTemp) {
        // refreshRate();
      }

      if (!isTemp) {
        // getSwapAmount('1', 'from', true);
      }
    }

    async function changeDirection() {
      if (!state.fromAsset || !state.toAsset) {
        return false;
      }
      const tempToAsset = { ...state.toAsset };
      const tempFromAsset = { ...state.fromAsset };
      state.fromAsset = tempToAsset;
      state.toAsset = tempFromAsset;
      await storeSwapPairInfo(false, false);

      // getSwapAmount('1', 'from', true);
      context.emit('selectAsset', state.fromAsset, state.toAsset);
      await getAmountByToggleSwap();
    }

    // 通过from计算to
    async function getToByFrom(val: string) {
      // console.log(val, '-----getToByFrom-----')
      changeDirectionType('from');
      if (val) {
        if (!state.fromAsset || !state.toAsset) return false;
        if (
          !Number(state.fromAsset.available) ||
          // @ts-ignore
          Minus(state.fromAsset.available, val) < 0
        ) {
          state.fromAmountError =
            ((state.fromAsset && state.fromAsset.symbol) || '') +
            ' ' +
            t('transfer.transfer15');
        } else {
          state.fromAmountError = '';
        }

        const [res, priceImpact] = await getSwapAmount(val, 'from'); // 通过from计算to
        state.priceImpact = priceImpact || '0';
        state.insufficient = !Number(res);
        if (Number(res)) {
          state.toAmount = res;
          getSwapRate(false);
        } else {
          getSwapRate(true);
        }
      } else {
        state.priceImpact = '';
        // if (!state.fromAmountError) {
        state.toAmount = '';
        state.fromAmountError = '';
        // }
        getSwapRate(true);
      }
    }
    // 通过to计算from
    async function getFromByTo(val: string) {
      // console.log(val, '-----getFromByTo-----')
      changeDirectionType('to');
      if (val) {
        if (!state.fromAsset || !state.toAsset) return false;
        const [res, priceImpact] = await getSwapAmount(val, 'to'); // 通过to计算from
        // console.log(res, priceImpact, 666);
        state.priceImpact = priceImpact || '0';
        state.insufficient = !Number(res);
        if (Number(res)) {
          state.fromAmount = res;
          getSwapRate(false);
        } else {
          getSwapRate(true);
        }
      } else {
        state.priceImpact = '';
        state.fromAmount = '';
        state.fromAmountError = '';
        getSwapRate(true);
      }
    }

    async function getAmountByToggleSwap() {
      const fromAmount = state.fromAmount;
      const toAmount = state.toAmount;
      state.fromAmount = '';
      state.toAmount = '';
      // console.log(state.customerType, fromAmount, toAmount);
      if (state.direction === 'from') {
        state.toAmount = fromAmount;
        await getFromByTo(fromAmount);
      } else if (state.direction === 'to') {
        state.fromAmount = toAmount;
        await getToByFrom(toAmount);
      }
    }

    // 监听fromAmount变化
    /* watch(
      () => state.fromAmount,
      async val => {
        await getToByFrom(val);
      }
    );
    watch(
      () => state.toAmount,
      async val => {
        await getFromByTo(val);
      },
      {
        deep: true
      }
    ); */
    watch(
      () => props.defaultAsset,
      val => {
        if (val) {
          state.fromAsset = val.from;
          state.toAsset = val.to || null;
          if (val.from && val.to) {
            storeSwapPairInfo();
          }
        }
      },
      { immediate: true, deep: true }
    );
    watch(
      () => props.assetsList,
      val => {
        if (val) {
          if (state.fromAsset) {
            const fromAsset = val.find(
              asset =>
                state.fromAsset && asset.assetKey === state.fromAsset.assetKey
            );
            state.fromAsset = fromAsset || null;
          }
          if (state.toAsset) {
            const toAsset = val.find(
              asset =>
                state.toAsset && asset.assetKey === state.toAsset.assetKey
            );
            state.toAsset = toAsset || null;
          }
        }
      },
      {
        deep: true
      }
    );

    async function refresh() {
      const startTime = new Date().getTime();
      try {
        canRefresh.value = false;
        await storeSwapPairInfo(true);
        await storeSwapPairInfo(true, true);
        refreshRate();
      } catch (e) {
        //
      }
      const endTime = new Date().getTime();
      const diff = endTime - startTime;
      if (diff < 1500) {
        setTimeout(() => {
          canRefresh.value = true;
        }, 1500 - diff);
      } else {
        canRefresh.value = true;
      }
    }
    async function forceRefresh() {
      if (timer) clearInterval(timer);
      await refresh();
      timer = window.setInterval(async () => {
        await refresh();
      }, 10000);
    }

    async function refreshRate() {
      if (!state.fromAmount && !state.toAmount) return;
      if (stopRefresh.value) return;
      let calResult;
      if (state.direction === 'from') {
        calResult = await getSwapAmount(state.fromAmount, 'from'); // 通过from计算to
      } else {
        calResult = await getSwapAmount(state.toAmount, 'to'); // 通过from计算to
      }
      const res = calResult[0];
      const priceImpact = calResult[1];
      state.priceImpact = priceImpact || '0';
      // console.log(res, "fff");
      state.insufficient = !Number(res);
      if (Number(res)) {
        if (state.direction === 'from') {
          state.toAmount = res;
        } else {
          state.fromAmount = res;
        }
        getSwapRate(false);
      } else {
        getSwapRate(true);
      }
    }

    let timer: number; // 5s刷新一次交易对信息&兑换比例
    onMounted(() => {
      timer = window.setInterval(async () => {
        await refresh();
      }, 10000);
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
    });

    // 计算能兑换的数量 direction- 计算from/to的数量, getInitialRate- 计算兑换比例1/n
    async function getSwapAmount(
      amount: string,
      direction: 'from' | 'to'
    ): Promise<[swapAmount: string, priceImpact: string]> {
      try {
        stopRefresh.value = true;
        const fromAssetKey = state.fromAsset?.assetKey;
        const toAssetKey = state.toAsset?.assetKey;
        const fromDecimal = state.fromAsset?.decimals;
        const toDecimal = state.toAsset?.decimals;
        if (
          fromAssetKey &&
          toAssetKey &&
          !isNaN(Number(amount)) &&
          Number(amount) > 0
        ) {
          const decimals = direction === 'from' ? fromDecimal : toDecimal;
          amount = timesDecimals(amount, decimals);
          const {
            amount: amountBig,
            priceImpact,
            routes,
            fee: feeRes
          } = await swap.getSwapInfo({
            fromAssetKey,
            toAssetKey,
            amount,
            direction
          });

          // console.log(routes, '-------------------------------')
          fee.value = fixNumber(
            divisionDecimals(feeRes, fromDecimal),
            fromDecimal
          );
          const routesRes: typeof state.routesSymbol = [];
          if (routes.length) {
            routes.map((route: string) => {
              props.assetsList.map(v => {
                if (route === v.assetKey) {
                  routesRes.push({
                    icon: v.symbol,
                    assetKey: route
                  });
                }
              });
            });
          }
          state.routesSymbol = routesRes;
          const targetDeciaml = direction === 'from' ? toDecimal : fromDecimal;
          const amountRes = divisionAndFix(
            amountBig,
            targetDeciaml,
            targetDeciaml
          );
          stopRefresh.value = false;
          return [amountRes, priceImpact];
        }
      } catch (e) {
        //
      }
      stopRefresh.value = false;
      return ['0', '0'];
    }

    // 通过输入from获取最佳兑换信息
    function bestTradeExactIn(
      amount: string,
      pairs: any,
      fromAsset = state.fromAsset,
      toAsset = state.toAsset
    ) {
      const tokenAmountIn = nerve.swap.tokenAmount(
        fromAsset?.chainId,
        fromAsset?.assetId,
        amount
      );
      const tokenOut = nerve.swap.token(toAsset?.chainId, toAsset?.assetId);
      const maxPairSize = 3;
      const res = nerve.swap.bestTradeExactIn(
        config.chainId,
        pairs,
        tokenAmountIn,
        tokenOut,
        maxPairSize
      );
      if (res && Object.values(res).length) {
        return res;
      } else {
        return null;
      }
    }

    function getSwapRate(clear = false) {
      if (clear) {
        swapRate.value = '';
        // console.log(state.toAsset.symbol, 9888);
        return;
      }
      const fromAmount = state.fromAmount;
      const toAmount = state.toAmount;
      if (swapDirection.value === 'to-from') {
        swapRate.value = `1 ${state.fromAsset?.symbol} ≈ ${formatFloat(
          Division(toAmount, fromAmount).toFixed(),
          1
        )} ${state.toAsset?.symbol}`;
      } else {
        swapRate.value = `1 ${state.toAsset?.symbol} ≈ ${formatFloat(
          Division(fromAmount, toAmount).toFixed(),
          1
        )} ${state.fromAsset?.symbol}`;
      }
    }

    const minReceive = computed(() => {
      if (!state.toAmount) return '';
      if (swap.isStableCoinSwap) {
        return state.toAmount;
      }
      if (swap.isStableCoinForStableCoin) {
        return fixNumber(
          Minus(state.toAmount, fee.value).toFixed(),
          state.toAsset?.decimals
        );
      }
      return fixNumber(
        Times(state.toAmount, 1 - Number(state.protectPercent) / 100).toFixed(),
        state.toAsset?.decimals
      );
    });

    const maxSale = computed(() => {
      // 最多卖出
      if (!state.fromAmount) return '';
      if (swap.isStableCoinSwap || swap.isStableCoinForStableCoin) {
        return state.fromAmount;
      }
      return fixNumber(
        Times(
          state.fromAmount,
          1 + Number(state.protectPercent) / 100
        ).toFixed(),
        state.fromAsset?.decimals
      );
    });

    const swapRate = ref(''); // swap兑换比例
    const swapDirection = ref('from-to'); // 比例方向

    function toggleDirection() {
      swapDirection.value =
        swapDirection.value === 'from-to' ? 'to-from' : 'from-to';
      getSwapRate(false);
    }

    function max(type: string) {
      if (type === 'from') {
        state.fromAmount = (state.fromAsset && state.fromAsset.available) || '';
        getToByFrom(state.fromAmount);
      } else {
        state.toAmount = (state.toAsset && state.toAsset.available) || '';
        getFromByTo(state.toAmount);
      }
    }

    const disableTx = computed(() => {
      return (
        !state.fromAmount ||
        !state.fromAsset?.symbol ||
        !state.toAmount ||
        !state.toAsset?.symbol ||
        state.insufficient ||
        !nerveAddress.value
      );
    });
    const impactButton = ref(0);
    const priceImpactFloat = computed(() => {
      const tempPriceImpact = state.priceImpact.toString().slice(0, 6);
      let str = tofix(Times(tempPriceImpact, 100).toFixed(), 2, -1);
      // @ts-ignore
      if (Minus(str, 0.01) < 0) {
        return `<${0.01}%`;
      }
      str += '%';
      return str + '';
    });

    watch(
      () => state.priceImpact,
      val => {
        impactButton.value = 0;
        if (!val) return;
        const tempPriceImpact = state.priceImpact.toString().slice(0, 6);
        let str = tofix(Times(tempPriceImpact, 100).toFixed(), 2, -1);
        // @ts-ignore
        if (Minus(str, 10) > 0) {
          impactButton.value = 1;
        }
        // @ts-ignore
        if (Minus(str, 20) > 0) {
          impactButton.value = 2;
        }
      }
    );

    const confirmText = computed(() => {
      if (state.insufficient) {
        return t('trading.trading17');
      } else if (impactButton.value === 1) {
        return t('trading.trading19');
      } else if (impactButton.value === 2) {
        return t('trading.trading20');
      } else {
        return state.fromAmountError || t('public.public10');
      }
    });

    const priceImpactColor = computed(() => {
      let { value } = priceImpactFloat;
      if (!value) return '';
      const floatNum = Division(value.split('%')[0], 1);
      // @ts-ignore
      if (Minus(floatNum, 0.3) <= 0) {
        return 'green';
        // @ts-ignore
      } else if (Minus(floatNum, 0.3) > 0 && Minus(floatNum, 1) < 0) {
        return '#fd9d2d';
        // @ts-ignore
      } else if (Minus(floatNum, 1) >= 0) {
        return '#c33030';
      } else {
        return '';
      }
    });

    const settingDialog = ref(false);
    function toggleExpand() {
      // if (!state.fromAsset.symbol || !state.toAsset.symbol) return;
      context.emit('toggleExpand');
    }
    function toggleSettingDialog() {
      settingDialog.value = !settingDialog.value;
    }

    function protectPercentInput(val: string) {
      let decimals = 2;
      const patrn = new RegExp(
        '^([1-9][\\d]{0,20}|0)(\\.[\\d]{0,' + decimals + '})?$'
      );
      if (patrn.exec(val) || val === '') {
        if (Number(val) > 100) {
          state.protectPercent = '100';
        } else {
          state.protectPercent = val;
        }
      }
    }

    async function swapTrade() {
      const { provider, EVMAddress, pub } = getWalletInfo();
      loading.value = true;
      const fromAssetKey = state.fromAsset?.assetKey as string;
      const toAssetKey = state.toAsset?.assetKey as string;
      const fromDecimal = state.fromAsset?.decimals;
      try {
        const fromAddress = nerveAddress.value;
        const amountIn = timesDecimals(state.fromAmount, fromDecimal);
        const res = await swap.swapTrade({
          provider,
          from: fromAddress,
          fromAssetKey,
          toAssetKey,
          amount: amountIn,
          slippage: state.protectPercent,
          EVMAddress,
          pub
        });
        handleResult(63, res);
        if (res && res.hash) {
          context.emit('selectAsset', state.fromAsset, state.toAsset);
          state.fromAmount = '';
          state.toAmount = '';
          state.priceImpact = '';
        }
      } catch (e) {
        console.log(e, 'Swap-error');
        toastError(e);
      }
      loading.value = false;
    }

    // 复制交易对url
    function copyPair() {
      const { fromAsset, toAsset } = state;
      const fromKey = fromAsset?.assetKey;
      const toKey = toAsset?.assetKey;
      if (!fromKey || !toKey) return;
      const defaultUrl = window.location.origin;
      const routeName = 'swap'; //route.name;
      // @ts-ignore
      proxy.$copy(`${defaultUrl}/${routeName}/${fromKey}/${toKey}`);
    }

    function toAssetPage() {
      router.push('/assets');
    }

    return {
      loading,
      protectSets: ['0.5', '1', '3'],
      ...toRefs(state),
      minReceive,
      fee,
      priceImpactColor,
      selectAsset,
      max,
      disableTx,
      swapRate,
      swapDirection,
      toggleDirection,
      settingDialog,
      toggleExpand,
      toggleSettingDialog,
      swapTrade,
      forceRefresh,
      priceImpactFloat,
      changeDirection,
      changeDirectionType,
      maxSale,
      protectPercentInput,
      nerveAddress,
      handleLoading,
      canRefresh,
      copyPair,
      impactButton,
      confirmText,
      setUserSlippage,
      toAssetPage,
      getToByFrom,
      getFromByTo
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../../../assets/css/style';
.swap {
  //width: 470px;
  width: 37%;
  min-width: 470px;
  /* height: 752px; */
  padding-bottom: 12px;
  overflow: hidden;
  align-self: flex-start;
  .icon-wrap {
    .left {
      width: 27px;
      height: 25px;
      i {
        font-size: 22px;
        color: $labelColor;
      }
    }
    .right {
      span {
        margin-left: 15px;
        cursor: pointer;
        &:first-child {
          margin-left: 0;
          width: 26px;
          height: 26px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        i {
          font-size: 22px;
          color: $labelColor;
        }
      }
      .refreshing {
        transform-origin: center center;
        animation: beRotate 1.5s linear infinite;
      }
    }
  }
  .from-symbol {
    margin-top: 18px;
  }
  .change-direction {
    margin: 12px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .exchange-rate {
    margin-top: 20px;
    margin-bottom: -5px;
    display: flex;
    justify-content: center;
    color: $labelColor;
    i {
      font-size: 16px;
      margin: 3px 0 0 5px;
      cursor: pointer;
      color: #4a5ef2;
    }
    .change-icon {
      width: 25px;
      height: 22px;
      margin-left: 10px;
      cursor: pointer;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .swap-area {
    .confirm-wrap {
      margin: 25px 0 30px;
    }
  }
  .stable-coin-swap-tip {
    font-size: 13px;
    text-align: center;
    margin-top: -15px;
    color: #f3a83c;
  }
  .swap-setting-info {
    border-top: 1px solid $borderColor;
    border-bottom: 1px solid $borderColor;
    padding: 18px 0;
    .info-item {
      margin-bottom: 12px;
      &:last-child {
        margin-bottom: 0;
      }
      * {
        line-height: 1;
      }
      .left,
      .right {
        color: $subLabelColor;
      }
      .left,
      .right {
        font-size: 14px;
      }
    }
  }
  .setting-and-route {
    overflow: hidden;
    /* &.show {
      animation: expand 0.3s;
    } */
  }
  .swap-route {
    .name {
      padding: 12px 0;
      color: $subLabelColor;
    }
    .route-network {
      flex-wrap: wrap;
    }
    .route-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      //width: 35%;
      &:last-child {
        //width: 20%;
      }
      img {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        margin-right: 5px;
      }
      span {
        font-size: 14px;
        //font-weight: 600;
        color: $labelColor;
      }
      .icon-arrow-right {
        margin: 0 10px;
        font-size: 16px;
        color: $labelColor;
      }
    }
  }
  .swap-setting {
    .content {
      .set-item {
        //margin-bottom: 40px;
      }
      .name {
        margin-bottom: 10px;
        color: $labelColor;
      }
      .protect {
        .number {
          width: 70px;
          height: 44px;
          line-height: 44px;
          text-align: center;
          color: #4a5ef2;
          background-color: #e3eeff;
          margin-right: 20px;
          border-radius: 15px;
          &.active {
            color: #fff;
            background-color: #4a5ef2;
          }
        }
      }
      :deep(.el-input) {
        width: 80px;
        margin-right: 3px;
        .el-input__inner {
          border-radius: 10px;
        }
      }
      .bottom {
        padding: 0 0 20px;
        :deep(.el-button) {
          width: 185px;
          height: 48px;
          border-radius: 15px;
          &:first-child {
            margin-right: 10px;
          }
        }
      }
    }
  }
  @media screen and (max-width: 1200px) {
    padding: 20px !important;
  }
  @media screen and (max-width: 500px) {
    width: 100%;
    min-width: 100%;
    .icon-wrap .left {
      height: 23px;
      i {
        font-size: 18px;
      }
    }
    .change-direction {
      img {
        width: 28px;
        height: 28px;
      }
    }
    .swap-area .confirm-wrap {
      margin-bottom: 10px;
    }
    .stable-coin-swap-tip {
      margin-top: 0;
    }
    .swap-route {
      .route-item {
        margin-bottom: 10px;
        .icon-arrow-right {
          margin: 0 8px;
        }
      }
    }
    .swap-setting {
      .content {
        .protect {
          .number {
            height: 36px;
            line-height: 36px;
            margin-right: 10px;
          }
        }
        :deep(.el-input) {
          .el-input__inner {
            height: 36px;
            line-height: 36px;
          }
        }
        .bottom {
          padding: 0 0 20px;
          :deep(.el-button) {
            width: 185px;
            height: 48px;
            border-radius: 15px;
            &:first-child {
              margin-right: 10px;
            }
          }
        }
      }
    }
  }
}
.text-error {
  font-size: 13px;
  color: #f56c6c;
  margin-top: 10px;
}
@keyframes expand {
  0% {
    height: 0;
  }
  100% {
    height: 245px;
  }
}
//@media screen and (max-width: 1200px) {
//  .mobile-p {
//    padding: 20px !important;
//  }
//}
.deep_color {
  background-color: #c33030 !important;
  color: #ffffff;
  border: none;
}

@keyframes beRotate {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.swap-to-asset {
  text-align: center;
  padding: 20px 0;
  span {
    font-size: 14px;
    cursor: pointer;
    color: #608fff;
  }
}
</style>
