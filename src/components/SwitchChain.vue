<template>
  <div class="switch-chain-wrapper" ref="wrapper">
    <slot></slot>
    <div class="support-network-list" v-show="show">
      <ul v-show="show">
        <li
          v-for="item in supportChainList"
          :key="item.chainId"
          :class="{ active: item.name === currentChain }"
          @click.stop="switchChain(item)"
        >
          <img :src="item.logo" alt="" />
          <span>{{ item.name }}</span>
        </li>
        <div class="pop-arrow"></div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useStore } from '@/store';
import useEthereum, { AddChain, specialChain } from '@/hooks/useEthereum';
import {
  getProvider,
  getEVMProvider,
  getBTCProvider,
  getTRONProvider,
  TRONWebProvider,
  UnisatProvider
} from '../utils/providerUtil';
import useToast from '@/hooks/useToast';
import useClickOutside from '@/hooks/useClickOutside';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import storage from '@/utils/storage';

interface ChainItem extends AddChain {
  logo: string;
  name: string;
}

export default defineComponent({
  name: 'SwitchChain',
  props: {
    modelValue: Boolean,
    currentChain: String,
    address: String
  },
  setup(props, { emit }) {
    const store = useStore();
    const { toastError } = useToast();

    const supportChainList: ChainItem[] = [];
    Object.values(_networkInfo).map((v: any) => {
      supportChainList.push({
        chainId: v.nativeId,
        rpcUrls: v.rpcUrl ? [v.rpcUrl] : [],
        name: v.name,
        chainName: v.chainName,
        nativeCurrency: {
          name: v.name,
          symbol: v.mainAsset,
          decimals: v.decimals
        },
        blockExplorerUrls: [v.origin],
        logo: v.logo
      });
    });
    const show = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit('update:modelValue', val);
      }
    });

    const { addEthereumChain, switchEthereumChain, switchBTCNetwork } =
      useEthereum();

    async function switchChain(item: ChainItem) {
      const { providerType, provider } = getProvider();
      const { provider: EVMProvider } = getEVMProvider();
      if (item.name === props.currentChain && !store.state.isWrongChain) return;
      show.value = false;
      // const { provider, providerType } = getProvider();
      try {
        if (specialChain.indexOf(item.name) > -1) {
          store.commit('changeNetwork', item.name);
          store.commit('changeIsWrongChain', false);
          return;
        }
        if (providerType === TRONWebProvider) {
          if (item.name === 'TRON') {
            //
          } else {
            toastError('Please switch wallet');
          }
        } else if (providerType === UnisatProvider) {
          if (item.name === 'BTC') {
            await switchBTCNetwork();
            store.commit('changeNetwork', item.name);
            store.commit('changeIsWrongChain', false);
          } else {
            toastError('Please switch wallet');
          }
        } else {
          if (item.name === 'BTC' || item.name === 'TRON') {
            if (!provider.isNabox) {
              toastError('Please switch wallet');
            } else {
              if (item.name === 'BTC') {
                const { provider } = getBTCProvider();
                await provider.requestAccounts();
                storage.set('network', 'BTC');
                reload();
              } else {
                const { provider } = getTRONProvider();
                await provider.request({
                  method: 'tron_requestAccounts'
                });
                storage.set('network', 'TRON');
                reload();
              }
            }
          } else {
            const oldChainId = EVMProvider.chainId;
            if (item.name !== 'Ethereum' && item.name !== 'Goerli') {
              const { logo, name, ...rest } = item;
              await addEthereumChain(rest);
            } else {
              await switchEthereumChain({ chainId: item.chainId });
            }
            const newChainId = EVMProvider.chainId;
            const network = storage.get('network');
            if (
              (network === 'TRON' || network === 'BTC') &&
              oldChainId !== newChainId
            ) {
              storage.set('network', item.name);
              reload();
            }
          }
        }
      } catch (e) {
        //
      }
    }
    function reload() {
      window.location.reload();
    }
    const wrapper = ref<HTMLElement>();
    const { isClickOutside } = useClickOutside(wrapper);
    watch(
      () => isClickOutside.value,
      val => {
        if (val) {
          show.value = false;
        }
      }
    );
    return {
      show,
      supportChainList,
      switchChain,
      wrapper
    };
  }
});
</script>

<style lang="scss">
@import '../assets/css/style.scss';
.switch-chain-wrapper {
  position: relative;
}
.support-network-list {
  position: absolute;
  top: 40px;
  left: -20px;
  z-index: 111;
  padding: 6px 0;
  margin-top: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  ul {
    min-width: 300px;
    height: 350px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
  }
  li {
    width: 50%;
    padding-left: 10px;
    height: 40px;
    color: $txColor;
    display: flex;
    align-items: center;
    &:hover {
      //opacity: 0.65;
      background-color: #f5f7fa;
    }
    &.active {
      color: $linkColor;
      font-weight: 700;
    }
    img {
      margin-right: 10px;
      width: 28px;
      height: 28px;
    }
    span {
      flex: 1;
      text-align: left;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .pop-arrow,
  .pop-arrow:after {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-width: 8px;
    border-top-width: 0;
    border-color: transparent;
    border-style: solid;
  }
  .pop-arrow {
    top: -8px;
    left: 30px;
    border-bottom-color: #ebeef5;
    &:after {
      content: ' ';
      top: 1px;
      margin-left: -6px;
      border-bottom-color: #fff;
    }
  }
  @media screen and (max-width: 1200px) {
    ul {
      min-width: 148px;
    }
    li {
      width: 100%;
    }
  }
}
</style>
