import { computed, onBeforeUnmount, onMounted, Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useWalletStore } from '@/store/wallet';
import {
  getPairInfo,
  getPendingOrderList,
  getPushAssetList,
  getPushOrderList
} from '@/service/api/push';
import {
  IMyOrderItem,
  IPushAssetItem,
  IPushOrderItem,
  IPushPairInfo
} from '@/service/api/types/push';
import { divisionDecimals } from '@/utils/util';
import { useI18n } from 'vue-i18n';

interface IParis {
  [key: string]: IPushPairInfo;
}

export default function usePushData(buyMode: Ref<boolean>) {
  const { t } = useI18n();
  const walletStore = useWalletStore()
  const { nerveAddress, assetsList } = storeToRefs(walletStore)

  const pushAssetList = ref<IPushAssetItem[]>([]);
  const quoteAsset = ref<IPushAssetItem>({} as IPushAssetItem);

  let timer: number;
  onMounted(() => {
    getAssetList();
    getOrderList();
    if (nerveAddress.value) {
      getMyOrder(nerveAddress.value);
    }
    timer = window.setInterval(() => {
      getOrderList();
      if (nerveAddress.value) {
        getMyOrder(nerveAddress.value);
      }
    }, 5000);
  });

  onBeforeUnmount(() => {
    if (timer) {
      window.clearInterval(timer);
    }
  });

  const getAssetList = async () => {
    const res = await getPushAssetList();
    if (res) {
      pushAssetList.value = [...res.assetList];
      const quoteAssetKey = res.quoteAsset.assetKey;
      if (assetsList.value?.length) {
        const asset = assetsList.value.find(v => {
          return v.assetKey === quoteAssetKey;
        })!;
        // @ts-ignore
        quoteAsset.value = { logo: res.quoteAsset.logo, ...asset };
      } else {
        quoteAsset.value = { ...res.quoteAsset };
      }
    }
  };

  watch(
    () => assetsList.value,
    val => {
      if (quoteAsset.value?.assetKey) {
        const asset = val.find(v => {
          return v.assetKey === quoteAsset.value.assetKey;
        })!;
        quoteAsset.value = { ...quoteAsset.value, ...asset };
      }
      const pushList = [...pushAssetList.value];
      if (pushList.length) {
        [...val].map(v => {
          pushList.map(k => {
            if (v.assetKey === k.assetKey) {
              k.listAvailable = v.listAvailable || '0';
            }
          });
        });
        pushAssetList.value = pushList;
      }
    },
    {
      deep: true
    }
  );

  const buyList = ref<IPushOrderItem[]>([]); // 所有买单列表
  let sellList = ref<IPushOrderItem[]>([]); // 所有卖单列表
  const getOrderList = async () => {
    const list1 = await getPushOrderList(1);
    const list2 = await getPushOrderList(2);
    /*list1.map(v => {
      v.amount = divisionDecimals(v.amount, v.baseDecimals);
      v.price = divisionDecimals(v.price, v.quoteDecimals);
    });
    list2.map(v => {
      v.amount = divisionDecimals(v.amount, v.baseDecimals);
      v.price = divisionDecimals(v.price, v.quoteDecimals);
    });*/
    buyList.value = list1;
    sellList.value = list2;
    // console.log(sellList.value, buyList.value);
  };

  const selectOptions = computed(() => {
    const list = [...pushAssetList.value];
    return [
      { symbol: t('trading.trading48'), value: '', assetKey: '' },
      ...list
    ];
  });
  const selectValue = ref('');
  const orderList = computed(() => {
    const list = buyMode.value ? buyList.value : sellList.value;
    return selectValue.value
      ? list.filter(v => v.baseAssetKey === selectValue.value)
      : list;
  });

  const myOrderList = ref<IMyOrderItem[]>([]);
  const getMyOrder = async (address: string) => {
    const list = await getPendingOrderList(address);
    list.map(v => {
      v.undealedAmount = divisionDecimals(v.undealedAmount, v.baseDecimals);
      v.price = divisionDecimals(v.price, v.quoteDecimals);
    });
    myOrderList.value = list;
  };

  const pairInfo = ref<IPushPairInfo>({} as IPushPairInfo);
  const pairsInfo: IParis = {} as IParis;
  const getPushPairInfo = async (key: string) => {
    pairInfo.value = {} as IPushPairInfo;
    if (!pairsInfo[key]) {
      const result = await getPairInfo(key);
      pairInfo.value = result;
      pairsInfo[key] = result;
    } else {
      pairInfo.value = pairsInfo[key];
    }
  };

  return {
    pushAssetList,
    quoteAsset,
    selectValue,
    selectOptions,
    orderList,
    myOrderList,
    pairInfo,
    getPushPairInfo
  };
}
