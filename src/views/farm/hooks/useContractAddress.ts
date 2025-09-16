import { computed } from 'vue';
import { useWalletStore } from '@/store/wallet';
import { contract_BSC, contract_ETH } from '@/contractConfig/contractConfig';

export default function useContractAddress() {
  const walletStore = useWalletStore()
  return computed(() => {
    return walletStore.chain === 'Ethereum' ? contract_ETH : contract_BSC;
  });
}
