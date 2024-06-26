<template>
  <div class="btc-cross-in" v-loading="loading">
    <div class="title">
      {{ 'From BTC' }}
      <span class="click" @click="openAddress">
        {{ superLong(address, 6) }}
        <i class="iconfont icon-tiaozhuanlianjie"></i>
      </span>
    </div>
    <div class="transfer-content">
      <custom-input
        v-model:inputVal="amount"
        :label="$t('public.public11')"
        :icon="transferAsset.symbol"
        :assetList="[]"
        :balance="btcBalance"
        :show-amount="false"
        :selectedAsset="transferAsset"
        disableSelect
        @max="max"
      ></custom-input>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary" :disabled="disableTransfer" @click="sendTx">
        {{ amountErrorTip ? amountErrorTip : $t('transfer.transfer9') }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, watch, computed, onMounted } from 'vue';
import useToast, { parseErrorMsg } from '@/hooks/useToast';
import { useI18n } from 'vue-i18n';
import nerveswap from 'nerveswap-sdk';
import { setAccountTxs } from '@/hooks/useBroadcastNerveHex';
import {
  superLong,
  openL1Explorer,
  Minus,
  isBeta,
  timesDecimals,
  divisionDecimals
} from '@/utils/util';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import { rootCmpKey, RootComponent } from '../types';
import { HeterogeneousInfo } from '@/store/types';
import { getProvider } from '@/utils/providerUtil';

const father = inject(rootCmpKey, {} as RootComponent);
const { t } = useI18n();
const { toast, toastSuccess, toastError } = useToast();

const btcBalance = ref('');
const amount = ref('');
const { transferAsset, nerveAddress, address, currentAccount } = father;
let provider: any;

onMounted(async () => {
  const p = getProvider();
  provider = p.provider;
  const balance = await provider.getBalance();
  btcBalance.value = divisionDecimals(balance.confirmed, 8);
  calFee();
});

const openAddress = () => {
  openL1Explorer('BTC', 'address', address);
};

const amountErrorTip = ref('');
watch(
  () => amount.value,
  val => {
    if (val) {
      if (
        !btcBalance.value ||
        Minus(btcBalance.value, amount.value).toNumber() < 0
      ) {
        amountErrorTip.value = t('transfer.transfer15');
      } else if (Minus(amount.value, 0.0001).toNumber() < 0) {
        amountErrorTip.value = t('transfer.transfer38');
      } else {
        amountErrorTip.value = '';
      }
    }
  }
);

const fee = ref('');
async function calFee() {
  try {
    const heterogeneousChainId = _networkInfo.BTC.chainId;
    const heterogeneousInfo = transferAsset.heterogeneousList?.find(
      v => v.heterogeneousChainId === heterogeneousChainId
    ) as HeterogeneousInfo;
    const result = await nerveswap.btc.calTxFee({
      from: address,
      multySignAddress: heterogeneousInfo.heterogeneousChainMultySignAddress,
      nerveAddress,
      amount: '10000',
      isMainnet: !isBeta
    });
    fee.value = divisionDecimals(result, 8);
  } catch (e) {
    //
  }
}

function max() {
  amount.value =
    Minus(btcBalance.value, fee.value).toNumber() > 0
      ? Minus(btcBalance.value, fee.value).toFixed()
      : '0';
}

const disableTransfer = computed(() => {
  return !!(
    !amount.value ||
    !btcBalance.value ||
    amountErrorTip.value ||
    father.disableTx
  );
});

const loading = ref(false);
const sendTx = async () => {
  loading.value = true;
  try {
    const heterogeneousChainId = _networkInfo.BTC.chainId;
    const heterogeneousInfo = transferAsset.heterogeneousList?.find(
      v => v.heterogeneousChainId === heterogeneousChainId
    ) as HeterogeneousInfo;
    const hash = await nerveswap.btc.crossIn({
      provider,
      from: address,
      multySignAddress: heterogeneousInfo.heterogeneousChainMultySignAddress,
      nerveAddress,
      amount: timesDecimals(amount.value, 8),
      pub: currentAccount.pub,
      isMainnet: !isBeta
    });
    handleTx(hash);
  } catch (e) {
    console.log(e, '333');
    const { message } = parseErrorMsg(e);
    const _message = message.includes('dust') ? 'Not enough utxo' : message;
    toastError(_message);
  }
  loading.value = false;
};

function handleTx(hash: string) {
  amount.value = '';
  toastSuccess(t('transfer.transfer14'));
  setAccountTxs(currentAccount.pub, {
    hash,
    time: new Date().getTime(),
    status: 0,
    L1Chain: 'BTC',
    L1Type: 'crossIn',
    address
  });
}
</script>

<style lang="scss" scoped>
@import '../../../assets/css/style.scss';
.btc-cross-in {
  .connect-plugin {
    background-color: #2688f7;
    padding: 8px;
    border-radius: 8px;
    img {
      width: 40px;
      height: 40px;
      margin-right: 20px;
    }
    &:hover {
      opacity: 0.7;
    }
  }
  .title {
    font-size: 18px;
    color: $labelColor;
    span {
      color: $linkColor;
    }
  }
  .transfer-content {
    margin: 35px 0 60px;
  }
  .wrong-net {
    margin-top: 10px;
  }
  @media screen and (max-width: 500px) {
    .title {
      font-size: 16px;
    }
    .transfer-content {
      margin: 35px 0 50px;
    }
    .wrong-net {
      margin-top: 10px;
    }
  }
}
</style>
