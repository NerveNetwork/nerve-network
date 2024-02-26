import { reactive, toRefs, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from '@/store';
// import { Web3Provider } from "ethers";

import MetaMask from '@/assets/img/provider/metamask.svg';
import Nabox from '@/assets/img/provider/nabox.svg';
import TrustWallet from '@/assets/img/provider/trustwallet.svg';
import Tokenpocket from '@/assets/img/provider/Tokenpocket.jpg';
import Mathwallet from '@/assets/img/provider/mathwallet.svg';
import binancechain from '@/assets/img/provider/binancechain.svg';
import OKEx from '@/assets/img/provider/metax.jpg';
import safepal from '@/assets/img/provider/safepal.svg';
import coin98 from '@/assets/img/provider/coin98.svg';
import bitkeep from '@/assets/img/provider/bitkeep.jpg';
import onto from '@/assets/img/provider/ONTO.png';
import tronLogo from '@/assets/img/provider/tronlink.svg';
import unisatLogo from '@/assets/img/provider/unisat.svg';

import storage from '@/utils/storage';
import { getCurrentAccount, isBeta } from '@/utils/util';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import nerveswap from 'nerveswap-sdk';

interface State {
  address: string | null;
  networkError: string;
  chainId: string;
}

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface AddChain {
  chainId: string;
  rpcUrls: string[];
  chainName: string;
  nativeCurrency: NativeCurrency;
  blockExplorerUrls: string[];
}

interface SwitchChain {
  chainId: string;
}

interface GenerateAddressConfig {
  chainId: number;
  assetId: number;
  prefix: string;
}

// const isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(
//   navigator.userAgent
// );

const MetaMaskProvider = 'ethereum';
export const NaboxProvider = 'NaboxWallet';
const TrustWalletProvider = 'trustwallet';
const SafePalProvider = 'safepal';
const OKExProvider = 'okexchain';
const BSCProvider = 'BinanceChain';
export const TRONProvider = 'tronWeb';
export const UnisatProvider = 'unisat';
// const ONTOProvider = 'onto';

const EVMProvider = [
  { name: 'MetaMask', src: MetaMask, provider: MetaMaskProvider },
  { name: 'Nabox', src: Nabox, provider: NaboxProvider },
  { name: 'Trust Wallet', src: TrustWallet, provider: TrustWalletProvider },
  { name: 'TokenPocket', src: Tokenpocket, provider: MetaMaskProvider },
  { name: 'MathWallet', src: Mathwallet, provider: MetaMaskProvider },
  { name: 'Binance Wallet', src: binancechain, provider: BSCProvider },
  { name: 'OKX Wallet', src: OKEx, provider: OKExProvider },
  { name: 'SafePal', src: safepal, provider: SafePalProvider },
  { name: 'Coin98', src: coin98, provider: MetaMaskProvider },
  { name: 'BitKeep', src: bitkeep, provider: MetaMaskProvider },
  { name: 'ONTO', src: onto, provider: MetaMaskProvider }
];

export const providerList = {
  BTC: [
    { name: 'Nabox', src: Nabox, provider: NaboxProvider },
    { name: 'Unisat Wallet', src: unisatLogo, provider: UnisatProvider }
  ],
  EVM: EVMProvider,
  TRON: [
    { name: 'Nabox', src: Nabox, provider: NaboxProvider },
    { name: 'TronLink', src: tronLogo, provider: TRONProvider }
  ],
  NULS: EVMProvider
};

export const specialProvider = [TRONProvider, UnisatProvider];
export const btcNetwork = isBeta ? 'testnet' : 'livenet';
export const tronApiPrefix = isBeta ? 'shasta' : 'trongrid';

export function getProvider(type?: string) {
  const providerType = storage.get('providerType');
  const isMobile = /Android|webOS|iPhone|iPad|BlackBerry/i.test(
    navigator.userAgent
  );
  if (
    isMobile &&
    providerType &&
    providerType !== NaboxProvider &&
    !specialProvider.includes(providerType)
  ) {
    type = 'ethereum';
  }
  if (type) {
    return {
      providerType: type,
      provider: window[type]
    };
  }
  return {
    providerType: providerType,
    provider: providerType ? window[providerType] : null
  };
}

export function checkIsNULSLedger() {
  const { provider } = getProvider();
  return provider?.isNabox && provider?.isNULSLedger;
}

export function getAddress() {
  const { provider } = getProvider();
  return provider?.selectedAddress;
}

export async function generateAddress(address: string) {
  let providerType = storage.get('providerType');
  const network = storage.get('network');
  if (network === 'BTC') {
    providerType = 'unisat';
  } else if (network === 'TRON') {
    providerType = 'tronWeb';
  }
  const account = await nerveswap.getAccount({
    provider: providerType,
    address,
    message: 'Generate L2 address'
  });
  return account;
}

export const specialChain = ['NULS', 'NERVE'];

export default function useEthereum() {
  const store = useStore();
  const { t } = useI18n();

  const state: State = reactive({
    address: '',
    networkError: '',
    chainId: ''
  });

  onUnmounted(() => {
    removeListener();
  });

  async function initProvider() {
    const { provider, providerType } = getProvider();
    if (!provider) return;
    const network = storage.get('network');
    let address;
    if (
      providerType === TRONProvider ||
      (providerType === NaboxProvider && network === 'TRON')
    ) {
      // tron
      // if (window.tronLink?.ready) {
      await window.tronLink.request({
        method: 'tron_requestAccounts'
      });
      address = window.tronWeb.defaultAddress?.base58 || '';
      if (address) {
        addTRONListener();
        initTronChainInfo(address);
      }
      // }
    } else if (
      providerType === UnisatProvider ||
      (providerType === NaboxProvider && network === 'BTC')
    ) {
      // btc
      const accounts = await window.unisat.requestAccounts();
      // const accounts = await window.unisat.getAccounts();
      address = accounts[0] || '';
      if (address) {
        addBTCListener();
        initBTCChainInfo(address);
      }
    } else {
      // evm
      address = await getEVMAddress(provider);
      if (address) {
        // if (providerType === NaboxProvider) {
        //   addTRONListener();
        //   addBTCListener();
        // }
        if (provider.on) {
          provider.on('accountsChanged', handleAccountChange);
          provider.on('chainChanged', handleChainChange);
        }
        initEVMChainInfo(address);
      }
    }
    if (address) {
      state.address = address;
    }
  }

  function addTRONListener() {
    window.addEventListener('message', handleTRONMessage);
  }

  function handleTRONMessage(e: any) {
    if (!e.data.message) return;
    // 账户改变
    if (e.data.message.action === 'accountsChanged') {
      // console.log('==accountsChanged==', e.data.message.data);
      reload();
    }
    // 断开连接
    if (e.data.message.action === 'disconnect') {
      // console.log('==disconnect==', e.data.message.data);
      reload();
    }
    // 网络切换
    if (e.data.message.action === 'setNode') {
      reload();
    }
  }

  function addBTCListener() {
    const unisat = window.unisat;
    if (unisat) {
      unisat.getAccounts().then((accounts: string[]) => {
        handleAccountChange(accounts);
      });
      unisat.on('accountsChanged', handleAccountChange);
      unisat.on('networkChanged', handleBTCNetworkChanged);
    }
  }

  function initTronChainInfo(address: string) {
    const apiUrl = window.tronWeb?.fullNode?.host;
    const isWrongChain = apiUrl.indexOf(tronApiPrefix) < 0;
    store.commit('changeIsWrongChain', isWrongChain);
    store.commit('changeAddress', address);
    store.commit('changeNetwork', 'TRON');
  }

  async function initBTCChainInfo(address: string) {
    const network = await window.unisat.getNetwork();
    const isWrongChain = network !== btcNetwork;
    store.commit('changeIsWrongChain', isWrongChain);
    store.commit('changeAddress', address);
    store.commit('changeNetwork', 'BTC');
    if (isWrongChain) {
      switchBTCNetwork();
    }
  }

  async function getEVMAddress(provider: any) {
    let address = provider?.selectedAddress || provider?.address;
    try {
      address = await provider
        ?.request({ method: 'eth_requestAccounts' })
        .then((accounts: string[]) => accounts && accounts[0]);
    } catch (error: any) {
      if (error.code === 4001) {
        throw error.message;
      }
    }
    if (!address) {
      address = await provider
        .enable()
        .then((accounts: string[]) => accounts && accounts[0]);
    }
    return address;
  }

  async function initEVMChainInfo(address: string) {
    let network = storage.get('network');
    const currentAccount = getCurrentAccount(address);
    const { provider, providerType } = getProvider();

    let chainId = provider.chainId + '';
    if (providerType === NaboxProvider) {
      chainId = window.nabox.chainId;
    }
    chainId = chainId.startsWith('0x')
      ? chainId
      : '0x' + Number(chainId).toString(16);

    state.chainId = chainId;
    const chainInfo = Object.values(_networkInfo).find(
      v => v.nativeId === chainId
    );
    let isWrongChain = !chainInfo;
    let currentAddress = address;
    // if (!currentAccount || !chainId) {
    //   return;
    // }

    if (network && network === chainInfo?.name) {
      if (specialChain.indexOf(network) > -1) {
        isWrongChain = false;
        // 新账户、且bridge之前在NULS链，会导致currentAccount为null
        currentAddress = currentAccount
          ? currentAccount.address[network]
          : address;
      }
    } else {
      network = chainInfo?.name || '';
    }
    store.commit('changeIsWrongChain', isWrongChain);
    store.commit('changeAddress', currentAddress);
    store.commit('changeNetwork', network);
  }

  function handleAccountChange(accounts: string[]) {
    console.log(accounts, '=======accountsChanged');
    if (
      state.address &&
      state.address.toLowerCase() !== accounts[0].toLowerCase()
    ) {
      reload();
    }
  }

  function handleBTCNetworkChanged() {
    reload();
  }

  function handleChainChange(chainId: string) {
    const oldChainId = state.chainId;
    console.log(chainId, '=======chainId', oldChainId);
    if (chainId) {
      const chainInfo = Object.values(_networkInfo).find(
        v => v.nativeId === chainId
      );
      const network = chainInfo?.name || null;
      store.commit('changeNetwork', network);
      if (oldChainId && Number(oldChainId) !== Number(chainId)) {
        reload();
      }
    }
  }

  function removeListener() {
    const { provider, providerType } = getProvider();
    if (!provider) return;
    if (providerType === TRONProvider) {
      window.removeEventListener('message', handleTRONMessage);
    } else if (providerType === UnisatProvider) {
      const unisat = window.unisat;
      if (unisat) {
        unisat.removeListener('accountsChanged', handleAccountChange);
        unisat.removeListener('networkChanged', handleBTCNetworkChanged);
      }
    } else {
      if (provider.on) {
        provider.off('accountsChanged', handleAccountChange);
        provider.off('chainChanged', handleChainChange);
      }
    }
  }

  // 连接provider
  async function connect(providerType: string, network: string) {
    let { provider } = getProvider(providerType);

    const isMobile = /Android|webOS|iPhone|iPad|BlackBerry/i.test(
      navigator.userAgent
    );
    if (isMobile && !specialProvider.includes(providerType)) {
      // @ts-ignore
      provider = window.ethereum;
    }
    const dappUrl = 'nerve.network';
    if (
      providerType === 'ethereum' &&
      // @ts-ignore
      !provider?.isMetaMask &&
      isMobile
    ) {
      window.open(`https://metamask.app.link/dapp/${dappUrl}`);
      return;
    } else if (
      providerType === 'trustwallet' &&
      // @ts-ignore
      !provider?.isTrust &&
      isMobile
    ) {
      window.open(
        `https://link.trustwallet.com/open_url?coin_id=60&url=https://${dappUrl}`
      );
      return;
    } else if (providerType === 'safepal' && !provider?.isSafePal && isMobile) {
      // mobile safepal
      throw new Error('Please open the link in the SafePal app');
    }
    if (!provider) {
      throw new Error(t('public.public25'));
    }
    if (
      providerType === TRONProvider ||
      (providerType === NaboxProvider && network === 'TRON')
    ) {
      /* if (!window.tronLink?.ready) {
        throw new Error(t('public.public26'));
      } */
      await window.tronLink.request({
        method: 'tron_requestAccounts'
      });
      const address = window.tronWeb.defaultAddress.base58;
      state.address = address;
      store.commit('changeAddress', address);
    } else if (
      providerType === UnisatProvider ||
      (providerType === NaboxProvider && network === 'BTC')
    ) {
      const result = await window.unisat.requestAccounts();
      state.address = result[0];
    } else {
      await provider?.request({ method: 'eth_requestAccounts' });
      state.address = provider?.selectedAddress;
    }
    store.commit('changeNetwork', network);
    storage.set('providerType', providerType);
    if (
      !(
        providerType === TRONProvider ||
        (providerType === NaboxProvider && network === 'TRON')
      )
    ) {
      reload();
    }
  }

  function disconnect() {
    storage.remove('providerType');
    storage.remove('network');
    state.address = '';
    reload();
  }

  function reload() {
    window.location.reload();
  }

  async function addEthereumChain(params: AddChain) {
    const { provider } = getProvider();
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: params.chainId }]
      });
    } catch (e: any) {
      if (e.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [params]
        });
      }
    }
  }

  async function switchEthereumChain(params: SwitchChain) {
    const { provider } = getProvider();
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [params]
    });
  }

  async function switchBTCNetwork() {
    await window.unisat.switchNetwork(btcNetwork);
  }

  return {
    initProvider,
    connect,
    disconnect,
    ...toRefs(state),
    addEthereumChain,
    switchEthereumChain,
    switchBTCNetwork,
    generateAddress
  };
}
