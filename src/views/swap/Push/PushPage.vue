<template>
  <div class="push-page">
    <div class="push">
      <Tab @tabChange="tabChange" @modeChange="modeChange" />
      <div class="left-content" v-show="activeTab === '1'">
        <custom-input
          v-model:inputVal="amount"
          ref="customInput"
          :label="buyMode ? $t('trading.trading27') : $t('trading.trading28')"
          :icon="asset && asset.symbol"
          :assetList="assetsList"
          :selectedAsset="asset || null"
          @selectAsset="selectAsset"
          isPush
        />
        <div class="price-wrap">
          <div class="info flex-between">
            <span>{{ $t('trading.trading29') }}</span>
            <span>{{ $t('public.public12') }} {{ 2222 }} USDTN</span>
          </div>
          <div class="inner flex-between">
            <el-input
              class="no-border"
              :model-value="amount"
              @input="() => {}"
              placeholder="0.0"
            />
            <div class="select-wrap flex-center" @click="showDialog = true">
              <SymbolIcon :icon="'USDTN'" :asset-key="2 - 1" />
              <span>USDTN</span>
            </div>
          </div>
        </div>
        <div class="fee-wrap flex-between">
          <span>{{ $t('trading.trading30') }}</span>
          <span>{{ total }} USDTN</span>
        </div>
        <div class="confirm-wrap">
          <el-button type="primary" v-if="nerveAddress" @click="creatOrder">
            {{ buyMode ? $t('trading.trading25') : $t('trading.trading26') }}
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
          <div class="list-item" v-for="i in 6" :key="i">
            <div class="flex-center">
              <SymbolIcon :icon="'BNB'" :asset-key="'2-1'" style="margin-right: 10px" />
              <div class="border">
                <p class="fw">BNB</p>
                <p class="font12" style="color: #94a6ce">ID:1-4</p>
              </div>
            </div>
            <div class="border">
              <span class="font14">3844.32</span>
            </div>
            <div class="border">
              <span class="font14">3844.32</span>
            </div>
            <div class="border btn-wrap">
              <el-button type="primary" @click="pushOrder">
                {{
                  buyMode ? $t('trading.trading26') : $t('trading.trading25')
                }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="my-order-list">
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
        <div class="list-item" v-for="i in 6" :key="i">
          <div class="flex-center">
            <SymbolIcon :icon="'BNB'" :asset-key="'2-1'" style="margin-right: 10px" />
            <div class="border">
              <p class="fw">BNB</p>
              <p class="font12" style="color: #94a6ce">ID:1-4</p>
            </div>
          </div>
          <div class="border">
            <span class="font14">3844.32</span>
          </div>
          <div class="border">
            <span class="font14">3844.32</span>
          </div>
          <div class="border">
            <span class="font14">买</span>
          </div>
          <div class="border btn-wrap">
            <el-button type="default" @click="pushOrder" class="default-btn">
              {{ $t('public.public8') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      custom-class="confirm-modal"
      top="10vh"
      v-model="showConfirmModal"
      :show-close="false"
      :title="buyMode ? $t('trading.trading26') : $t('trading.trading25')"
    >
      <div class="asset-info">
        <p class="flex-between">
          <span class="label">{{ t('trading.trading35') }}</span>
          <span class="value">{{ 'BRG' }}</span>
        </p>
        <p class="flex-between">
          <span class="label">ID</span>
          <span class="value">{{ '2-944' }}</span>
        </p>
        <p class="flex-between">
          <span class="label">{{ t('trading.trading33') }}</span>
          <span class="value">{{ '0.00015' }} USDTN</span>
        </p>
        <p class="flex-between">
          <span class="label">{{ t('trading.trading36') }}</span>
          <span class="value">{{ '20,000,000' }} BRG</span>
        </p>
      </div>
      <div class="price-wrap">
        <div class="info flex-between">
          <span>
            {{ buyMode ? $t('trading.trading28') : $t('trading.trading27') }}
          </span>
          <span>{{ $t('public.public12') }} {{ 2222 }} USDTN</span>
        </div>
        <div class="inner flex-between">
          <el-input
            class="no-border"
            :model-value="amount"
            @input="() => {}"
            placeholder="0.0"
          />
        </div>
      </div>
      <div class="fee-wrap flex-between">
        <span class="label">{{ $t('trading.trading30') }}</span>
        <span class="value">
          <span>{{ total }}</span>
          {{ ' USDTN' }}
        </span>
      </div>
      <el-button type="primary">
        {{ buyMode ? $t('trading.trading38') : $t('trading.trading39') }}
      </el-button>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tab from './Tab.vue';
import CustomInput from '@/components/CustomInput.vue';
import SymbolIcon from '@/components/SymbolIcon.vue';
import AuthButton from '@/components/AuthButton.vue';
import useStoreState from '@/hooks/useStoreState';
import { Times } from '@/utils/util';

const { t } = useI18n();
const { nerveAddress } = useStoreState();

const buyMode = ref(true);
const activeTab = ref('1');
const tabChange = (val: string) => {
  console.log(val);
  activeTab.value = val;
};

const modeChange = (val: boolean) => {
  buyMode.value = val;
  amount.value = '';
  price.value = '';
};

const amount = ref('');
const asset = ref({});
const assetsList = ref([]);
const price = ref('');
const total = computed(() => {
  if (!amount.value || !price.value) {
    return '0';
  }
  return Times(amount.value, price.value);
});
const selectAsset = (val: any) => {
  asset.value = val;
};

const creatOrder = () => {
  //
};

const pushOrder = () => {
  showConfirmModal.value = true
};


const showConfirmModal = ref(false);
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
  .confirm-modal {
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
  @media screen and (max-width: 1200px) {
    //padding: 20px !important;
  }
  @media screen and (max-width: 500px) {
    .push, .my-order-list {
      width: 100%;
      min-width: 100%;
    }
    .my-order-list {
      //
    }
    .confirm-modal {
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
}
</style>
