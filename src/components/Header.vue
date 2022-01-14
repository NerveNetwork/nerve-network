<template>
  <div :class="['header', route.path === '/' ? 'home-header' : '']" @click="showMenu = false">
    <div class="flex-between w1200">
      <div class="left">
        <div class="logo" @click="toUrl('home')">
          <img src="./../assets/img/nervelogo.svg" alt="" />
        </div>
        <Menu class="pc-menu" :address="address" :nerveAddress="nerveAddress" />
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
          <div class="chain-wrap" @click="manageAccount = true" v-else>
            <div class="l1-chain" v-if="!wrongChain">
              <img :src="chainLogo" alt="" />
              丨
            </div>
            <img src="../assets/img/nerveIcon.png" alt="" />
            <span>
              {{ superLong(nerveAddress, 5) }}
            </span>
          </div>
<!--          <div class="address-wrap" v-else>
            <SwitchChain v-model="showSwitchChain" :chainId="chainId">
              <template v-if="wrongChain">
                <p class="wrong-chain" @click="showSwitchChain = true">
                  {{ $t('public.public18') }}
                </p>
              </template>
              <template v-else>
                <div class="chain-wrap" @click="showSwitchChain = true">
                  <img :src="chainLogo" alt="" />
                  <el-icon style="margin-right: 5px"><caret-bottom /></el-icon>
                  <span @click.stop="manageAccount = true">
                    {{ superLong(nerveAddress, 5) }}
                  </span>
                </div>
              </template>
            </SwitchChain>
          </div>-->
        </div>
        <span @click="switchLang" class="click pc" style="margin-left: 10px">
          {{ lang }}
        </span>
        <img
          class="menu-icon mobile click"
          src="../assets/img/icon-menu.svg"
          alt=""
          @click.stop="toggleShowMenu"
        />
      </div>
      <div class="custom-overlay">
        <el-dialog
          title="Connect to a wallet"
          custom-class="connect-dialog"
          :show-close="false"
          v-model="showConnect"
          :append-to-body="true"
          @closed="showConnectDialog(false)"
        >
          <div class="list">
            <div
              class="connect-btn"
              v-for="(item, index) in providerList"
              :key="index"
              @click="connectProvider(item.provider)"
            >
              {{ item.name }}
              <img class="fr" :src="item.src" alt="" />
            </div>
          </div>
        </el-dialog>
      </div>
      <div class="custom-overlay">
        <el-dialog
          :title="$t('public.public6')"
          custom-class="account-manage"
          :show-close="false"
          v-model="manageAccount"
          :append-to-body="true"
        >
          <div class="content">
            <div class="top">
              <p>
                <span class="pc">{{ superLong(nerveAddress, 8) }}</span>
                <span class="mobile">{{ superLong(nerveAddress, 7) }}</span>
              </p>
              <p>
                <span @click="copy(nerveAddress)">
                  <i class="iconfont icon-fuzhi"></i>
                </span>
                <span @click="openExplorer('address', nerveAddress)">
                  <i class="iconfont icon-tiaozhuanlianjie"></i>
                </span>
              </p>
            </div>
            <div class="bottom tc">
              <el-button type="primary" @click="disconnectProvider">
                {{ $t('public.public7') }}
              </el-button>
            </div>
          </div>
          <div class="txs">
            <p>{{ $t('public.public23') }}</p>
            <template v-if="accountTxs.length">
              <div class="tx-item flex" v-for="item in accountTxs" :key="item.hash">
                <span
                  class="hash link"
                  @click="openExplorer('hash', item.hash)"
                >
                  {{ superLong(item.hash) }}
                </span>
                <span class="create-time">{{ formatTime(item.time) }}</span>
                <span class="status">
                  <span class="iconfont icon-chenggong" v-if="item.status === 1" style="color:#94A6CE;"></span>
                  <el-icon color="#2688F7" class="is-loading" v-else><loading /></el-icon>
                </span>
              </div>
            </template>
            <p v-else class="no-data">{{ $t('public.public19') }}</p>
          </div>
        </el-dialog>
      </div>
    </div>
    <MobileMenu v-model:show="showMenu" :address="address" :nerveAddress="nerveAddress" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Menu from './Menu.vue';
import MobileMenu from './MobileMenu.vue';
import useEthereum, { providerList } from '@/hooks/useEthereum';
import useCopy from '@/hooks/useCopy';
import useLang from '@/hooks/useLang';
import AuthButton from './AuthButton.vue';
import SwitchChain from './SwitchChain.vue';
import useStoreState from '@/hooks/useStoreState';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import dayjs from 'dayjs';
import { getTx } from '@/service/api';
import { superLong, getCurrentAccount, isNULSOrNERVE, openExplorer } from '@/utils/util';
import { Account, TxInfo } from '@/store/types';
import storage from '@/utils/storage';

const store = useStore();
const router = useRouter();
const route = useRoute();
// console.log(store, 66);
// const showConnect = store.state.showConnect;
const { address, chainId, initProvider, connect, disconnect } =
  useEthereum();
const { nerveAddress, wrongChain: notL1Chain, addressInfo } = useStoreState();
initProvider();

const { copy } = useCopy();

const { lang, switchLang } = useLang();

watch(
  () => address.value,
  val => {
    if (val) {
      const currentAccount = getCurrentAccount(val);
      store.commit('setCurrentAddress', currentAccount || {});
    }
  },
  {
    immediate: true
  }
);
watch(
  () => chainId.value,
  val => {
    if (val) {
      store.commit('changeChainId', val);
    }
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
async function connectProvider(provider: string) {
  try {
    await connect(provider);
  } catch (e) {
    //
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
function toAsset() {
  router.push({
    name: 'assets'
  });
}

const wrongChain = computed(() => {
  const NULSOrNERVE = address.value && isNULSOrNERVE(address.value);
  if (NULSOrNERVE) {
    return false;
  } else {
    return notL1Chain.value;
  }
});

const authRef = ref<InstanceType<typeof AuthButton>>();
async function derivedAddress() {
  // @ts-ignore
  const result = await authRef.value.derivedAddress();
  if (result) {
    toAsset();
  }
}

const chainLogo = computed(() => {
  const network = store.getters.chain;
  // console.log(network, 666)
  const { logo } = _networkInfo[network];
  return logo;
});

const showSwitchChain = ref(false);

function toUrl(name: string, url = '') {
  if (url) {
    window.open(url);
  } else {
    router.push({ name: name });
  }
}

const showMenu = ref(false);
function toggleShowMenu() {
  showMenu.value = !showMenu.value;
}

let timer: number;
let isQuery = false;
onMounted(() => {
  window.setInterval(() => {
    checkTxStatus();
  }, 5000);
  checkTxStatus();
});
const accountTxs = ref<TxInfo[]>([]);
function formatTime(time: number) {
  return dayjs(time).format('MM-DD HH:mm');
}
async function checkTxStatus() {
  if (!address.value || !nerveAddress.value) return;
  const account = getCurrentAccount(address.value);
  const txs = account?.txs;
  if (txs && txs.length && !isQuery) {
    isQuery = true;
    try {
      accountTxs.value = [...txs];
      const pendingTx = txs.filter(v => v.status === 0);
      if (pendingTx.length) {
        const newTxs = await pollingTx(pendingTx);
        newTxs.map(tx => {
          txs.map(v => {
            if (tx.hash === v.hash) {
              v.status = tx.status;
            }
          });
        });
        accountTxs.value = txs;
        const accountList: Account[] = storage.get('accountList') || [];
        accountList.map(v => {
          if (v.address.Ethereum === address.value) {
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
    return getTx(v.hash);
  });
  const res = await Promise.all(txsQuery);
  res.map(v => {
    txs.map(tx => {
      if (tx.hash === v.hash) {
        tx.status = v.status;
      }
    });
  });
  return txs;
}
</script>

<style lang="scss">
@import '../assets/css/style.scss';
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
    margin-right: 30px;
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
    background-color: #eef2fc;
    border-radius: 18px;
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
        height: 100%;
        min-height: auto;
        padding: 0 20px;
      }
    }
    .chain-wrap {
      display: flex;
      align-items: center;
      padding: 0 10px;
      cursor: pointer;
      img {
        width: 25px;
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
      margin-right: 0;
    }
    .logo img {
      width: 96px;
    }
    .pc-menu {
      display: none;
    }
    .menu-icon {
      margin-left: 10px;
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

.connect-dialog {
  max-width: 470px !important;
  .el-dialog__body {
    padding: 0;
    .list {
      padding: 0 25px 25px;
      .connect-btn {
        height: 50px;
        line-height: 50px;
        font-size: 14px;
        font-weight: 600;
        padding: 0 15px;
        margin-bottom: 15px;
        border-radius: 15px;
        border: 1px solid #edeef2;
        //background: rgb(239, 244, 245);
        //background: $btnColor;
        cursor: pointer;
        &:hover {
          border-color: $linkColor;
          color: $linkColor;
        }
        img {
          margin-top: 7px;
          width: 35px;
          height: 35px;
        }
      }
    }
  }
  @media screen and (max-width: 500px) {
    .el-dialog__body {
      .list {
        padding: 0 25px 20px;
        .connect-btn {
          height: 45px;
          line-height: 45px;
          margin-bottom: 10px;
          border-radius: 10px;
          img {
            width: 30px;
            height: 30px;
          }
        }
      }
    }
  }
}
.account-manage {
  max-width: 470px;
  .content {
    /* display: ; */
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      span {
        font-size: 24px;
        color: $txColor;
      }
      i {
        color: $linkColor;
        font-size: 32px;
        cursor: pointer;
        margin-left: 20px;
        &.icon-tiaozhuanlianjie {
          font-size: 30px;
        }
      }
    }
    .bottom {
      padding: 30px 0 20px;
      .el-button {
        width: 205px;
        height: 48px;
        border-radius: 15px;
        border: none;
      }
    }
  }
  .txs {
    max-height: 300px;
    overflow: auto;
    p {
      color: #475472;
      margin-bottom: 5px;
      font-size: 16px;
      &.no-data {
        padding-top: 8px;
        font-size: 13px;
        color: #909399;
        text-align: center;
      }
    }
    .tx-item {
      align-items: center;
      margin-bottom: 5px;
    }
    .hash {
      width: 50%;
    }
    .create-time {
      width: 30%;
    }
    .status {
      width: 20%;
      padding-right: 5px;
      display: flex;
      justify-content: end;
      .is-loading {
        transform-origin: center center;
      }
    }
  }
  @media screen and (max-width: 500px) {
    .content .top span {
      font-size: 22px;
      i {
        font-size: 24px;
        &.icon-tiaozhuanlianjie {
          font-size: 22px;
        }
      }
    }
    .content {
      .bottom {
        padding: 20px 0 10px;
        .el-button {
          height: 36px;
        }
      }
    }
  }
}
</style>
