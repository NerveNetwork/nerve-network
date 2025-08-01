<template>
  <div class="transfer-page box_wrapper">
    <div class="top">
      <div class="back"><i class="iconfont icon-fanhui" @click="back"></i></div>
      <div class="tab-wrap">
        <el-tabs v-model="activeName">
          <el-tab-pane
            :name="TransferType.CrossIn"
            v-if="initialLoading || transferAsset?.canToL1"
          >
            <template #label>
              <span v-if="initialLoading || disableTx" @click.stop="showSwitch">
                {{ $t('transfer.transfer1') }}
              </span>
              <span v-else>{{ $t('transfer.transfer1') }}</span>
            </template>
          </el-tab-pane>
          <el-tab-pane
            :name="TransferType.General"
            :label="$t('transfer.transfer2')"
          >
            <template #label>
              <span v-if="initialLoading" @click.stop>
                {{ $t('transfer.transfer2') }}
              </span>
              <span v-else>{{ $t('transfer.transfer2') }}</span>
            </template>
          </el-tab-pane>
          <el-tab-pane
            :name="TransferType.Withdrawal"
            v-if="initialLoading || transferAsset?.canToL1"
          >
            <template #label>
              <span v-if="initialLoading || disableTx" @click.stop="showSwitch">
                {{ $t('transfer.transfer3') }}
              </span>
              <span v-else>{{ $t('transfer.transfer3') }}</span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="bottom" v-loading="initialLoading">
      <div v-show="activeName === TransferType.CrossIn">
        <BTCCrossIn v-if="network === 'BTC'" />
        <FCHCrossIn
          :network="network"
          v-else-if="network === 'FCH' || network === 'BCH'"
        />
        <TBCCrossIn v-else-if="network === 'TBC'" />
        <cross-in v-else :transferAsset="transferAsset"></cross-in>
      </div>
      <common-transfer
        v-show="activeName === TransferType.General"
        :transferAsset="transferAsset"
      ></common-transfer>
      <withdrawal
        v-show="activeName === TransferType.Withdrawal"
        :transferAsset="transferAsset"
      ></withdrawal>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, PropType } from 'vue';
import CrossIn from './CrossIn.vue';
import BTCCrossIn from './BTCCrossIn.vue';
import FCHCrossIn from './FCHCrossIn.vue';
import TBCCrossIn from './TBCCrossIn.vue';
import CommonTransfer from './CommonTransfer.vue';
import Withdrawal from './Withdrawal.vue';

import { TransferType, AssetItemType } from '../types';

export default defineComponent({
  name: 'transfer',
  components: {
    CrossIn,
    BTCCrossIn,
    FCHCrossIn,
    TBCCrossIn,
    CommonTransfer,
    Withdrawal
  },
  props: {
    showTransfer: Boolean,
    currentTab: {
      type: String as PropType<TransferType>,
      default: TransferType.General
    },
    transferAsset: {
      type: Object as PropType<AssetItemType>
    },
    disableTx: Boolean,
    network: String,
    initialLoading: Boolean
  },
  setup(props, { emit }) {
    const activeName = ref<TransferType>(props.currentTab);
    watch(
      () => props.network,
      () => {
        emit('update:show', false);
      }
    );
    watch(
      () => props.currentTab,
      val => {
        if (val) {
          activeName.value = val;
        }
      }
    );
    function back() {
      emit('update:show', false);
      emit('back');
    }

    function showSwitch() {
      if (props.initialLoading) return;
      emit('showSwitch');
    }
    return {
      activeName,
      back,
      TransferType,
      showSwitch
    };
  }
});
</script>

<style lang="scss">
@import '../../../assets/css/style.scss';
.transfer-page {
  max-width: 470px;
  margin: 0 auto;
  border-radius: 20px;
  .top {
    height: 153px;
    padding: 40px 40px 20px;
    .back {
      margin-bottom: 25px;
      .iconfont {
        font-size: 25px;
        color: #303133;
        /* margin: -10px 0 30px -5px; */
        cursor: pointer;
      }
    }
  }
  .el-tabs .el-tabs__item {
    height: 40px;
    line-height: 40px;
    //width: 60px;
    //text-align: center;
    .iconfont {
      font-size: 28px;
    }
  }
  .el-tabs__item .iconfont {
    font-size: 20px;
  }
  .bottom {
    padding: 50px 40px;
    min-height: 400px;
    //background-color: $BgColor;
    border-radius: 20px;
    box-shadow: 0 0 10px #dfe4ef;
  }
  @media screen and (max-width: 500px) {
    .top {
      height: 100px;
      padding: 20px 20px 0;
      .back {
        margin-bottom: 10px;
        .iconfont {
          font-size: 20px;
        }
      }
      .el-tabs {
        .el-tabs__header {
          margin-bottom: 8px;
        }
        .el-tabs__item {
          height: 30px;
          line-height: 30px;
          font-size: 17px;
        }
      }
    }
    .bottom {
      padding: 30px 20px;
      min-height: auto;
    }
  }
}
</style>
