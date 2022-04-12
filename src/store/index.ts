import { createStore, useStore as useVuexStore } from 'vuex';
import { isNULSOrNERVE } from '@/utils/util';
import storage from '@/utils/storage';
import { getAddress } from '@/hooks/useEthereum';
import config from '@/config';
// @ts-ignore
import { getAssetList } from '@/service/api';
import { Account, State } from '@/store/types';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';

export default createStore<State>({
  state: {
    // hasNerveAddress: false,
    addressInfo: {} as Account,
    chainId: '',
    showConnect: false,
    lang: storage.get('lang'),
    destroyAddress: config['destroyAddress'],
    feeAddress: config['destroyAddress'],
    assetList: storage.get('assetList', 'session') || [],
    nvtPrice: '',
    height: 0,
    watchTokens: storage.get('watchTokens') || [],
    watchPools: storage.get('watchPools') || []
  },
  getters: {
    // 异构链名称Ethereum..
    chain(state) {
      const chainId = state.chainId;
      const L1Address = getAddress();
      const NULSOrNERVE = isNULSOrNERVE(L1Address);
      // console.log(L1Address, NULSOrNERVE, 333)
      if (!chainId && !NULSOrNERVE) return '';
      let chain = '';
      if (NULSOrNERVE) {
        chain = NULSOrNERVE;
      } else {
        Object.keys(_networkInfo).map(v => {
          if (_networkInfo[v][config.ETHNET] === chainId) {
            chain = _networkInfo[v].name;
          }
        });
      }
      return chain;
    },
    // metamask L1网络错误
    wrongChain(state) {
      const chainId = state.chainId;
      return Object.keys(_networkInfo).every(v => {
        const chain = _networkInfo[v];
        return chain[config.ETHNET] !== chainId || !chain.supported;
      });
    },
    currentAddress(state) {
      return state.addressInfo?.address?.Ethereum;
    },
    nerveAddress(state) {
      return state.addressInfo?.address?.NERVE;
    }
  },
  mutations: {
    setCurrentAddress(state, data) {
      console.log(data, 7777)
      state.addressInfo = data;
    },
    changeChainId(state, data) {
      // console.log(data, 55)
      state.chainId = data;
    },
    changeConnectShow(state, data) {
      state.showConnect = data;
    },
    switchLang(state, data) {
      state.lang = data;
      storage.set('lang', data);
    },
    setAssetList(state, list) {
      state.assetList = list;
      storage.set('assetList', list, 'session');
    },
    changeNVTPrice(state, price) {
      state.nvtPrice = price;
    },
    changeHeight(state, height) {
      state.height = height;
    },
    changeWatchTokens(state, tokens) {
      state.watchTokens = tokens;
    },
    changeWatchPools(state, pools) {
      state.watchPools = pools;
    }
  },
  actions: {
    async getAssetList({ commit }, address) {
      if (!address) return;
      const res = await getAssetList(address);
      if (res && res.length) {
        // console.log("====set-asset====")
        commit('setAssetList', res);
      }
    }
    // async setAccount({ state, commit }, account) {
    //   commit("setAccount", account);
    // }
  },
  modules: {}
});

export function useStore() {
  return useVuexStore<State>();
}
