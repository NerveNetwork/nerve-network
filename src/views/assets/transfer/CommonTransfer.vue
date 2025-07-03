<template>
  <div class="common-transfer" v-loading="loading">
    <div class="to-input">
      <el-input
        :placeholder="$t('transfer.transfer6')"
        v-model.trim="toAddress"
      ></el-input>
      <span class="address-error" v-if="addressError">
        {{ addressError }}
      </span>
    </div>
    <div class="transfer-content">
      <custom-input
        v-model:inputVal="amount"
        :label="$t('transfer.transfer19')"
        :icon="transferAsset.symbol"
        :assetList="assetsList"
        :balance="balance"
        :selectedAsset="transferAsset"
        @selectAsset="selectAsset"
        @max="max"
      ></custom-input>
      <div class="fee-wrap" v-if="showFeeTip">
        {{ $t('public.public15') }}0.01 NVT + 100 NAI
      </div>
    </div>
    <div class="confirm-wrap">
      <el-button v-if="disableToNULS" type="primary" disabled>
        {{ $t('transfer.transfer34') }}
      </el-button>
      <el-button
        type="primary"
        @click="sendTx"
        :disabled="disableTransfer"
        v-else
      >
        {{ amountErrorTip || $t('transfer.transfer10') }}
      </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import useToast from '@/hooks/useToast';
import CustomInput from '@/components/CustomInput.vue';
import { Minus, timesDecimals, Plus, isBeta } from '@/utils/util';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';
import nerve from 'nerve-sdk-js';
import config from '@/config';
import { rootCmpKey, RootComponent, AssetItemType } from '../types';
import nerveswap from 'nerveswap-sdk';

const nvtFee = 0.01;
const nulsFee = 100;
export default defineComponent({
  name: 'commonTransfer',
  inject: ['father'],
  components: {
    CustomInput
  },
  setup() {
    const father = inject(rootCmpKey, {} as RootComponent);
    const { t } = useI18n();
    const { toastError } = useToast();

    const loading = ref(false);
    const amount = ref('');
    const assetsList = computed(() => father.allAssetsList);

    const transferAsset = ref(father.transferAsset);
    const balance = computed(() => {
      const asset = assetsList.value.find(asset => {
        return asset.assetKey === transferAsset.value.assetKey;
      });
      return asset ? asset.available : '';
    });
    const nvtBalance = computed(() => {
      const asset = assetsList.value.find(asset => {
        return (
          asset.chainId === config.chainId && asset.assetId === config.assetId
        );
      });
      return asset ? asset.available : '';
    });
    const nulsBalance = computed(() => {
      const asset = assetsList.value.find(asset => {
        return (
          asset.chainId === config.NULSConfig.chainId &&
          asset.assetId === config.NULSConfig.assetId
        );
      });
      return asset ? asset.available : '';
    });

    /*const amountErrorTip = ref('');
    watch(
      () => amount.value,
      val => {
        if (
          !Number(balance.value) ||
          Minus(balance.value, val).toNumber() < 0
        ) {
          amountErrorTip.value = t('transfer.transfer15');
        } else {
          amountErrorTip.value = '';
        }
      }
    );*/

    const amountErrorTip = computed(() => {
      if (
        !Number(balance.value) ||
        Minus(balance.value, amount.value).toNumber() < 0
      ) {
        return t('transfer.transfer15');
      }
      let tip = '';
      if (type.value === 10) {
        if (isTransferNVT.value) {
          // 转账资产是nvt
          const amountWithFee = Plus(amount.value, nvtFee).toFixed();
          if (
            Minus(balance.value, amountWithFee).toNumber() < 0 ||
            Minus(nvtBalance.value, nvtFee).toNumber() < 0
          ) {
            tip = t('transfer.transfer25');
          }
        } else if (isTransferNULS.value) {
          // 转账资产是nuls
          const amountWithFee = Plus(amount.value, nulsFee).toFixed();
          if (
            Minus(balance.value, amountWithFee).toNumber() < 0 ||
            Minus(nulsBalance.value, nulsFee).toNumber() < 0
          ) {
            tip = t('transfer.transfer25');
          }
        } else {
          if (
            Minus(nulsBalance.value, nvtFee).toNumber() < 0 ||
            Minus(nvtBalance.value, nulsFee).toNumber() < 0
          ) {
            tip = t('transfer.transfer25');
          }
        }
      }
      return tip;
    });

    const isTransferNVT = computed(() => {
      const { chainId, assetId } = transferAsset.value;
      return chainId === config.chainId && assetId === config.assetId;
    });
    const isTransferNULS = computed(() => {
      const { chainId, assetId } = transferAsset.value;
      return (
        chainId === config.NULSConfig.chainId &&
        assetId === config.NULSConfig.assetId
      );
    });

    const disableTransfer = computed(() => {
      return !!(
        !toAddress.value ||
        !amount.value ||
        !balance.value ||
        addressError.value ||
        amountErrorTip.value
      );
    });

    const toAddress = ref('');
    const addressError = ref('');
    const type = ref(2); // 交易类型 2-普通转账 10-跨链到nuls
    watch(
      () => toAddress.value,
      val => {
        if (val) {
          let res: any;
          try {
            res = nerve.verifyAddress(val);
            console.log(res, 13465);
            if (res.right) {
              const nulsChainId = isBeta ? 2 : 1;
              const isToNULS = res.chainId === nulsChainId;
              if (res.chainId === config.chainId) {
                type.value === 2;
              } else if (isToNULS) {
                type.value = 10;
              } else {
                type.value = 2;
                res.right = false;
              }
            } else {
              type.value = 2;
            }
          } catch (e) {
            type.value = 2;
          }
          if (!res || !res.right) {
            addressError.value = t('transfer.transfer24');
          } else if (res.type === 2) {
            // type 1:主网地址 2：合约地址 3:多签地址
            addressError.value = t('transfer.transfer26');
          } else {
            addressError.value = '';
          }
        }
      }
    );

    const showFeeTip = computed(() => {
      return toAddress.value && type.value === 10;
    });

    // 资产无法跨链到NULS
    const disableToNULS = computed(() => {
      return showFeeTip.value && !transferAsset.value.canNuls;
    });

    function selectAsset(asset: AssetItemType) {
      transferAsset.value = asset;
    }

    function max() {
      if (type.value === 10 && (isTransferNVT.value || isTransferNULS.value)) {
        const fee = isTransferNULS.value ? nulsFee : nvtFee;
        amount.value = Minus(balance.value, fee).toFixed();
      } else {
        amount.value = balance.value;
      }
      /*if (isTransferNVT.value) {
        amount.value = Minus(balance.value, 0.01).toFixed();
      } else if (isTransferNULS.value) {
        amount.value = Minus(balance.value, 0.01).toFixed();
      } else {
        amount.value = balance.value;
      }*/
    }

    const { getWalletInfo, handleResult } = useBroadcastNerveHex();
    async function sendTx() {
      try {
        loading.value = true;
        const { chainId, assetId, decimals } = transferAsset.value;
        const { provider, EVMAddress, pub } = getWalletInfo();
        const result: any = await nerveswap.transfer.transfer({
          provider,
          from: father.nerveAddress,
          to: toAddress.value,
          assetChainId: chainId,
          assetId: assetId,
          amount: timesDecimals(amount.value, decimals),
          type: type.value,
          EVMAddress,
          pub
        });
        handleResult(type.value, result);
        /* const transferInfo = {
          from: father.nerveAddress,
          to: toAddress.value,
          assetsChainId: chainId,
          assetsId: assetId,
          amount: timesDecimals(amount.value, decimals),
          fee: type.value === 2 ? 0 : 1000000
        };
        const result: any = await handleTxInfo(transferInfo, type.value, {});
        if (result && result.hash) {
          amount.value = '';
          toAddress.value = '';
        } */
      } catch (e) {
        console.log(e, 'common-transfer-error');
        toastError(e);
      }
      loading.value = false;
    }

    return {
      loading,
      amount,
      balance,
      amountErrorTip,
      assetsList,
      transferAsset,
      disableTransfer,
      toAddress,
      addressError,
      selectAsset,
      max,
      sendTx,
      showFeeTip,
      disableToNULS
    };
  }
});
</script>

<style lang="scss">
.common-transfer {
  .to-input {
    position: relative;
    .el-input {
      border-color: #e3eeff;
    }
    .el-input__inner {
      border-color: #e3eeff;
      height: 58px;
      line-height: 58px;
    }
    .address-error {
      position: absolute;
      left: 0;
      top: 65px;
      font-size: 13px;
      color: #f56c6c;
    }
  }
  .transfer-content {
    margin: 40px 0 60px;
    .fee-wrap {
      padding-top: 10px;
      font-size: 14px;
    }
  }
  @media screen and (max-width: 800px) {
    .to-input {
      .address-error {
        font-size: 12px;
      }
    }
  }
}
</style>
