import { reactive, toRefs, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from '@/store';
import {
  getProvider,
  getBTCProvider,
  getEVMProvider,
  getNULSProvider
} from '@/utils/providerUtil';
// import { Web3Provider } from "ethers";

import storage from '@/utils/storage';
import { getCurrentAccount, isBeta, isMobile } from '@/utils/util';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import nerveswap from 'nerveswap-sdk';
import nerve from 'nerve-sdk-js';

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

export const NaboxProvider = 'NaboxWallet';
export const TRONProvider = 'tronWeb';
export const UnisatProvider = 'unisat';
export const BitgetProvider = 'bitkeep';
// const ONTOProvider = 'onto';

export const specialProvider = [TRONProvider, UnisatProvider];
export const btcNetwork = isBeta ? 'testnet' : 'livenet';
export const tronApiPrefix = isBeta ? 'shasta' : 'trongrid';

export function checkIsNULSLedger() {
  const { provider } = getProvider();
  return provider?.isNabox && provider?.isNULSLedger;
}

export function getAddress() {
  const { provider } = getProvider();
  return provider?.selectedAddress;
}

export async function generateAddress(address: string) {
  const { provider } = getProvider();
  const network = storage.get('network');
  const account = await nerveswap.getAccount({
    provider,
    address,
    message: 'Generate L2 address',
    network
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
    if (network === 'TRON') {
      // tron
      // if (window.tronLink?.ready) {
      const res = await provider.request({
        method: 'tron_requestAccounts'
      });
      if (res.code !== 200) {
        return;
      }
      address = provider.defaultAddress?.base58 || '';
      if (address) {
        addTRONListener();
        initTronChainInfo(provider, address);
      }
      // }
    } else if (network === 'BTC') {
      // btc
      const accounts = await provider.requestAccounts();
      address = accounts[0] || '';
      if (address) {
        addBTCListener(provider);
        initBTCChainInfo(provider, address);
      }
    } else if (network === 'FCH') {
      address = await provider.getAddress();
      if (address) {
        addFCHListener(provider);
        initFCHChainInfo(address);
      }
    } else if (network === 'NULS' || network === 'NERVE') {
      address = await getNULSAddress(provider);
      if (address) {
        addNULSListener(provider);
        initNULSChaininfo(provider, address, network);
      }
    } else {
      // evm
      address = await getEVMAddress(provider);
      if (address) {
        addEVMListener(provider);
        initEVMChainInfo(provider, address);
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

  function addBTCListener(provider: any) {
    if (provider) {
      provider.getAccounts().then((accounts: string[]) => {
        handleAccountChange(accounts);
      });
      provider.on('accountsChanged', handleAccountChange);
      provider.on('networkChanged', handleBTCNetworkChanged);
    }
  }

  function addFCHListener(provider: any) {
    if (provider) {
      provider.on('accountsChanged', handleAccountChange);
    }
  }

  function addNULSListener(provider: any) {
    if (provider?.isNabox) {
      const { provider: _provider } = getNULSProvider();
      _provider.on('accountsChanged', handleAccountChange);
    } else {
      addEVMListener(provider);
    }
  }

  function addEVMListener(provider: any) {
    if (provider.on) {
      provider.on('accountsChanged', handleAccountChange);
      provider.on('chainChanged', handleChainChange);
    }
  }

  function initTronChainInfo(provider: any, address: string) {
    const apiUrl = provider.fullNode?.host;
    const isWrongChain = apiUrl.indexOf(tronApiPrefix) < 0;
    store.commit('changeIsWrongChain', isWrongChain);
    store.commit('changeAddress', address);
    store.commit('changeNetwork', 'TRON');
  }

  async function initBTCChainInfo(provider: any, address: string) {
    const network = await provider.getNetwork();
    const isWrongChain = network !== btcNetwork;
    store.commit('changeIsWrongChain', isWrongChain);
    store.commit('changeAddress', address);
    store.commit('changeNetwork', 'BTC');
    if (isWrongChain) {
      switchBTCNetwork();
    }
  }

  function initFCHChainInfo(address: string) {
    store.commit('changeIsWrongChain', false);
    store.commit('changeAddress', address);
    store.commit('changeNetwork', 'FCH');
  }

  async function initNULSChaininfo(
    provider: any,
    address: string,
    network: 'NULS' | 'NERVE'
  ) {
    if (provider.isNabox) {
      const { provider: _provider } = getNULSProvider();
      const chainInfo = _networkInfo[network];
      if (chainInfo.chainId !== _provider.chainId) {
        await switchNULSChain(network);
      }
      store.commit('changeIsWrongChain', false);
      store.commit('changeAddress', address);
      store.commit('changeNetwork', network);
    } else {
      await initEVMChainInfo(provider, address);
      store.commit('changeIsWrongChain', false);
      store.commit('changeNetwork', network);
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
  async function getNULSAddress(provider: any) {
    if (!provider.isNabox) {
      return getEVMAddress(provider);
    }
    let address = provider?.selectedAddress;
    try {
      address = await provider?.nuls
        ?.createSession()
        .then((accounts: string[]) => accounts && accounts[0]);
    } catch (error: any) {
      if (error.code === 4001) {
        throw error.message;
      }
    }
    return address;
  }

  async function getEVMChainId(provider: any) {
    let chainId = provider?.chainId;
    if (chainId) return chainId;
    try {
      chainId = await provider
        ?.request({ method: 'eth_chainId' })
        .then((chainId: string) => chainId);
    } catch (error: any) {
      //
    }
    return chainId;
  }

  async function initEVMChainInfo(provider: any, address: string) {
    let network = storage.get('network');
    const currentAccount = getCurrentAccount(address);

    let chainId = await getEVMChainId(provider);
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

  // handle EVM and NULS address change
  function handleAccountChange(accounts: string[]) {
    console.log(accounts, '=======accountsChanged');
    if (!accounts.length) {
      storage.remove('network');
      storage.remove('providerType');
      reload();
      return;
    }
    const { provider } = getEVMProvider();
    const network = storage.get('network');
    if (provider.isNabox && (network === 'NULS' || network === 'NERVE')) {
      let validAddress = false;
      try {
        const res = nerve.verifyAddress(accounts[0]);
        const chainId = res?.chainId;
        const chainInfo = Object.values(_networkInfo).find(
          v => v.chainId === chainId
        );
        validAddress = !!chainInfo;
        if (chainInfo && network !== chainInfo.name) {
          store.commit('changeNetwork', chainInfo.name);
        }
      } catch (e) {
        //
      }
      store.commit('changeIsWrongChain', !validAddress);
      if (validAddress) {
        if (
          state.address &&
          state.address.toLowerCase() !== accounts[0].toLowerCase()
        ) {
          // reload();
        }
      }
    } else {
      if (
        state.address &&
        state.address.toLowerCase() !== accounts[0].toLowerCase()
      ) {
        reload();
      }
    }
  }

  function handleBTCNetworkChanged() {
    reload();
  }

  function handleChainChange(chainId: string) {
    const oldChainId = state.chainId;
    console.log(chainId, '=======chainId', oldChainId);
    if (chainId && chainId !== oldChainId) {
      const chainInfo = Object.values(_networkInfo).find(
        v => v.nativeId === chainId
      );
      const network = chainInfo?.name || null;
      store.commit('changeNetwork', network);
      state.chainId = chainId;
      /* if (oldChainId && Number(oldChainId) !== Number(chainId)) {
        reload();
      } */
    }
  }

  function removeListener() {
    const { provider } = getProvider();
    if (!provider) return;
    const network = storage.get('network');
    if (network === 'TRON') {
      window.removeEventListener('message', handleTRONMessage);
    } else if (network === 'BTC') {
      if (provider) {
        provider.removeListener('accountsChanged', handleAccountChange);
        provider.removeListener('networkChanged', handleBTCNetworkChanged);
      }
    } else if (network === 'FCH') {
      provider.off('accountsChanged', handleAccountChange);
    } else {
      let _provider = provider;
      if ((network === 'NULS' || network === 'NERVE') && _provider.isNabox) {
        _provider = _provider.nuls;
        _provider.off('accountsChanged', handleAccountChange);
      } else {
        _provider.off('accountsChanged', handleAccountChange);
        _provider.off('chainChanged', handleChainChange);
      }
    }
  }

  // 连接provider
  async function connect(providerType: string, network: string) {
    let { provider } = getProvider(providerType, network);

    // wakeup in mobile app
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

    // connect wallet
    if (network === 'TRON') {
      const res = await provider.request({
        method: 'tron_requestAccounts'
      });
      if (res.code !== 200) {
        throw new Error('Connect failed');
      }
      // const address = window.tronLink.tronWeb?.defaultAddress?.base58;
      // state.address = address;
      // store.commit('changeAddress', address);
    } else if (network === 'BTC') {
      const result = await provider.requestAccounts();
      state.address = result[0];
    } else if (network === 'FCH') {
      const result = await provider.createSession();
      state.address = result.selectedAddress;
    } else if (network === 'NULS' || network === 'NERVE') {
      if (provider.isNabox) {
        const { provider: _provider } = getNULSProvider();
        await _provider.createSession();
        state.address = _provider.selectedAddress;
      } else {
        await provider?.request({ method: 'eth_requestAccounts' });
        state.address = provider?.selectedAddress;
      }
    } else {
      await provider?.request({ method: 'eth_requestAccounts' });
      state.address = provider?.selectedAddress;
    }
    store.commit('changeNetwork', network);
    storage.set('providerType', providerType);
    if (network === 'NULS' || network === 'NERVE') {
      if (provider.isNabox) {
        await switchNULSChain(network);
      }
    } else if (network !== 'TRON' && network !== 'BTC' && network !== 'FCH') {
      const chain = _networkInfo[network];
      const { nativeId, rpcUrl, chainName, name, mainAsset, decimals, origin } =
        chain;
      await addEthereumChain({
        chainId: nativeId,
        rpcUrls: [rpcUrl],
        chainName: chainName,
        nativeCurrency: {
          name: name,
          symbol: mainAsset,
          decimals: decimals
        },
        blockExplorerUrls: [origin]
      });
    }
    reload();
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
    const { provider } = getEVMProvider();
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
    const { provider } = getEVMProvider();
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [params]
    });
  }

  async function switchBTCNetwork() {
    const { provider } = getBTCProvider();
    await provider.switchNetwork(btcNetwork);
  }

  async function switchNULSChain(network: 'NULS' | 'NERVE') {
    const { provider } = getNULSProvider();
    const chainInfo = _networkInfo[network];
    if (chainInfo.chainId !== provider.chainId) {
      await provider?.switchChain({ chainId: chainInfo.chainId });
    }
  }

  return {
    initProvider,
    connect,
    disconnect,
    ...toRefs(state),
    addEthereumChain,
    switchEthereumChain,
    switchBTCNetwork,
    switchNULSChain,
    generateAddress
  };
}
