<template>
  <el-dialog
    custom-class="push-confirm-modal"
    top="10vh"
    v-model="showConfirmModal"
    :show-close="false"
    @closed="txAmount = ''"
    :title="buyMode ? $t('trading.trading26') : $t('trading.trading25')"
  >
    <div class="asset-info">
      <p class="flex-between">
        <span class="label">{{ $t('trading.trading35') }}</span>
        <span class="value">{{ orderItem.baseSymbol }}</span>
      </p>
      <p class="flex-between">
        <span class="label">ID</span>
        <span class="value">{{ orderItem.baseAssetKey }}</span>
      </p>
      <p class="flex-between">
        <span class="label">{{ $t('trading.trading33') }}</span>
        <span class="value">
          {{ orderItem.price }} {{ orderItem.quoteSymbol }}
        </span>
      </p>
      <p class="flex-between">
        <span class="label">
          {{ buyMode ? $t('trading.trading36') : $t('trading.trading37') }}
        </span>
        <span class="value">
          {{ toThousands(orderItem.amount) }} {{ orderItem.baseSymbol }}
        </span>
      </p>
    </div>
    <div class="price-wrap">
      <div class="info flex-between">
        <span>
          {{ buyMode ? $t('trading.trading28') : $t('trading.trading27') }}
        </span>
        <span>
          {{ $t('public.public12') }}
          {{ toThousands(orderPayAsset?.listAvailable) }}
          {{ orderPayAsset?.symbol }}
        </span>
      </div>
      <div class="inner flex-between">
        <el-input
          class="no-border"
          :model-value="txAmount"
          @input="changeAmount"
          placeholder="0.0"
        />
      </div>
    </div>
    <div class="fee-wrap flex-between">
      <span class="label">{{ $t('trading.trading30') }}</span>
      <span class="value">
        <span>{{ total }}</span>
        {{ buyMode ? orderItem.baseSymbol : orderItem.quoteSymbol }}
      </span>
    </div>
    <el-button
      type="primary"
      :disabled="btnConfig.disable"
      @click="createOrder"
      v-loading.fullscreen.lock="loading"
    >
      {{ btnConfig.title }}
    </el-button>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, withDefaults } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElLoading } from 'element-plus'
import { toThousands, Times, divisionDecimals, timesDecimals } from '@/utils/util';
import { IPushOrderItem, IPushAssetItem } from '@/service/api/types/push';
import config from '@/config';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import { useToast } from 'vue-toastification';

const props = withDefaults(
  defineProps<{
    buyMode: boolean; // true 挂卖单 false 挂买单
    orderItem: IPushOrderItem;
    orderPayAsset: IPushAssetItem;
    address: string;
  }>(),
  {}
);

const { t } = useI18n();
const toast = useToast();
const txAmount = ref('');

const total = computed(() => {
  console.log(props.buyMode, txAmount.value, props.orderItem.price);
  if (!props.buyMode) {
    if (!txAmount.value || !props.orderItem.price) {
      return '0';
    }
    return Times(txAmount.value, props.orderItem.price);
  } else {
    return txAmount.value || '0';
  }
});

const changeAmount = (val: string) => {
  const { baseDecimals, quoteDecimals } = props.orderItem;
  const decimals = props.buyMode ? quoteDecimals : baseDecimals;
  let reg: RegExp;
  if (!decimals) {
    reg = new RegExp('^([1-9][\\d]*|0)(\\.[\\d]*)?$|(^\\.[\\d]*$)');
  } else {
    reg = new RegExp(
      '^([1-9][\\d]*|0)(\\.[\\d]{0,' +
        decimals +
        '})?$|(^\\.[\\d]{0,' +
        decimals +
        '}$)'
    );
  }
  if (reg.exec(val) || val === '') {
    txAmount.value = val;
  }
};

const btnConfig = computed(() => {
  const {
    baseDecimals,
    minBaseAmount,
    quoteDecimals,
    minQuoteAmount,
    baseSymbol,
    quoteSymbol,
    price
  } = props.orderItem;
  const minBase = divisionDecimals(minBaseAmount, baseDecimals);
  const minQuote = divisionDecimals(minQuoteAmount, quoteDecimals);
  const quoteAmount = txAmount.value * price;
  const maxAmount = props.orderItem.amount;
  if (!txAmount.value) {
    return {
      title: props.buyMode ? t('trading.trading38') : t('trading.trading39'),
      disable: true
    };
  } else if (txAmount.value - minBase < 0) {
    return {
      title: t('trading.trading44') + minBase + baseSymbol,
      disable: true
    };
  } else if (quoteAmount - minQuote < 0) {
    return {
      title: t('trading.trading45') + minQuote + quoteSymbol,
      disable: true
    };
  } else if (total.value - props.orderPayAsset.listAvailable > 0) {
    return {
      title: t('transfer.transfer15'),
      disable: true
    };
  } else if (txAmount.value - maxAmount > 0) {
    return {
      title:
        (props.buyMode ? t('trading.trading46') : t('trading.trading47')) +
        maxAmount,
      disable: true
    };
  } else {
    return {
      title: props.buyMode ? t('trading.trading38') : t('trading.trading39'),
      disable: false
    };
  }
});

const loading = ref(false);

const { handleTxInfo } = useBroadcastNerveHex();

const createOrder = async () => {
  if (btnConfig.value.disable) {
    return;
  }
  loading.value = true;
  try {
    const { buyMode, orderItem, address } = props;
    // buyMode: true 挂卖单 false 挂买单
    const assetsChainId = buyMode
      ? orderItem.baseAssetChainId
      : orderItem.quoteAssetChainId;
    const assetsId = buyMode ? orderItem.baseAssetId : orderItem.quoteAssetId;
    const payAmount = buyMode
      ? timesDecimals(total.value, orderItem.baseDecimals)
      : timesDecimals(total.value, orderItem.quoteDecimals);
    const transferAmount = timesDecimals(
      txAmount.value,
      orderItem.baseDecimals
    );
    const transferInfo = {
      from: address,
      assetsChainId,
      assetsId,
      amount: payAmount
    };
    const txData = {
      tradingHash: orderItem.hash, //委托挂单hash
      address,
      orderType: buyMode ? 2 : 1, //委托挂单类型 1:买单，2:卖单
      assetsChainId,
      assetsId,
      amount: transferAmount,
      price: timesDecimals(props.orderItem.price, orderItem.quoteDecimals),
      feeAddress: config.pushFeeAddress,
      feeScale: config.pushFeeScale
    };
    const result: any = await handleTxInfo(transferInfo, 229, txData);
    if (result && result.hash) {
      //
      showConfirmModal.value = false;
    }
  } catch (e) {
    console.log(e, 'withdrawal-error');
    toast.error(e.message || e);
  }
  loading.value = false;
};

const showConfirmModal = ref(false);
const show = () => {
  showConfirmModal.value = true;
};
defineExpose({
  show
});
</script>

<style lang="scss">
@import '../../../assets/css/style';
.push-confirm-modal {
  width: 470px;
  .label {
    font-size: 16px;
    color: $subLabelColor;
  }
  .value {
    font-size: 16px;
    font-weight: 500;
  }
  .asset-info {
    padding: 20px;
    background: #f3f6fd;
    margin-bottom: 20px;
    border-radius: 15px;
    p {
      margin-bottom: 15px;
      &:last-of-type {
        margin-bottom: 0;
      }
    }
  }
  .fee-wrap {
    margin: 20px 0 40px;
    .value span {
      color: #387cf4;
    }
  }
  .el-button {
    width: 100%;
    margin-bottom: 20px;
  }
}
@media screen and (max-width: 500px) {
  .push-confirm-modal {
    .label {
      font-size: 14px;
    }
    .value {
      font-size: 14px;
    }
    .asset-info {
      padding: 20px;
      background: #f3f6fd;
      margin-bottom: 20px;
      border-radius: 15px;
      p {
        margin-bottom: 15px;
        &:last-of-type {
          margin-bottom: 0;
        }
      }
    }
    .fee-wrap {
      margin: 20px 0 40px;
    }
    .el-button {
      margin-bottom: 10px;
    }
  }
}
</style>
