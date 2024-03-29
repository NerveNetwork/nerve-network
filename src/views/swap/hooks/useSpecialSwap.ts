import { ref, onMounted } from 'vue';
import { Minus, divisionDecimals, isBeta } from '@/utils/util';
// import config from '@/config';
import {
  getStablePairListForSwapTrade,
  getStableSwapPairInfo,
  // getStablePairBaseInfoList,
  getNerveFeeAddress as getNerveFeeAddressApi
} from '@/service/api';

// const NVT_KEY = config.chainId + '-' + config.assetId;

const USDTN_kEY = isBeta ? '5-102' : '9-220';
const NESTN_KEY = isBeta ? '9-339' : '9-339';
const USDCN_KEY = isBeta ? '9-388' : '9-388';
const ETHN_KEY = isBeta ? '9-628' : '9-628';

// 允许 USDT -> USDTM -> NVT(其他),NEST -> NESTN -> NVT(其他)路径的稳定币
const specialStableKeys = [USDTN_kEY, NESTN_KEY, USDCN_KEY, ETHN_KEY];

// 稳定币换稳定币、稳定币换非稳定币、稳定币/稳定币N互换
export default function useSpecialSwap() {
  const isStableCoinForStableCoin = ref(false); // 稳定币换稳定币 USDT(bsc) -> USDT(eth)
  const isStableCoinForOthers = ref(false); // 是否是稳定币换其他资产 USDT -> NVT
  const isOthersForStableCoin = ref(false); // 是否是其他资产换稳定币 NVT-> USDTN
  const isStableCoinSwap = ref(false); // 稳定币、稳定币N互换 USDT ->USDTN
  const stableCoins = ref({}); // {稳定币: 稳定币+'N'}
  const stablePairList = ref([]);
  // const stableSwapFeeList = ref<any>(); // 稳定币换稳定币收取手续费信息
  const staleSwapFeeAddress = ref(''); // 稳定币换稳定币手续费地址
  const getStablePairList = async () => {
    const res = await getStablePairListForSwapTrade();
    if (res) {
      stablePairList.value = res;
      res.map((v: any) => {
        Object.keys(v.groupCoin).map((coin: any) => {
          if (!v.groupCoin[coin].removed) {
            stableCoins.value[coin] = v.lpToken;
          }
        });
      });
    }
  };
  async function getNerveFeeAddress() {
    const res = await getNerveFeeAddressApi();
    if (res) {
      staleSwapFeeAddress.value = res.nerveFeeAddress;
    }
  }

  onMounted(() => {
    getStablePairList();
    getNerveFeeAddress();
  });

  // 判断是否是稳定币换稳定币
  function checkIsStableCoinForStableCoin(
    token1Key?: string,
    token2Key?: string
  ) {
    if (!token1Key || !token2Key) {
      isStableCoinForStableCoin.value = false;
    } else {
      const lpKey1 = stableCoins.value[token1Key];
      const lpKey2 = stableCoins.value[token2Key];
      isStableCoinForStableCoin.value = lpKey1 && lpKey2 && lpKey1 === lpKey2;
    }
    return isStableCoinForStableCoin.value;
  }

  // 判读是否是稳定币换其他资产, 只支持USDT - USDTN - symbol，其他的稳定币暂不支持
  function checkIsStableCoinForOthers(token1Key?: string, token2Key?: string) {
    if (!token1Key || !token2Key) {
      isStableCoinForOthers.value = false;
    } else if (checkIsStableCoinForStableCoin(token1Key, token2Key)) {
      isStableCoinForOthers.value = false;
    } else {
      const lpToken = stableCoins.value[token1Key];
      isStableCoinForOthers.value =
        !!lpToken &&
        lpToken !== token2Key &&
        specialStableKeys.includes(lpToken);
    }
  }

  // 普通资产换稳定币
  function checkIsOthersForStableCoin(token1Key?: string, token2Key?: string) {
    if (!token1Key || !token2Key) {
      isOthersForStableCoin.value = false;
    } else if (checkIsStableCoinForStableCoin(token1Key, token2Key)) {
      isOthersForStableCoin.value = false;
    } else {
      const lpToken = stableCoins.value[token2Key];
      isOthersForStableCoin.value =
        !!lpToken &&
        lpToken !== token1Key &&
        specialStableKeys.includes(lpToken);
    }
  }

  // 判断是否是稳定币、稳定币N互换
  function checkIsStableCoinSwap(fromKey?: string, toKey?: string) {
    if (!fromKey || !toKey) {
      isStableCoinSwap.value = false;
    } else {
      isStableCoinSwap.value =
        stableCoins.value[fromKey] === toKey ||
        stableCoins.value[toKey] === fromKey;
    }
    console.log(
      fromKey,
      toKey,
      stableCoins.value,
      '3-----2222',
      isStableCoinSwap.value
    );
  }

  async function getReceiveOrderIndex(
    pairAddress: string,
    assetKey: string,
    amount: string
  ) {
    const { index, info } = await getStableCoinInfoAndIndex(
      assetKey,
      pairAddress
    );
    if (index !== -1) {
      const balance = divisionDecimals(
        info.balances[index],
        info.coins[index].decimals
      );
      if (Minus(amount, balance).toNumber() > 0) {
        throw 'Insufficient pool balance';
      }
      const arr = new Array(info.coins.length).fill(1).map((v, i) => i);
      return arr.splice(index, 1).concat(arr);
    }
    return [];
  }
  // 获取某个稳定池子的信息和某个稳定币在该稳定币池子中的index
  async function getStableCoinInfoAndIndex(
    assetKey: string,
    pairAddress: string
  ) {
    const info = await getStableSwapPairInfo(pairAddress);
    let index = -1;
    if (info) {
      index = info.coins.findIndex(
        (v: any) => v.assetChainId + '-' + v.assetId === assetKey
      );
    }
    return { info, index };
  }

  return {
    getStablePairList,
    isStableCoinForStableCoin,
    isStableCoinForOthers,
    isOthersForStableCoin,
    isStableCoinSwap,
    stableCoins,
    stablePairList,
    // stableSwapFeeList,
    staleSwapFeeAddress,
    checkIsStableCoinForStableCoin,
    checkIsStableCoinForOthers,
    checkIsOthersForStableCoin,
    checkIsStableCoinSwap,
    getReceiveOrderIndex,
    getStableCoinInfoAndIndex
  };
}
