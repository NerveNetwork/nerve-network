<template>
  <div class="push-page">
    <div class="push" v-loading="loading">
      <Tab @tabChange="tabChange" @modeChange="modeChange" />
      <div class="left-content" v-show="activeTab === '1'">
        <custom-input
          v-model:inputVal="txAmount"
          ref="customInput"
          :label="buyMode ? $t('trading.trading27') : $t('trading.trading28')"
          :icon="asset && asset.symbol"
          :assetList="pushAssetList"
          :selectedAsset="asset || null"
          @selectAsset="selectAsset"
          isPush
        />
        <div class="price-wrap">
          <div class="info flex-between">
            <span>{{ $t('trading.trading29') }}</span>
            <span>{{ $t('public.public12') }} {{ toThousands(quoteAsset.listAvailable || 0) }} {{ quoteAsset.symbol }}</span>
          </div>
          <div class="inner flex-between">
            <el-input
              class="no-border"
              :model-value="price"
              @input="changePrice"
              placeholder="0.0"
            />
            <div class="select-wrap flex-center" @click="showDialog = true">
              <SymbolIcon :icon="quoteAsset.symbol" :asset-key="quoteAsset.assetKey" />
              <span>{{ quoteAsset.symbol }}</span>
            </div>
          </div>
        </div>
        <div class="fee-wrap flex-between">
          <span>{{ $t('trading.trading30') }}</span>
          <span>{{ total }} {{ buyMode ? quoteAsset.symbol : asset.symbol }}</span>
        </div>
        <div class="confirm-wrap">
          <el-button type="primary" v-if="nerveAddress" @click="creatOrder" :disabled="btnConfig.disable">
            {{ btnConfig.title }}
          </el-button>
          <template v-else>
            <AuthButton @loading="handleLoading" />
          </template>
        </div>
      </div>
      <div class="order-list right-content" v-show="activeTab === '2'">
        <div class="list-head">
          <div class="list-head-item flex-3">
            <span class="label">{{ $t('trading.trading31') }}</span>
          </div>
          <div class="list-head-item flex-3">
            <span class="label">{{ $t('trading.trading32') }}</span>
          </div>
          <div class="list-head-item flex-3">
            <span class="label">{{ $t('trading.trading33') }}</span>
            <br />
            <span class="label">(USDTN)</span>
          </div>
          <div class="list-head-item flex-2">
            <span class="label">{{ $t('trading.trading34') }}</span>
          </div>
        </div>
        <div class="list-body">
          <template v-if="orderList.length">
            <div class="list-item" v-for="item in orderList" :key="item.id">
              <div class="flex-center">
                <SymbolIcon :icon="item.baseSymbol" :asset-key="item.baseAssetKey" style="margin-right: 10px" />
                <div class="border">
                  <p class="fw">{{ item.baseSymbol }}</p>
                  <p class="font12" style="color: #94a6ce">ID:{{ item.baseAssetKey }}</p>
                </div>
              </div>
              <div class="border">
                <span class="font14">{{ item.amount }}</span>
              </div>
              <div class="border">
                <span class="font14">{{ item.price }}</span>
              </div>
              <div class="border btn-wrap">
                <el-button type="primary" @click="pushOrder(item)">
                  {{
                    buyMode ? $t('trading.trading26') : $t('trading.trading25')
                  }}
                </el-button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="no-data" style="margin-top: 20px">
              {{ $t('public.public19') }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="my-order-list" v-loading="revokeLoading">
      <h3>{{ $t('trading.trading40') }}</h3>
      <div class="list-head">
        <div class="list-head-item">
          <span class="label">{{ $t('trading.trading31') }}</span>
        </div>
        <div class="list-head-item">
          <span class="label">{{ $t('trading.trading32') }}</span>
        </div>
        <div class="list-head-item">
          <span class="label">{{ $t('trading.trading33') }}</span>
          <br />
          <span class="label">(USDTN)</span>
        </div>
        <div class="list-head-item">
          <span class="label">{{ $t('trading.trading41') }}</span>
        </div>
        <div class="list-head-item">
          <span class="label">{{ $t('trading.trading34') }}</span>
        </div>
      </div>
      <div class="list-body">
        <template v-if="myOrderList.length">
          <div class="list-item" v-for="item in myOrderList" :key="item.hash">
            <div class="flex-center">
              <SymbolIcon :icon="item.baseSymbol" :asset-key="item.baseAssetKey" />
              <div class="border">
                <p class="fw">{{ item.baseSymbol }}</p>
                <p class="font12" style="color: #94a6ce">
                  ID:{{ item.baseAssetKey }}
                </p>
              </div>
            </div>
            <div class="border">
              <span class="font14">{{ item.undealedAmount }}</span>
            </div>
            <div class="border">
              <span class="font14">{{ item.price }}</span>
            </div>
            <div class="border">
              <span class="font14">
                {{
                  item.type === 1
                    ? $t('trading.trading42')
                    : $t('trading.trading43')
                }}
              </span>
            </div>
            <div class="border btn-wrap">
              <el-button
                type="default"
                @click="revokeOrder(item)"
                class="default-btn"
              >
                {{ $t('public.public8') }}
              </el-button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="no-data" style="margin-top: 20px">
            {{ $t('public.public19') }}
          </div>
        </template>
      </div>
    </div>
    <PushModal
      :buy-mode="buyMode"
      :order-item="orderItem"
      :order-pay-asset="orderPayAsset"
      :address="nerveAddress"
      ref="pushModalRef"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tab from './Tab.vue';
import CustomInput from '@/components/CustomInput.vue';
import SymbolIcon from '@/components/SymbolIcon.vue';
import AuthButton from '@/components/AuthButton.vue';
import PushModal from './PushModal.vue';
import useStoreState from '@/hooks/useStoreState';
import { Times, toThousands, timesDecimals, divisionDecimals } from '@/utils/util';
import usePushData from '../hooks/usePushData';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import { useToast } from 'vue-toastification';
import config from '@/config';
import { AssetItem } from '@/store/types';
import { IPushAssetItem, IPushOrderItem, IMyOrderItem } from '@/service/api/types/push';

const { t } = useI18n();
const { nerveAddress, assetsList } = useStoreState();
const toast = useToast();

const buyMode = ref(true); // true 挂买单 false 挂卖单
const { pushAssetList, quoteAsset, orderList, myOrderList, pairInfo, getPushPairInfo } = usePushData(buyMode);

const activeTab = ref('1');
const tabChange = (val: string) => {
  console.log(val);
  activeTab.value = val;
};

const modeChange = (val: boolean) => {
  buyMode.value = val;
  txAmount.value = '';
  price.value = '';
};

const txAmount = ref('');
const asset = ref<AssetItem>({} as AssetItem);
const price = ref('');
const total = computed(() => {
  if (buyMode.value) {
    if (!txAmount.value || !price.value) {
      return '0';
    }
    return Times(txAmount.value, price.value);
  } else {
    return txAmount.value || '0';
  }
});
const selectAsset = (val: AssetItem) => {
  asset.value = val;
  if (asset.value.symbol && quoteAsset.value.symbol) {
    const key = asset.value.symbol + quoteAsset.value.symbol;
    getPushPairInfo(key);
  }
};

const changePrice = (val: string) => {
  price.value = val;
};

const btnConfig = computed(() => {
  const {
    baseDecimals,
    minBaseAmount,
    baseSymbol,
    quoteDecimals,
    minQuoteAmount,
    quoteSymbol
  } = pairInfo.value;
  const minBase = divisionDecimals(minBaseAmount, baseDecimals);
  const minQuote = divisionDecimals(minQuoteAmount, quoteDecimals);
  const quoteAmount = txAmount.value * price.value;
  const payAssetKey = buyMode.value ? quoteAsset.value.assetKey : asset.value.assetKey;
  const payAsset = assetsList.value.find(v => v.assetKey === payAssetKey);
  if (
    !asset.value.assetKey ||
    !pairInfo.value.hash ||
    !quoteAsset.value.assetKey ||
    !Number(txAmount.value) ||
    !Number(price.value)
  ) {
    return {
      title: buyMode.value ? t('trading.trading25') : t('trading.trading26'),
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
  } else if (total.value - payAsset.listAvailable > 0) {
    return {
      title: t('transfer.transfer15'),
      disable: true
    };
  } else {
    return {
      title: buyMode.value ? t('trading.trading25') : t('trading.trading26'),
      disable: false
    };
  }
});

const { handleTxInfo } = useBroadcastNerveHex();

const loading = ref(false);
const creatOrder = async () => {
  if (btnConfig.value.disable) {
    return;
  }
  loading.value = true;
  try {
    const assetsChainId = buyMode.value
      ? quoteAsset.value.chainId
      : asset.value.chainId;
    const assetsId = buyMode.value
      ? quoteAsset.value.assetId
      : asset.value.assetId;
    const payAmount = buyMode.value
      ? timesDecimals(total.value, quoteAsset.value.decimals)
      : timesDecimals(total.value, asset.value.decimals); // 支付资产数量
    const transferAmount = timesDecimals(txAmount.value, asset.value.decimals); // 挂单数量
    const transferInfo = {
      from: nerveAddress.value,
      assetsChainId,
      assetsId,
      amount: payAmount
    };
    const txData = {
      tradingHash: pairInfo.value.hash, //委托挂单hash
      address: nerveAddress.value,
      orderType: buyMode.value ? 1 : 2, //委托挂单类型 1:买单，2:卖单
      assetsChainId,
      assetsId,
      amount: transferAmount,
      price: timesDecimals(price.value, quoteAsset.value.decimals),
      feeAddress: config.pushFeeAddress,
      feeScale: config.pushFeeScale
    };
    const result: any = await handleTxInfo(transferInfo, 229, txData);
    if (result && result.hash) {
      //
    }
  } catch (e) {
    console.log(e, 'withdrawal-error');
    toast.error(e.message || e);
  }
  loading.value = false;
};

const orderItem = ref<IPushOrderItem>({} as IPushOrderItem);
const pushModalRef = ref<InstanceType<typeof PushModal>>();
const pushOrder = (item: IPushOrderItem) => {
  orderItem.value = item;
  pushModalRef.value.show();
};

// 买入/卖出需要支付的资产
const orderPayAsset = computed(() => {
  if (buyMode.value) {
    if (!orderItem.value.baseAssetKey) {
      return {} as IPushAssetItem;
    } else {
      return assetsList.value.find(
        v => v.assetKey === orderItem.value.baseAssetKey
      )!;
    }
  } else {
    return quoteAsset.value;
  }
});

const revokeLoading = ref(false);
const revokeOrder = async (item: IMyOrderItem) => {
  revokeLoading.value = true;
  try {
    const transferInfo = {
      from: nerveAddress.value
    };
    const txData = {
      orderHash: item.hash, //委托挂单hash
      address: nerveAddress.value
    };
    const result: any = await handleTxInfo(transferInfo, 230, txData);
    if (result && result.hash) {
      //
    }
  } catch (e) {
    //
  }
  revokeLoading.value = false;
};
</script>

<style lang="scss">
@import '../../../assets/css/style';
.push-page {
  display: flex;
  align-items: center;
  flex-direction: column;
  .push {
    width: 37%;
    min-width: 470px;
    border: 1px solid #e4e9f4;
    background-color: #fff;
    border-radius: 20px;
    overflow: hidden;
    .left-content {
      padding: 0 30px 60px;
      .fee-wrap {
        margin: 20px 0 40px;
        span {
          color: $subLabelColor;
          &:last-of-type {
            color: $txColor;
          }
        }
      }
    }
    .right-content {
      min-height: 400px;
    }
  }
  .my-order-list {
    width: 37%;
    min-width: 470px;
    border: 1px solid #e4e9f4;
    background-color: #fff;
    border-radius: 20px;
    overflow: hidden;
    margin-top: 40px;
    padding-bottom: 20px;
    h3 {
      font-size: 16px;
      height: 68px;
      line-height: 69px;
      color: #475472;
      padding-left: 18px;
    }
  }

  .list-head {
    display: grid;
    align-items: center;
    padding: 0 18px;
    background: #f3f6fd;
    height: 48px;
  }
  .list-body {
    padding-bottom: 10px;
    max-height: 430px;
    overflow: auto;
    .list-item {
      padding: 0 18px;
    }
    .symbol-icon {
      margin-right: 10px;
    }
  }
  .order-list {
    .list-head {
      grid-template-columns: repeat(3, 3fr) 2fr;
    }
    .list-body .list-item {
      display: grid;
      grid-template-columns: repeat(3, 3fr) 2fr;
    }
  }
  .my-order-list {
    .list-head {
      grid-template-columns: repeat(3, 3fr) 1.5fr 1.5fr;
    }
    .list-body .list-item {
      display: grid;
      grid-template-columns: repeat(3, 3fr) 1.5fr 1.5fr;
    }
  }
  .order-list, .my-order-list {
    .label {
      font-size: 14px;
      color: $subLabelColor;
    }
    .list-item {
      /*display: flex;
      align-items: center;*/
      height: 76px;
      &:last-of-type {
        .border {
          border: none;
        }
      }
    }
    .border {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-bottom: 1px solid #e4efff;
    }
    .btn-wrap {
      flex-direction: row;
      align-items: center;
    }
    .el-button {
      min-height: 32px;
      padding: 0 15px;
      border-radius: 8px;
      span {
        font-size: 14px;
      }
    }
    .default-btn {
      padding: 0 10px;
      border-radius: 16px;
      border-color: #387cf4;
      span {
        color: #387cf4;
      }
    }
  }
  .price-wrap {
    margin-top: 30px;
    border-radius: 15px;
    padding: 15px 20px;
    border: 1px solid $wrapperBorder;
    .info {
      margin-bottom: 5px;
      color: $subLabelColor;
      font-size: 12px;
    }
    .el-input {
      margin-right: 12px;
      width: auto;
      ::-webkit-input-placeholder {
        color: $labelColor;
      }
      .el-input__inner {
        font-size: 20px;
        padding-right: 0;
      }
    }
    .select-wrap {
      cursor: pointer;
      color: #8da9d4;
      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      span {
        font-size: 14px;
        margin: 0 5px;
        color: $txColor;
        max-width: 80px;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      i {
        color: #8da9d4;
      }
      :deep(.el-input) {
        .el-input-group__append,
        .el-input-group__prepend {
          background-color: transparent;
          border: none;
          padding-right: 0;
          span {
            display: inline-block;
            padding: 3px 6px;
            color: #608fff;
            //background-color: #26263f;
            cursor: pointer;
            border-radius: 5px;
          }
        }
      }
      @media screen and (max-width: 500px) {
        padding: 10px 15px;
        .el-input {
          margin-right: 10px;
        }
        .inner {
          :deep(.el-input) {
            .el-input__inner {
              font-size: 16px;
            }
          }
        }
        .select-wrap {
          img {
            width: 25px;
            height: 25px;
          }
        }
        :deep(.el-input) {
          .el-input-group__append,
          .el-input-group__prepend {
            padding-left: 10px;
            span {
              padding: 2px 4px;
            }
          }
        }
      }
    }
  }
  @media screen and (max-width: 1200px) {
    //padding: 20px !important;
  }
  @media screen and (max-width: 500px) {
    .push, .my-order-list {
      width: 100%;
      min-width: 100%;
    }
    .list-head {
      padding: 0 12px;
    }
    .list-body {
      .list-item {
        padding: 0 12px;
      }
      .symbol-icon {
        width: 25px;
        height: 25px;
        margin-right: 5px;
      }
      .fw {
        font-size: 13px;
      }
    }
    .my-order-list h3{
      padding: 0 12px;
    }
  }
}
</style>
