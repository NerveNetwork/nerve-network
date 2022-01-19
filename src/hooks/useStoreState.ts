import { computed } from 'vue';
import { useStore } from '@/store';

export default function useStoreState() {
  const store = useStore();
  // nerve地址
  const nerveAddress = computed(() => store.getters.nerveAddress);
  // 账户资产列表
  const assetsList = computed(() => store.state.assetList);
  // 账户信息
  const addressInfo = computed(() => store.state.addressInfo);
  // 当前L1网络名称
  const chain = computed(() => store.getters.chain);
  // L1网络是否错误
  const wrongChain = computed(() => store.getters.wrongChain);
  // L1网络地址
  const currentAddress = computed(() => store.getters.currentAddress);
  // nvt价格
  const nvtPrice = computed(() => store.state.nvtPrice);
  // 区块高度
  const height = computed(() => store.state.height);
  return {
    nerveAddress,
    assetsList,
    addressInfo,
    chain,
    wrongChain,
    currentAddress,
    nvtPrice,
    height
  };
}
