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
import useEthereum, {
  getProvider,
  AddChain,
  specialChain,
  NaboxProvider,
  UnisatProvider,
  TRONProvider
} from '@/hooks/useEthereum';
import useToast from '@/hooks/useToast';
import useClickOutside from '@/hooks/useClickOutside';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';

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

    const { providerType } = getProvider();

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
      if (item.name === props.currentChain && !store.state.isWrongChain) return;
      show.value = false;
      // const { provider, providerType } = getProvider();
      try {
        if (specialChain.indexOf(item.name) > -1) {
          store.commit('changeNetwork', item.name);
          store.commit('changeIsWrongChain', false);
          return;
        }
        if (providerType === TRONProvider) {
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
          /* if (
            specialChain.indexOf(item.name) > -1 ||
            item.chainId === provider.chainId
          ) {
            store.commit('changeNetwork', item.name);
            const currentAccount = getCurrentAccount(props.address || '');
            const chain =
              specialChain.indexOf(item.name) > -1 ? item.name : 'EVM';
            const newAddress = currentAccount.address[chain];
            store.commit('changeAddress', newAddress);
            store.commit('changeIsWrongChain', false);
          } */
          if (
            (item.name === 'BTC' || item.name === 'TRON') &&
            providerType !== NaboxProvider
          ) {
            toastError('Please switch wallet');
            return;
          }
          if (item.name !== 'Ethereum' && item.name !== 'Goerli') {
            const { logo, name, ...rest } = item;
            await addEthereumChain(rest);
          } else {
            await switchEthereumChain({ chainId: item.chainId });
          }
        }
      } catch (e) {
        //
      }
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
