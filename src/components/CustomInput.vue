<template>
  <div class="custom-input">
    <div class="info flex-between">
      <span>{{ label }}</span>
      <span v-if="nerveAddress && !isPush">
        {{ $t('public.public12') }}{{ balance }}
      </span>
    </div>
    <div class="inner flex-between">
      <el-input
        class="no-border"
        :model-value="amount"
        @input="changeInput"
        @focus="customerFocus"
        placeholder="0.0"
      >
        <template #append v-if="nerveAddress && !isPush">
          <span @click="max">MAX</span>
        </template>
      </el-input>
      <div class="select-wrap flex-center" @click="openDialog">
        <template v-if="selectedAsset">
          <symbol-icon
            :icon="selectedAsset.symbol"
            :asset-key="selectedAsset.assetKey"
          />
          <template v-if="disableSelect">
            <span>{{ icon }}</span>
          </template>
          <template v-else>
            <!--          <span class="coin-name">{{ icon }}</span>-->
            <el-tooltip effect="dark" :content="icon" placement="top">
              <span class="click">{{ icon }}</span>
            </el-tooltip>
            <el-icon><arrow-down /></el-icon>
          </template>
        </template>
        <template v-else>
          <span class="placeholder">{{ $t('transfer.transfer12') }}</span>
          <el-icon><arrow-down /></el-icon>
        </template>
      </div>
    </div>
    <span class="error-tip" v-if="errorTip">{{ errorTip }}</span>
    <AssetsDialog
      v-model:showDialog="showDialog"
      :assetList="list"
      :hotAssets="hotAssets"
      :showBalance="!!nerveAddress"
      :showAmount="showAmount"
      :selectedAsset="selectedAsset"
      @filterAsset="filter"
      @changeSelect="changeSelect"
    ></AssetsDialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch, computed } from 'vue';
import SymbolIcon from '@/components/SymbolIcon.vue';
import AssetsDialog from '@/components/AssetsDialog.vue';
import { superLong } from '@/utils/util';
import _ from 'lodash';
import useStoreState from '@/hooks/useStoreState';

import { AssetItem } from '@/store/types';
import { HotAsset } from '@/views/swap/types';

export default defineComponent({
  props: {
    label: {
      type: String,
      default: ''
    },
    icon: String,
    assetList: {
      type: Array as PropType<AssetItem[]>,
      default: () => []
    },
    hotAssets: {
      type: Array as PropType<HotAsset[]>,
      default: () => []
    },
    inputVal: String,
    balance: [String, Number],
    errorTip: String,
    selectedAsset: {
      type: Object as PropType<AssetItem>,
      default: () => null
    },
    showAmount: {
      type: Boolean,
      default: true
    },
    isPush: {
      type: Boolean,
      default: false
    },
    limitDecimals: {
      type: Number,
      default: 0
    },
    disableSelect: Boolean
  },
  components: {
    SymbolIcon,
    AssetsDialog
  },
  emits: ['update:inputVal', 'selectAsset', 'max', 'customerFocus'],
  setup(props, { emit }) {
    const { nerveAddress } = useStoreState();
    const amount = ref('');
    watch(
      () => props.inputVal,
      val => {
        amount.value = val || '';
      }
    );

    const allAssetsList = computed<AssetItem[]>(() => {
      return _.cloneDeep(props.assetList);
    });

    const searchVal = ref('');
    const list = computed(() => {
      if (!searchVal.value) {
        return allAssetsList.value.filter(v => v);
      } else {
        if (props.showAmount) {
          return allAssetsList.value.filter(v => {
            return (
              v.assetKey.indexOf(searchVal.value) > -1 ||
              v.symbol.toUpperCase().indexOf(searchVal.value.toUpperCase()) > -1
            );
          });
        } else {
          return allAssetsList.value.filter(v => {
            const contractAddress = v.contractAddress as string;
            return (
              contractAddress.indexOf(searchVal.value) > -1 ||
              v.symbol.toUpperCase().indexOf(searchVal.value.toUpperCase()) > -1
            );
          });
        }
      }
    });

    const showDialog = ref(false);
    const openDialog = () => {
      if (!props.disableSelect) {
        showDialog.value = true;
      }
    };

    const chooseAsset = computed(() => props.selectedAsset);

    function changeInput(val: string) {
      // this.amount = val;
      const decimals = props.limitDecimals || chooseAsset.value?.decimals || 0;
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
          // "^([1-9][\\d]{0,20}|0)(\\.[\\d]{0," + decimals + "})?$"
        );
      }
      if (reg.exec(val) || val === '') {
        emit('update:inputVal', val);
      }
    }

    function filter(str: string) {
      searchVal.value = str;
    }
    function changeSelect(asset: AssetItem) {
      if (!asset) return;
      emit('selectAsset', asset);
      showDialog.value = false;
    }
    function max() {
      emit('max');
    }
    function customerFocus() {
      emit('customerFocus');
    }
    return {
      nerveAddress,
      amount,
      list,
      showDialog,
      searchVal,
      openDialog,
      filter,
      changeInput,
      changeSelect,
      max,
      customerFocus,
      superLong: (str: string, len = 6) => superLong(str, len)
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../assets/css/style.scss';
.custom-input {
  //border: 1px solid #e3eeff;
  border-radius: 15px;
  padding: 15px 20px;
  position: relative;
  background-color: $navBorder;
  border: 1px solid $wrapperBorder;
  .error-tip {
    position: absolute;
    left: 0;
    top: 98px;
    font-size: 12px;
    color: #f56c6c;
  }
  .info {
    margin-bottom: 5px;
    color: $subLabelColor;
    font-size: 12px;
    & span:first-child {
      //font-size: 14px;
    }
  }
  .el-input {
    margin-right: 12px;
    width: auto;
    ::-webkit-input-placeholder {
      color: $labelColor;
    }
  }
  .inner {
    :deep(.el-input) {
      //flex: 1;
      .el-input__inner {
        font-size: 20px;
        padding-right: 0;
      }
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
      //font-weight: 600;
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

.disable_asset {
  opacity: 0.6;
  cursor: not-allowed !important;
}
</style>
