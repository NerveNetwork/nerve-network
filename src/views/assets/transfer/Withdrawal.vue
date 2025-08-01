<template>
  <div class="cross-out" v-loading="loading">
    <div class="title">
      {{ 'To ' + father.network }}
      <!--      <span class="click" @click="openUrl(father.address, father.network)">
        {{ superLong(father.address) }}
        <i class="iconfont icon-tiaozhuanlianjie"></i>
      </span>-->
    </div>
    <div class="to-input">
      <el-input
        :placeholder="$t('transfer.transfer28')"
        v-model.trim="toAddress"
      ></el-input>
      <span class="address-error" v-if="addressError">
        {{ addressError }}
      </span>
    </div>
    <div class="transfer-content">
      <custom-input
        v-model:inputVal="amount"
        :label="$t('transfer.transfer20')"
        :icon="transferAsset.symbol"
        :assetList="assetsList"
        :balance="balance"
        :selectedAsset="transferAsset"
        @selectAsset="selectAsset"
        @max="max"
      ></custom-input>
      <div class="fee">
        {{ $t('public.public15') }}
        <el-icon class="is-loading" v-if="!fee">
          <loading />
        </el-icon>
        <span v-else>{{ fee + ' ' + feeSymbol }}</span>
        <span
          class="link"
          style="margin-left: 10px"
          @click="showFeeDialog = true"
        >
          {{ $t('transfer.transfer22') }}
        </span>
      </div>
      <div class="tx-tip">
        <el-checkbox v-model="confirmTip" :label="$t('transfer.transfer30')" />
      </div>
    </div>
    <div class="confirm-wrap">
      <el-button type="primary" @click="sendTx" :disabled="disableTransfer">
        {{ amountErrorTip || $t('transfer.transfer11') }}
      </el-button>
    </div>
    <AssetsDialog
      v-model:showDialog="showFeeDialog"
      hideSearchInput
      :assetList="supportedFeeAssets"
      :showBalance="true"
      :showAmount="true"
      :selectedAsset="selectedFeeAsset"
      @changeSelect="changeFeeAsset"
    ></AssetsDialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, inject, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import useToast from '@/hooks/useToast';
import CustomInput from '@/components/CustomInput.vue';
import AssetsDialog from '@/components/AssetsDialog.vue';
import { superLong, Minus, timesDecimals, Plus, isBeta } from '@/utils/util';
import { ETransfer } from '@/utils/api';
import TronLinkApi from '@/utils/tronLink';
import config from '@/config';
import useCrossOutFee from '../hooks/useCrossOutFee';
import useBTCsCrossOut from '../hooks/useBTCsCrossOut';
import useBroadcastNerveHex from '@/hooks/useBroadcastNerveHex';

import {
  rootCmpKey,
  RootComponent,
  AssetItemType,
  IBTCWithdrawalInfo
} from '../types';
import { HeterogeneousInfo } from '@/store/types';
import { _networkInfo } from '@/utils/heterogeneousChainConfig';
import storage from '@/utils/storage';
import { getWithdrawalGasLimit } from '@/utils/getSystemConfig';
import nerveswap from 'nerveswap-sdk';
import { NSymbol } from '@/constants/constants';

export default defineComponent({
  name: 'withdrawal',
  components: {
    CustomInput,
    AssetsDialog
  },
  setup() {
    const father = inject(rootCmpKey, {} as RootComponent);
    const { t } = useI18n();
    const { toastError } = useToast();
    const {
      // getBTCWithdrawalInfo,
      // getBTCCrossOutFee,
      getCrossOutFee
      // getFCHWithdrawalInfo,
      // getFCHCrossOutFee
    } = useCrossOutFee();

    const {
      isBTCs,
      isTBC,
      btcHid,
      validBTCsAddress,
      getBTCsWithdrawalInfo,
      getBTCsCrossOutFee
    } = useBTCsCrossOut(father.network);

    const loading = ref(false);
    const toAddress = ref(father.address);
    const addressError = ref('');
    const fee = ref('');
    const confirmTip = ref(false);
    watch(
      () => toAddress.value,
      val => {
        if (val) {
          let flag = true;
          try {
            if (father.network === 'TRON') {
              const tron = new TronLinkApi();
              flag = tron.validAddress(val);
            } else if (isBTCs) {
              flag = validBTCsAddress(val);
            } else {
              const transfer = new ETransfer();
              flag = transfer.validateAddress(val);
            }
          } catch (e) {
            flag = false;
          }
          addressError.value = flag ? '' : t('transfer.transfer29');
        } else {
          addressError.value = '';
        }
      }
    );
    const amount = ref('');

    const assetsList = computed<AssetItemType[]>(() => {
      const chain = _networkInfo[father.network];
      return father.crossInOutSymbol.filter(v => {
        return v.heterogeneousList?.filter(item => {
          return item.heterogeneousChainId === chain.chainId;
        });
      });
    });

    const transferAsset = ref<AssetItemType>({} as AssetItemType);
    watch(
      () => father.transferAsset,
      val => {
        if (val?.assetKey && !transferAsset.value.assetKey) {
          transferAsset.value = val;
        }
      },
      { immediate: true }
    );
    const balance = computed(() => {
      const asset = assetsList.value.find(asset => {
        return asset.assetKey === transferAsset.value.assetKey;
      });
      return asset ? asset.available : '';
    });

    const amountErrorTip = ref('');
    const disableTransfer = computed(() => {
      return !!(
        !fee.value ||
        !amount.value ||
        !balance.value ||
        amountErrorTip.value ||
        father.disableTx ||
        !toAddress.value ||
        addressError.value ||
        !confirmTip.value
      );
    });
    const feeSymbol = ref('');
    const showFeeDialog = ref(false);

    const selectedFeeAsset = ref<AssetItemType>({} as AssetItemType); // 手续费资产信息--L1网络在nerve上的主资产
    const supportedFeeAssets = ref<AssetItemType[]>([]); // 可充当提现手续费的资产

    onMounted(async () => {
      if (father.disableTx) return;
      getFeeAssetInfo();
      selectAsset(transferAsset.value);
      const crossChainInfo = storage.get('crossChainInfo');
      if (isBTCs) {
        const multySignAddress = crossChainInfo[btcHid].multySignAddress;
        if (isTBC) {
          getBTCCrossOutFeeHandle();
        } else {
          await getBTCsWithdrawalInfo(multySignAddress);
          if (father.network === 'BTC') {
            getBTCCrossOutFeeHandle();
          }
        }
      }
    });

    function getFeeAssetInfo() {
      const { network } = father;
      const feeAssets: AssetItemType[] = [];
      const htgMainAsset = Object.values(_networkInfo).filter(
        v => v.name !== NSymbol
      );
      father.allAssetsList.map(v => {
        htgMainAsset.map(item => {
          if (item.assetKey === v.assetKey) {
            feeAssets.push(v);
          }
        });
      });
      const defaultFeeAsset = _networkInfo[network] || _networkInfo.NERVE;
      selectedFeeAsset.value = father.allAssetsList.find(asset => {
        return asset.assetKey === defaultFeeAsset.assetKey;
      }) as AssetItemType;
      feeSymbol.value =
        network === 'ENULS' ? NSymbol : _networkInfo[network].mainAsset;
      supportedFeeAssets.value = feeAssets;
    }

    // 手续费与交易资产是否是同一个资产
    const FeeAsset_TransferAsset_IsSame = computed(() => {
      // if (!selectedFeeAsset.value || !transferAsset.value) return false;
      return (
        selectedFeeAsset.value.chainId === transferAsset.value.chainId &&
        selectedFeeAsset.value.assetId === transferAsset.value.assetId
      );
    });

    let heterogeneousInfo: HeterogeneousInfo; // 异构链信息
    // 选择交易资产
    function selectAsset(asset: AssetItemType) {
      fee.value = '';
      amount.value = '';
      const heterogeneousList = asset.heterogeneousList || [];
      // 目标异构链ID
      const heterogeneousChainId = _networkInfo[father.network]?.chainId;
      if (!heterogeneousChainId) return;
      heterogeneousInfo = heterogeneousList.find(
        v => v.heterogeneousChainId === heterogeneousChainId
      ) as HeterogeneousInfo;

      if (heterogeneousInfo) {
        transferAsset.value = asset;
        getCrossOutFeeHandle();
      } else {
        transferAsset.value = {} as AssetItemType;
      }
    }

    watch(
      () => amount.value,
      val => {
        if (Number(val) && isBTCs && !isTBC) {
          getBTCCrossOutFeeHandle();
        }
      }
    );

    async function getCrossOutFeeHandle() {
      const withdrawalChain = father.network;
      if (isBTCs) {
        getBTCCrossOutFeeHandle();
      } else {
        const {
          chainId,
          assetId,
          decimals,
          originNetwork: feeChain
        } = selectedFeeAsset.value;
        const { isToken, heterogeneousChainId } = heterogeneousInfo;
        const feeIsNVT =
          chainId === config.chainId && assetId === config.assetId;
        fee.value = await getCrossOutFee({
          hId: heterogeneousChainId,
          useMainAsset: feeChain === withdrawalChain,
          feeDecimals: decimals,
          feeAssetKey: chainId + '-' + assetId,
          isNVT: feeIsNVT,
          isTRX: feeChain === 'TRON'
        });
      }
    }

    async function getBTCCrossOutFeeHandle() {
      const withdrawalChain = father.network;
      const {
        chainId,
        assetId,
        decimals,
        originNetwork: feeChain
      } = selectedFeeAsset.value;
      const feeIsNVT = chainId === config.chainId && assetId === config.assetId;
      fee.value = await getBTCsCrossOutFee({
        amount: amount.value,
        useMainAsset: feeChain === withdrawalChain,
        feeDecimals: decimals,
        feeAssetKey: chainId + '-' + assetId,
        isNVT: feeIsNVT,
        withdrawalChain
      });
      validateAmount();
    }

    /* async function getFCHCrossOutFeeHandle() {
      const withdrawalChain = father.network;
      const {
        chainId,
        assetId,
        decimals,
        originNetwork: feeChain
      } = selectedFeeAsset.value;
      const feeIsNVT = chainId === config.chainId && assetId === config.assetId;
      await getFCHCrossOutFee({
        amount: amount.value,
        useMainAsset: feeChain === withdrawalChain,
        feeDecimals: decimals,
        feeAssetKey: chainId + '-' + assetId,
        isNVT: feeIsNVT,
        withdrawalChain: father.network
      });
      validateAmount();
    } */

    async function changeFeeAsset(asset: AssetItemType) {
      showFeeDialog.value = false;
      selectedFeeAsset.value = asset;
      feeSymbol.value = asset.symbol;
      fee.value = '';
      await getCrossOutFeeHandle();
      validateAmount();
    }

    function validateAmount() {
      const { available } = selectedFeeAsset.value;
      if (
        !Number(balance.value) ||
        Minus(balance.value, amount.value).toNumber() < 0 ||
        (FeeAsset_TransferAsset_IsSame.value &&
          Minus(balance.value, Plus(amount.value, fee.value)).toNumber() < 0)
      ) {
        amountErrorTip.value = t('transfer.transfer15');
      } else if (isBTCs && Minus(amount.value, 0.00000546).toNumber() < 0) {
        amountErrorTip.value = 'Minimum quantity is 0.00000546';
      } else if (Minus(available, fee.value).toNumber() < 0) {
        amountErrorTip.value = t('transfer.transfer18');
      } else {
        amountErrorTip.value = '';
      }
    }

    watch(
      () => amount.value,
      val => {
        if (val) {
          validateAmount();
        }
      }
    );

    function max() {
      if (!balance.value || !Number(balance.value)) return;
      if (FeeAsset_TransferAsset_IsSame.value) {
        if (!fee.value) return;
        if (Minus(balance.value, fee.value).toNumber() > 0) {
          amount.value = Minus(balance.value, fee.value).toString();
        } else {
          amount.value = balance.value;
        }
      } else {
        amount.value = balance.value;
      }
    }

    const { getWalletInfo, handleResult } = useBroadcastNerveHex();
    async function sendTx() {
      if (!Number(fee.value)) {
        toastError('The Cross Out Network is in queue, please wait');
        return;
      }
      loading.value = true;
      try {
        const { chainId, assetId, decimals } = transferAsset.value;
        const { nerveAddress } = father;
        const {
          chainId: feeChainId,
          assetId: feeAssetId,
          decimals: feeDecimals
        } = selectedFeeAsset.value;
        const transferInfo = {
          from: nerveAddress,
          assetsChainId: chainId,
          assetsId: assetId,
          amount: timesDecimals(amount.value, decimals),
          fee: 0,
          withdrawalFee: timesDecimals(fee.value, feeDecimals),
          fee_asset: {
            chainId: feeChainId,
            assetId: feeAssetId
          }
        };
        console.log(transferInfo, '===transferInfo===');
        const txData = {
          heterogeneousAddress: toAddress.value,
          heterogeneousChainId: heterogeneousInfo.heterogeneousChainId
        };

        /* await sendAdditionFeeTx({
          provider: 'ethereum',
          from: nerveAddress,
          amount: timesDecimals(fee.value, decimals),
          assetChainId: chainId,
          assetId: assetId,
          txHash:
            'bb8abc5679e4f4e1ca9f8101b6ea0443c5f65b2a8ab6f34ecec7fa9808ae2f3c',
          EVMAddress: '0xc11D9943805e56b630A401D4bd9A29550353EFa1',
          pub: '0369b20002bc58c74cb6fd5ef564f603834393f53bed20c3314b4b7aba8286a7e0'
        }); */
        const { provider, EVMAddress, pub } = getWalletInfo();
        let targetAddress = toAddress.value;
        if (
          father.network === 'BCH' &&
          !targetAddress.startsWith(nerveswap.bch.addressPrefix)
        ) {
          targetAddress = nerveswap.bch.addressPrefix + toAddress.value;
        }
        const result = await nerveswap.transfer.withdrawal({
          provider,
          from: nerveAddress,
          assetChainId: chainId,
          assetId: assetId,
          amount: timesDecimals(amount.value, decimals),
          feeInfo: {
            amount: timesDecimals(fee.value, feeDecimals),
            assetChainId: feeChainId,
            assetId: feeAssetId
          },
          heterogeneousAddress: targetAddress,
          heterogeneousChainId: heterogeneousInfo.heterogeneousChainId,
          EVMAddress,
          pub
        });
        handleResult(43, result, heterogeneousInfo.heterogeneousChainId);

        /* await sendWithdrawalTx({
          provider: 'ethereum',
          from: nerveAddress,
          assetChainId: chainId,
          assetId: assetId,
          amount: timesDecimals(amount.value, decimals),
          feeInfo: {
            amount: timesDecimals(1, feeDecimals),
            chainId: feeChainId,
            assetId: feeAssetId
          },
          heterogeneousAddress: toAddress.value,
          heterogeneousChainId: heterogeneousInfo.heterogeneousChainId,
          EVMAddress: '0xc11D9943805e56b630A401D4bd9A29550353EFa1',
          pub: '0369b20002bc58c74cb6fd5ef564f603834393f53bed20c3314b4b7aba8286a7e0'
        }); */

        // const result: any = await handleTxInfo(transferInfo, 43, txData);
        // if (result && result.hash) {
        //   amount.value = '';
        // }
      } catch (e) {
        console.log(e, 'withdrawal-error');
        toastError(e);
      }
      loading.value = false;
    }
    function openUrl(address: string, network: string) {
      const { origin } = _networkInfo[network];
      window.open(origin + '/address/' + address);
    }

    return {
      father,
      toAddress,
      addressError,
      confirmTip,
      loading,
      amount,
      balance,
      fee,
      amountErrorTip,
      disableTransfer,
      assetsList,
      transferAsset,
      feeSymbol,
      showFeeDialog,
      selectedFeeAsset,
      supportedFeeAssets,
      selectAsset,
      changeFeeAsset,
      max,
      sendTx,
      superLong: (str: string, len = 6) => superLong(str, len),
      openUrl
    };
  }
});
</script>

<style lang="scss">
@import '../../../assets/css/style.scss';
.cross-out {
  .title {
    font-size: 18px;
    color: $labelColor;
    margin-bottom: 20px;
    span {
      color: $linkColor;
    }
  }
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
    margin: 35px 0 60px;
  }
  .fee {
    color: #7e87c2;
    font-size: 14px;
    margin-top: 20px;
  }
  .tx-tip {
    padding-top: 10px;
    .el-checkbox__inner {
      width: 18px;
      height: 18px;
      &:after {
        height: 10px;
        left: 5px;
        top: 1px;
        font-weight: 600;
        width: 5px;
      }
    }
    .el-checkbox__label {
      color: #f56c6c;
      white-space: normal;
    }
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
  }
}
</style>
