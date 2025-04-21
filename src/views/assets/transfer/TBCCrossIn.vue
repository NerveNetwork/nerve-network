<template>
  <div class="tbc-cross-in" v-loading="loading">
    <div class="title">
      {{ 'From TBC' }}
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
        :balance="balance"
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

const balance = ref('');
const amount = ref('');
const { transferAsset, nerveAddress, address, currentAccount } = father;
let provider: any;

const heterogeneousInfo = computed(() => {
  const heterogeneousChainId = _networkInfo.TBC.chainId;
  const heterogeneousInfo = transferAsset.heterogeneousList?.find(
    v => v.heterogeneousChainId === heterogeneousChainId
  ) as HeterogeneousInfo;
  return heterogeneousInfo;
});

let tokenDecimals: number;
onMounted(async () => {
  const p = getProvider();
  provider = p.provider;
  const result = await nerveswap.tbc.getBalance(
    address,
    heterogeneousInfo.value.contractAddress
  );
  balance.value = result.balance || '';
  tokenDecimals = result.decimals || 6;
  calFee('0.001');
});

const openAddress = () => {
  openL1Explorer('TBC', 'address', address);
};

const amountErrorTip = ref('');
watch(
  () => amount.value,
  val => {
    if (val) {
      if (!balance.value || Minus(balance.value, amount.value).toNumber() < 0) {
        amountErrorTip.value = t('transfer.transfer15');
      } else {
        amountErrorTip.value = '';
      }
    }
  }
);

const fee = ref('');
async function calFee(amount = '0.001') {
  try {
    const provider = nerveswap.tbc;
    const result = await provider.calTxFee({
      from: address,
      to: heterogeneousInfo.value.heterogeneousChainMultySignAddress,
      amount,
      isMaxAmount: Minus(amount, balance.value).toNumber() === 0
    });
    console.log(result, 34);
    fee.value = result;
  } catch (e) {
    // console.log(e, '--e--');
  }
}

function max() {
  console.log(heterogeneousInfo.value);
  if (heterogeneousInfo.value.contractAddress) {
    amount.value = balance.value;
  } else {
    amount.value =
      Minus(balance.value, fee.value).toNumber() > 0
        ? Minus(balance.value, fee.value).toFixed()
        : '0';
  }
}

const disableTransfer = computed(() => {
  return !!(
    !amount.value ||
    !balance.value ||
    amountErrorTip.value ||
    father.disableTx
  );
});

const loading = ref(false);
const sendTx = async () => {
  loading.value = true;
  try {
    const heterogeneousChainId = _networkInfo.TBC.chainId;
    const heterogeneousInfo = transferAsset.heterogeneousList?.find(
      v => v.heterogeneousChainId === heterogeneousChainId
    ) as HeterogeneousInfo;
    const provider = nerveswap.tbc;
    const result = await provider.crossIn({
      multySignAddress: heterogeneousInfo.heterogeneousChainMultySignAddress,
      nerveAddress,
      amount: amount.value,
      decimals: tokenDecimals,
      tokenContract: heterogeneousInfo.contractAddress || ''
    });
    console.log(result, '===hash===');
    if (result.txid) {
      handleTx(result.txid);
    } else {
      toastError('Transaction Failed');
    }
  } catch (e) {
    console.log(e, '333');
    const { message } = parseErrorMsg(e);
    toastError(message);
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
    L1Chain: 'TBC',
    L1Type: 'crossIn',
    address
  });
}
</script>

<style lang="scss" scoped>
@import '../../../assets/css/style.scss';
.tbc-cross-in {
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
