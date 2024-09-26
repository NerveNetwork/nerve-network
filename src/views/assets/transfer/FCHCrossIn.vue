<template>
  <div class="fch-cross-in" v-loading="loading">
    <div class="title">
      {{ 'From ' + props.network }}
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

const props = defineProps<{
  network: 'FCH'| 'BCH';
}>();

const father = inject(rootCmpKey, {} as RootComponent);
const { t } = useI18n();
const { toast, toastSuccess, toastError } = useToast();

const balance = ref('');
const amount = ref('');
const { transferAsset, nerveAddress, address, currentAccount } = father;
let provider: any;

onMounted(async () => {
  const p = getProvider();
  provider = p.provider;
  const _balance = await provider.getBalance();
  balance.value = props.network === 'BCH' ? _balance : divisionDecimals(_balance, 8);
  calFee();
});

const openAddress = () => {
  openL1Explorer(props.network, 'address', address);
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
async function calFee() {
  try {
    const provider = props.network === 'FCH' ? nerveswap.fch : nerveswap.bch
    const result = await provider.calTxFee({
      from: address,
      nerveAddress,
      amount: balance.value || '0.001'
    });
    console.log(result, 34);
    fee.value = divisionDecimals(result, 8);
  } catch (e) {
    // console.log(e, '--e--')
  }
}

function max() {
  console.log(fee.value, 212)
  amount.value =
    Minus(balance.value, fee.value).toNumber() > 0
      ? Minus(balance.value, fee.value).toFixed()
      : '0';
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
    const heterogeneousChainId = _networkInfo[props.network].chainId;
    const heterogeneousInfo = transferAsset.heterogeneousList?.find(
      v => v.heterogeneousChainId === heterogeneousChainId
    ) as HeterogeneousInfo;
    const provider = props.network === 'FCH' ? nerveswap.fch : nerveswap.bch
    const hash = await provider.crossIn({
      multySignAddress: heterogeneousInfo.heterogeneousChainMultySignAddress,
      nerveAddress,
      amount: amount.value
    });
    console.log(hash, '===hash===')
    handleTx(hash);
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
    L1Chain: props.network,
    L1Type: 'crossIn',
    address
  });
}
</script>

<style lang="scss" scoped>
@import '../../../assets/css/style.scss';
.fch-cross-in {
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
