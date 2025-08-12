<template>
  <el-dialog
    center
    custom-class="connect-dialog"
    :show-close="false"
    v-model="visible"
    :append-to-body="true"
    @closed="onClosed"
    top="10vh"
  >
    <template #title>
      <img
        v-if="step === 2"
        class="click"
        src="../assets/img/back-icon.svg"
        alt=""
        @click="step = 1"
      />
      <span>Connect Wallet</span>
    </template>
    <template v-if="step === 1">
      <h3>Select a Network</h3>
      <h4>Make sure the selected network matches the network in your wallet</h4>
      <ul class="chain-list">
        <li
          v-for="item in networks"
          :key="item.chainId"
          @click="onChainChoose(item.type, item.name)"
        >
          <div class="flex-center">
            <img :src="item.logo" alt="" />
            <span>{{ item.label }}</span>
          </div>
        </li>
        <div class="pop-arrow"></div>
      </ul>
    </template>
    <template v-else>
      <h3>Select a Wallet</h3>
      <div class="list">
        <div
          class="connect-btn"
          v-for="item in providerList[chainType]"
          :key="item.name"
          @click="onConnect(item.provider)"
        >
          <span class="wallet-name">{{ item.name }}</span>
          <img class="fr" :src="item.src" alt="" />
        </div>
        <!-- <p
          class="ledger-tip"
          :class="{ tc: providerList[chainType].length > 1 }"
        >
          The only hardware wallet supported is Ledger NULS
        </p> -->
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useStore } from '@/store';
import { providerList } from '@/utils/providerUtil';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import useToast from '@/hooks/useToast';
import useEthereum from '@/hooks/useEthereum';

const store = useStore();
const { toastError } = useToast();

const { connect } = useEthereum();

const showConnect = computed(() => store.state.showConnect);
const connectChainIds = computed(() => store.state.connectChainIds);

const visible = computed({
  get() {
    return showConnect.value;
  },
  set(val) {
    store.commit('changeConnectShow', val);
  }
});

const networks = computed(() => {
  const allChains = Object.values(_networkInfo);
  if (!connectChainIds.value.length) return allChains;
  return allChains.filter(v => connectChainIds.value.includes(v.chainId));
});

const step = ref(1);
const chainType = ref('');
const chainName = ref('');

const onChainChoose = (type: string, name: string) => {
  chainType.value = type;
  chainName.value = name;
  step.value = 2;
};

const onConnect = (name: string) => {
  connectProvider(name, chainName.value);
};

async function connectProvider(provider: string, chainName: string) {
  try {
    await connect(provider, chainName);
  } catch (e) {
    // console.log(e, typeof e, e.message);
    toastError(e);
  }
  store.commit('changeConnectShow', false);
}

const onClosed = () => {
  store.commit('changeConnectShow', false);
  step.value = 1;
  chainType.value = '';
  chainName.value = '';
  store.commit('changeConnectChainIds', []);
};
</script>

<style lang="scss">
@import '../assets/css/style.scss';
.connect-dialog {
  .el-dialog__header {
    border: none !important;
    font-size: 20px;
    font-weight: 500;
    position: relative;
    img {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .el-dialog__body {
    padding-top: 0 !important;
    h3 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    h4 {
      margin-top: -5px;
      margin-bottom: 10px;
    }
    .chain-list {
      display: grid;
      grid-column: 1 / span 2;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
      li {
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        font-size: 12px;
        border: 1px solid transparent;
        &:hover {
          border-color: $linkColor;
          color: $linkColor;
        }
      }
      .flex-center {
        flex-direction: column;
        padding: 6px;
      }
      img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-bottom: 5px;
      }
    }
    .list {
      //padding: 0 25px 10px;
      display: flex;
      flex-wrap: wrap;
      .connect-btn {
        width: 48%;
        height: 50px;
        // line-height: 50px;
        font-size: 14px;
        font-weight: 600;
        padding: 0 15px;
        margin-bottom: 15px;
        border-radius: 15px;
        border: 1px solid #edeef2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        //background: rgb(239, 244, 245);
        //background: $btnColor;
        cursor: pointer;
        &:hover {
          border-color: $linkColor;
          color: $linkColor;
        }
        &:nth-child(2n + 1) {
          margin-right: 4%;
        }
        .wallet-name {
          flex: 1;
          margin-right: 8px;
          word-break: break-word;
        }
        img {
          width: 35px;
          height: 35px;
        }
      }
      .ledger-tip {
        width: 100%;
      }
    }
  }
  @media screen and (max-width: 1200px) {
    .el-dialog__body {
      .chain-list {
        // grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        img {
          width: 48px;
          height: 48px;
        }
      }
    }
  }
  @media screen and (max-width: 1000px) {
    .el-dialog__body {
      .chain-list {
        // grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        max-height: 500px;
        overflow-y: auto;
        img {
          width: 40px;
          height: 40px;
        }
      }
    }
  }
  @media screen and (max-width: 860px) {
    .el-dialog__body {
      .chain-list {
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        .flex-center {
          padding: 4px;
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    width: 100% !important;
    max-width: 470px !important;
  }
  @media screen and (max-width: 500px) {
    .el-dialog__body {
      .list {
        .connect-btn {
          font-size: 13px;
          padding: 0 8px;
          height: 45px;
          // line-height: 45px;
          margin-bottom: 10px;
          border-radius: 10px;
          img {
            width: 30px;
            height: 30px;
          }
        }
        .ledger-tip {
          padding-top: 10px;
        }
      }
    }
  }
}
</style>
