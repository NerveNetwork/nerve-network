<template>
  <div
    :class="['header', route.path === '/' ? 'home-header' : '']"
    @click="showMenu = false"
  >
    <div class="flex-between w1200">
      <div class="left">
        <div class="logo" @click="router.push('/')">
          <img src="../../assets/img/nervelogo.svg" alt="" />
        </div>
        <Menu class="pc-menu" />
      </div>
      <div class="account-wrap">
        <div class="account">
          <div
            class="connection"
            v-if="!address"
            @click="showConnectDialog(true)"
          >
            {{ $t('header.header3') }}
          </div>
          <AuthButton v-else-if="!nerveAddress"></AuthButton>
          <div v-else class="flex-center">
            <div class="chain-wrap">
              <SwitchChain
                v-model="showSwitchChain"
                :currentChain="chain"
                :address="address"
              >
                <div class="l1-chain" @click="showSwitchChain = true">
                  <img :src="chainLogo" alt="" v-if="!wrongChain" />
                  <img
                    src="../../assets/img/net-error.svg"
                    alt=""
                    @click="showSwitchChain = true"
                    v-else
                  />
                  <el-icon style="margin-right: 5px"><caret-bottom /></el-icon>
                </div>
              </SwitchChain>
              <img
                src="../../assets/img/nerveIcon.png"
                alt=""
                @click="manageAccount = true"
              />
              <span @click="manageAccount = true">
                {{ superLong(nerveAddress, 5) }}
              </span>
              <template v-if="unConfirmedTx">
                <el-icon color="#2688F7" class="is-loading">
                  <loading />
                </el-icon>
              </template>
            </div>
          </div>
        </div>
        <!-- <span @click="switchLang" class="click pc" style="margin-left: 10px">
          {{ lang }}
        </span> -->
        <img
          class="menu-icon mobile click"
          src="../../assets/img/icon-menu.svg"
          alt=""
          @click.stop="toggleShowMenu"
        />
      </div>
      <ConnectWallet
        v-model:show="showConnect"
        @changeShow="showConnectDialog"
        @connect="connectProvider"
      />
      <AccountManage
        v-model:show="manageAccount"
        :address="nerveAddress"
        @disconnect="disconnectProvider"
        @addNewHash="addNewHash"
        :txList="accountTxs"
      />
    </div>
    <MobileMenu v-model:show="showMenu" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Menu from '../Menu.vue';
import ConnectWallet from './ConnectWallet.vue';
import AccountManage from './AccountManage.vue';
import MobileMenu from '../MobileMenu.vue';
import SwitchChain from '@/components/SwitchChain.vue';
import useEthereum from '@/hooks/useEthereum';
import AuthButton from '../AuthButton.vue';
import useStoreState from '@/hooks/useStoreState';
import useToast from '@/hooks/useToast';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import { getTronTx, getTx, getFCHTx } from '@/service/api';
import { getCurrentAccount, isBeta, superLong } from '@/utils/util';
import { Account, TxInfo } from '@/store/types';
import storage from '@/utils/storage';
import { ETransfer } from '@/utils/api';
import nerveswap from 'nerveswap-sdk';

const store = useStore();
const router = useRouter();
const route = useRoute();
const { toastError } = useToast();

const { address, initProvider, connect, disconnect } = useEthereum();
const { nerveAddress, wrongChain, chain } = useStoreState();
initProvider();

const showSwitchChain = ref(false);

watch(
  () => address.value,
  val => {
    const currentAccount = getCurrentAccount(val);
    store.commit('setCurrentAddress', currentAccount || {});
  },
  {
    immediate: true
  }
);

const manageAccount = ref(false);
const showConnect = computed(() => store.state.showConnect);
function showConnectDialog(state: boolean) {
  store.commit('changeConnectShow', state);
}
async function connectProvider(provider: string, chainName: string) {
  try {
    await connect(provider, chainName);
  } catch (e) {
    // console.log(e, typeof e, e.message);
    toastError(e);
  }
  store.commit('changeConnectShow', false);
}
function disconnectProvider() {
  disconnect();
  manageAccount.value = false;
  store.commit('setCurrentAddress', {});
}

const activeIndex = ref('');
watch(
  () => route.path,
  val => {
    activeIndex.value = val?.split('/')[1];
  }
);

const chainLogo = computed(() => {
  return _networkInfo[chain.value]?.logo;
});

const showMenu = ref(false);
function toggleShowMenu() {
  showSwitchChain.value = false;
  showMenu.value = !showMenu.value;
}

let isQuery = false;
onMounted(() => {
  window.setInterval(() => {
    checkTxStatus();
  }, 5000);
  checkTxStatus();
});
const accountTxs = ref<TxInfo[]>([]);

const unConfirmedTx = computed(() => {
  return accountTxs.value.filter(tx => !tx.status).length;
});

async function checkTxStatus() {
  if (!address.value || !nerveAddress.value) return;
  const account = getCurrentAccount(address.value);
  const txs: TxInfo[] = account?.txs;
  if (txs && txs.length && !isQuery) {
    isQuery = true;
    try {
      accountTxs.value = [...txs];
      const pendingTx = txs.filter((v: TxInfo) => !v.status);
      if (pendingTx.length) {
        const newTxs = await pollingTx(pendingTx);
        newTxs.map(v => {
          if (!v.result) {
            txs.map(tx => {
              if (tx.hash === v.hash) {
                const retryCount = tx.retryCount || 0;
                tx.retryCount = retryCount + 1;
              }
            });
          } else {
            txs.map(tx => {
              if (tx.hash === v.hash) {
                tx.retryCount = 0;
                tx.status = v.result.status;
              }
            });
          }
        });
        /* const deleteItemIndex = txs.findIndex(v => v.retryCount === 20);
        if (deleteItemIndex !== -1) {
          txs.splice(deleteItemIndex, 1);
        } */
        accountTxs.value = txs;
        const accountList: Account[] = storage.get('accountList') || [];
        accountList.map(v => {
          const sameAddress = Object.values(v.address)
            .flat()
            .map((v: any) => v.toLowerCase())
            .includes(address.value?.toLowerCase());
          if (sameAddress) {
            v.txs = txs;
          }
        });
        storage.set('accountList', accountList);
      }
    } catch (e) {
      //
    }
    isQuery = false;
  }
}

async function pollingTx(txs: TxInfo[]) {
  const txsQuery = txs.map(v => {
    if (!v.L1Chain) {
      if (v.type === 43) {
        // 提现，目标链未确认前显示追加手续费按钮
        return handleWithdrawalTx(v);
      } else {
        return handleTx(v);
      }
    } else if (v.L1Chain === 'TRON') {
      return handleTronTx(v);
    } else if (v.L1Chain === 'BTC') {
      return handleBTCTx(v);
    } else if (v.L1Chain === 'FCH') {
      return handleFCHTx(v);
    } else {
      return handleEVMTx(v);
    }
  });
  const res = await Promise.all(txsQuery);
  return res;
}

async function handleTx(tx: TxInfo) {
  const txState = { hash: tx.hash, result: null };
  const res = await getTx(tx.hash);
  if (res) {
    return { hash: tx.hash, result: res };
  }
  return txState;
}

async function handleWithdrawalTx(tx: TxInfo) {
  const txState = { hash: tx.hash, result: null };
  const res = await getTx(tx.hash);
  if (res) {
    let status = 0;
    if (res.txData?.state !== 'Unconfirmed') {
      status = 1;
    }
    return { hash: tx.hash, result: { ...res, status } };
  } else {
    return txState;
  }
}

async function handleTronTx(tx: TxInfo) {
  return {
    hash: tx.hash,
    result: await getTronTx(tx.hash)
  };
}

async function handleBTCTx(tx: TxInfo) {
  const isConfirmed = await nerveswap.btc.checkTxConfirmed(tx.hash, !isBeta);
  return {
    hash: tx.hash,
    result: {
      status: isConfirmed ? 1 : 0
    }
  };
}

async function handleFCHTx(tx: TxInfo) {
  const result = await getFCHTx(tx.hash);
  return {
    hash: tx.hash,
    result: {
      status: result?.blockHeight > 0 ? 1 : 0
    }
  };
}

async function handleEVMTx(tx: TxInfo) {
  const transfer = new ETransfer(tx.L1Chain);
  return {
    hash: tx.hash,
    result: await transfer.provider.getTransactionReceipt(tx.hash)
  };
}

async function addNewHash(tx: TxInfo) {
  const txs = [...accountTxs.value].concat(tx);
  accountTxs.value = txs;
  const accountList: Account[] = storage.get('accountList') || [];
  accountList.map(v => {
    const sameAddress = Object.values(v.address)
      .flat()
      .map((v: any) => v.toLowerCase())
      .includes(address.value?.toLowerCase());
    if (sameAddress) {
      v.txs = txs;
    }
  });
  storage.set('accountList', accountList);
}
</script>

<style lang="scss">
@import '../../assets/css/style.scss';
.header {
  box-shadow: 0 0 10px rgb(0 0 0 / 10%);
  .w1200 {
    height: 80px;
  }
  &.home-header {
    box-shadow: none;
    background: transparent;
  }
  background-color: #fff;
  .left {
    flex: 1;
    display: flex;
    align-items: center;
  }
  .logo {
    // width: 160px;
    width: 120px;
    cursor: pointer;
    margin-right: 20px;
    img {
      width: 100%;
    }
  }
  .account-wrap {
    display: flex;
    align-items: center;
    .asset-icon {
      height: 30px;
      width: 32.5px;
      img {
        cursor: pointer;
        height: 100%;
        width: 100%;
      }
    }
  }
  .account {
    min-width: 170px;
    height: 36px;
    margin-left: 10px;
    //background: #fff;
    //background-color: #eef2fc;
    //border-radius: 18px;
    font-size: 15px;
    cursor: pointer;
    color: $txColor;
    line-height: 36px;
    text-align: center;
    .connection {
      color: $linkColor;
    }
    .auth-button {
      height: 100%;
      .el-button {
        width: 100%;
        height: 100%;
        border-radius: 18px;
        min-height: auto;
        padding: 0 20px;
      }
    }
    .wrong-chain {
      color: #f56c6c;
    }
    .chain-wrap {
      display: flex;
      align-items: center;
      padding: 0 10px;
      cursor: pointer;
      background-color: #eef2fc;
      border-radius: 18px;
      margin-left: 10px;
      img {
        width: 25px;
        height: 25px;
        margin-right: 5px;
      }
      span {
        color: #475472;
      }
      .l1-chain {
        margin-right: 5px;
        color: #c2cadb;
        display: flex;
        align-items: center;
        img {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          margin-right: 0;
        }
      }
    }
    .address-wrap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px 0 5px;
      height: 100%;
      //line-height: 1;
      position: relative;
      .switch-chain-wrapper {
        width: 100%;
      }
      .wrong-chain {
        color: red;
        font-size: 14px;
      }
      .chain-wrap {
        display: flex;
        align-items: center;
        position: relative;
        span {
          color: #475472;
        }
      }
      img {
        width: 28px;
        cursor: pointer;
      }
      span {
        cursor: pointer;
        font-size: 14px;
        height: 100%;
        &:hover {
          opacity: 0.6;
        }
      }
    }
  }
  @media screen and (max-width: 1200px) {
    .w1200 {
      height: 60px;
    }
    .logo {
      width: 96px;
      margin-right: 0;
    }
    .logo img {
      margin-right: 0;
    }
    .pc-menu {
      display: none;
    }
    .menu-icon {
      margin-left: 10px;
    }
    .account .chain-wrap {
      margin-left: 0;
      line-height: 32px;
    }
  }
  @media screen and (max-width: 375px) {
    .w1200 {
      height: 50px;
      padding: 0 16px 0 12px;
    }
    .logo {
      width: 86px;
    }
    .account {
      margin-left: 2px;
      line-height: 32px;
      height: 32px;
    }
    .logo img {
      margin-right: 0;
    }
    .pc-menu {
      display: none;
    }
    .menu-icon {
      margin-left: 10px;
    }
    .account .chain-wrap {
      margin-left: 0;
      line-height: 32px;
    }
  }
}

.el-popup-parent--hidden {
  padding: 0 !important;
}

@media screen and (max-width: 610px) {
  .header .account-wrap .asset-icon i {
    font-size: 20px;
  }
}
</style>
