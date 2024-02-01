import { onMounted, ref, computed, onUnmounted } from 'vue';
import { isBeta, divisionDecimals } from '@/utils/util';
import axios from 'axios';

type INetwork = 'testnet' | 'livenet';

const defaultNetwork = isBeta ? 'testnet' : 'livenet';

export default function useBTC() {
  const btcAddress = ref('');
  const btcPub = ref('');
  const btcBalance = ref('');
  const btcNetwork = ref<INetwork>('' as INetwork);
  onMounted(() => {
    checkBTC();
  });

  onUnmounted(() => {
    removeListener();
  });

  const checkBTC = () => {
    const unisat = window.unisat;
    if (unisat) {
      unisat.getAccounts().then((accounts: string[]) => {
        handleAccountsChanged(accounts);
      });
      unisat.on('accountsChanged', handleAccountsChanged);
      unisat.on('networkChanged', handleNetworkChanged);
    }
  };

  const removeListener = () => {
    const unisat = window.unisat;
    if (unisat) {
      unisat.removeListener('accountsChanged', handleAccountsChanged);
      unisat.removeListener('networkChanged', handleNetworkChanged);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (!accounts[0]) return;
    if (btcAddress.value === accounts[0]) {
      return;
    }
    btcAddress.value = accounts[0];
    getBasicInfo();
  };

  const handleNetworkChanged = (network: INetwork) => {
    btcNetwork.value = network;
  };

  const getBasicInfo = async () => {
    const unisat = window.unisat;
    const [address] = await unisat.getAccounts();
    btcAddress.value = address;
    btcPub.value = await unisat.getPublicKey();
    const balance = await unisat.getBalance();
    btcBalance.value = divisionDecimals(balance.confirmed, 8);
    btcNetwork.value = await unisat.getNetwork();
  };

  const connect = async () => {
    const unisat = window.unisat;
    if (unisat) {
      const result = await window.unisat.requestAccounts();
      handleAccountsChanged(result);
    } else {
      window.open('https://unisat.io');
    }
  };

  const switchNetwork = async () => {
    const newNetwork: INetwork =
      btcNetwork.value === 'livenet' ? 'testnet' : 'livenet';
    btcNetwork.value = await window.unisat.switchNetwork(newNetwork);
  };

  const isWrongNetwork = computed(() => {
    return btcNetwork.value !== defaultNetwork;
  });

  const signPsbt = async (psbtHex: string) => {
    return await window.unisat.pushPsbt(psbtHex);
  };

  const pushPsbt = async (psbtHex: string) => {
    return await window.unisat.pushPsbt(psbtHex);
  };

  return {
    btcAddress,
    btcPub,
    btcBalance,
    defaultNetwork,
    isWrongNetwork,
    connect,
    switchNetwork,
    signPsbt,
    pushPsbt
  };
}
