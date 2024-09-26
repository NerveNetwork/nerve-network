import storage from './storage';
import { isMobile } from './util';

import MetaMaskLogo from '@/assets/img/provider/metamask.svg';
import NaboxLogo from '@/assets/img/provider/nabox.svg';
import BinanceW3WLogo from '@/assets/img/provider/binance-w3w.png';
import TrustWalletLogo from '@/assets/img/provider/trustwallet.svg';
import TokenpocketLogo from '@/assets/img/provider/Tokenpocket.jpg';
import MathwalletLogo from '@/assets/img/provider/mathwallet.svg';
// import binancechainLogo from '@/assets/img/provider/binancechain.svg';
import OKXLogo from '@/assets/img/provider/metax.jpg';
import safepalLogo from '@/assets/img/provider/safepal.svg';
import coin98Logo from '@/assets/img/provider/coin98.svg';
// import bitkeep from '@/assets/img/provider/bitkeep.jpg';
import BitgetLogo from '@/assets/img/provider/Bitget.svg';
import ontoLogo from '@/assets/img/provider/ONTO.png';
import unisatLogo from '@/assets/img/provider/unisat.svg';
import tronLogo from '@/assets/img/provider/tronlink.svg';

const MetaMaskProvider = 'ethereum';
export const NaboxProvider = 'NaboxWallet';
const BinanceW3WProvider = 'binancew3w';
const TrustWalletProvider = 'trustwallet';
const SafePalProvider = 'safepal';
const OKXProvider = 'okxwallet';
// const BinanceProvider = 'BinanceChain';
export const BitgetProvider = 'bitkeep';
export const TRONWebProvider = 'tronWeb';
export const UnisatProvider = 'unisat';

const MetaMask = {
  name: 'MetaMask',
  src: MetaMaskLogo,
  provider: MetaMaskProvider
};
const Nabox = { name: 'Nabox', src: NaboxLogo, provider: NaboxProvider };
const BinanceW3W = {
  name: 'Binance Web3 Wallet',
  src: BinanceW3WLogo,
  provider: BinanceW3WProvider
};
const TrustWallet = {
  name: 'Trust Wallet',
  src: TrustWalletLogo,
  provider: TrustWalletProvider
};
const TokenPocket = {
  name: 'TokenPocket',
  src: TokenpocketLogo,
  provider: MetaMaskProvider
};
const MathWallet = {
  name: 'MathWallet',
  src: MathwalletLogo,
  provider: MetaMaskProvider
};
/* const BinanceWallet = {
  name: 'Binance Wallet',
  src: binancechainLogo,
  provider: BinanceProvider
}; */
const OKXWallet = { name: 'OKX Wallet', src: OKXLogo, provider: OKXProvider };
const SafePal = {
  name: 'SafePal',
  src: safepalLogo,
  provider: SafePalProvider
};
const Coin98 = { name: 'Coin98', src: coin98Logo, provider: MetaMaskProvider };
const Bitget = {
  name: 'Bitget Wallet',
  src: BitgetLogo,
  provider: BitgetProvider
};
const ONTO = { name: 'ONTO', src: ontoLogo, provider: MetaMaskProvider };

const Unisat = {
  name: 'Unisat Wallet',
  src: unisatLogo,
  provider: UnisatProvider
};

const TronLink = { name: 'TronLink', src: tronLogo, provider: TRONWebProvider };

const EVMProvider = [
  MetaMask,
  Nabox,
  BinanceW3W,
  TrustWallet,
  TokenPocket,
  MathWallet,
  // BinanceWallet,
  OKXWallet,
  SafePal,
  Coin98,
  Bitget,
  ONTO
];

const BTCProvider = [Nabox, BinanceW3W, OKXWallet, Unisat, Bitget];

const TRONProvider = [Nabox, BinanceW3W, OKXWallet, TronLink, Bitget];

export const providerList = {
  BTC: BTCProvider,
  EVM: EVMProvider,
  TRON: TRONProvider,
  FCH: [Nabox],
  BCH: [Nabox],
  NULS: EVMProvider
};

export function getProvider(type?: string, network?: string) {
  network = network || storage.get('network');
  if (network === 'BTC') {
    return getBTCProvider(type);
  } else if (network === 'TRON') {
    return getTRONProvider(type);
  } else if (network === 'FCH') {
    return getFCHProvider();
  } else if (network === 'BCH') {
    return getBCHProvider();
  } else {
    return getEVMProvider(type);
    /* const EVMProvider = getEVMProvider(type);
    if (
      (network === 'NULS' || network === 'NERVE') &&
      EVMProvider.provider.isNabox
    ) {
      return getNULSProvider();
    }
    return EVMProvider; */
  }
}

export function getEVMProvider(type?: string) {
  let providerType = storage.get('providerType');
  if (isMobile && providerType && providerType !== NaboxProvider) {
    type = MetaMaskProvider;
  }
  if (type) {
    providerType = type;
  }
  if (providerType === BitgetProvider) {
    return {
      providerType,
      provider: window[providerType]?.ethereum || null
    };
  } else {
    return {
      providerType,
      provider: window[providerType] || null
    };
  }
}

export function getBTCProvider(type?: string) {
  let providerType = storage.get('providerType');
  if (isMobile && providerType && providerType !== NaboxProvider) {
    type = UnisatProvider;
  }
  if (type) {
    providerType = type;
  }

  if (
    providerType === NaboxProvider ||
    providerType === OKXProvider ||
    providerType === BinanceW3WProvider
  ) {
    return {
      providerType,
      // @ts-ignore
      provider: window[providerType]?.bitcoin || null
    };
  } else if (providerType === BitgetProvider) {
    return {
      providerType,
      provider: window[providerType]?.unisat || null
    };
  } else {
    return {
      providerType,
      provider: providerType ? window[providerType] : null
    };
  }
}

export function getTRONProvider(type?: string) {
  let providerType = storage.get('providerType');
  if (isMobile && providerType && providerType !== NaboxProvider) {
    type = TRONWebProvider;
  }
  if (type) {
    providerType = type;
  }
  if (
    providerType === NaboxProvider ||
    providerType === OKXProvider ||
    providerType === BitgetProvider ||
    providerType === BinanceW3WProvider
  ) {
    return {
      providerType,
      provider: window[providerType]?.tronWeb || null
    };
  } else {
    return {
      providerType,
      provider: providerType ? window[providerType] : null
    };
  }
}

export function getFCHProvider() {
  return {
    providerType: 'NaboxWallet',
    provider: window.NaboxWallet?.fch || null
  };
}

export function getBCHProvider() {
  return {
    providerType: 'NaboxWallet',
    provider: window.NaboxWallet?.bch || null
  };
}

export function getNULSProvider() {
  return {
    providerType: 'NaboxWallet',
    provider: window.NaboxWallet?.nuls || null
  };
}
