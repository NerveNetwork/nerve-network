import { computed, ref, watch } from 'vue';
import { useInfoStore } from '@/store/info';
import { getFocusPairsInfo, getFocusAssetsInfo } from '@/service/api';
import {
  Division,
  divisionAndFix,
  divisionDecimals,
  fixNumber,
  getOriginChain,
  priceFormat
} from '@/utils/util';
import { TokenItem, PoolItem } from '../types';
import { NKey, NSymbol, replaceNULS } from '@/constants/constants';

export function useFocusPools() {
  const infoStore = useInfoStore()

  const loading = ref(true)
  const focusPools = ref<PoolItem[]>([]);
  const focusAddress = computed(() => {
    return infoStore.watchPools;
  });
  watch(
    () => focusAddress.value,
    val => {
      if (val && val.length) {
        getFocusPools(val);
      } else {
        loading.value = false
        focusPools.value = [];
      }
    },
    {
      immediate: true
    }
  );
  async function getFocusPools(focusAddress: string[]) {
    const res = await getFocusPairsInfo(focusAddress);
    if (res) {
      const list: PoolItem[] = [];
      res.map(v => {
        v.token0Symbol = replaceNULS(v.token0Symbol);
        v.token1Symbol = replaceNULS(v.token1Symbol);
        list.push({
          name: v.tokenLPSymbol,
          address: v.address,
          token0Symbol: v.token0Symbol,
          token1Symbol: v.token1Symbol,
          token0: v.token0,
          token1: v.token1,
          tx_24: divisionAndFix(v.amountUsdtValue24H, 18, 2),
          tx_7d: divisionAndFix(v.amountUsdtValue7D, 18, 2),
          lp_24: divisionAndFix(v.feeUsdtValue, 18, 2),
          apr: divisionAndFix(v.feeUsdtValueARP, 2, 2),
          liq: divisionAndFix(v.reserveUsdtValue, 18, 2)
        });
      });
      loading.value = false
      focusPools.value = list;
    }
  }
  return {
    loading,
    focusPools,
    getFocusPools
  };
}

export function useFocusTokens() {
  const infoStore = useInfoStore()
  const loading = ref(true)
  const focusTokens = ref<TokenItem[]>([]);
  const focusKeys = computed(() => {
    return infoStore.watchTokens;
  });
  watch(
    () => focusKeys.value,
    val => {
      if (val && val.length) {
        getFocusTokens(val);
      } else {
        loading.value = false
        focusTokens.value = [];
      }
    },
    {
      immediate: true
    }
  );
  async function getFocusTokens(focusKeys: string[]) {
    const res = await getFocusAssetsInfo(focusKeys);
    if (res) {
      const list: TokenItem[] = [];
      res.map(v => {
        const key = v.assetChainId + '-' + v.assetId;
        if (key === NKey) {
          v.symbol = NSymbol;
          v.price = divisionDecimals(v.price, 4);
        }
        v.symbol = replaceNULS(v.symbol);
        list.push({
          originChain: getOriginChain(v.sourceChainid, v.assetChainId),
          name: v.symbol,
          assetKey: v.assetChainId + '-' + v.assetId,
          price: priceFormat(divisionAndFix(v.price, 18, 18)),
          priceChange: fixNumber(Division(v.priceChange, 100).toFixed(), 2),
          txs: divisionAndFix(v.amountUsdtValue24H, 18, 2),
          liq: divisionAndFix(v.reserveUsdtValue, 18, 2)
        });
      });
      loading.value = false
      focusTokens.value = list;
    }
  }
  return {
    loading,
    focusTokens,
    getFocusTokens
  };
}
