<template>
  <el-dialog
    :title="$t('public.public6')"
    custom-class="account-manage"
    :show-close="false"
    v-model="visible"
    :append-to-body="true"
  >
    <div class="content">
      <div class="top">
        <p>
          <span class="pc">{{ superLong(address, 8) }}</span>
          <span class="mobile">{{ superLong(address, 7) }}</span>
        </p>
        <p>
          <span @click="copy(address)">
            <i class="iconfont icon-fuzhi"></i>
          </span>
          <span @click="openExplorer('address', address)">
            <i class="iconfont icon-tiaozhuanlianjie"></i>
          </span>
        </p>
      </div>
      <div class="bottom tc">
        <el-button type="primary" @click="emit('disconnect')">
          {{ $t('public.public7') }}
        </el-button>
      </div>
    </div>
    <div class="txs">
<!--      <p>{{ $t('public.public23') }}</p>-->
      <template v-if="txList.length">
        <div class="tx-item flex" v-for="item in txList" :key="item.hash">
          <span class="hash link" @click="openUrl(item)">
            {{ superLong(item.hash) }}
          </span>
          <span class="create-time">{{ formatTime(item.time) }}</span>
          <span class="status">
            <span
              class="iconfont icon-chenggong"
              v-if="item.status === 1"
              style="color: #94a6ce"
            ></span>
            <el-icon color="#2688F7" class="is-loading" v-else>
              <loading />
            </el-icon>
          </span>
        </div>
      </template>
      <p v-else class="no-data">{{ $t('public.public19') }}</p>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { superLong, openExplorer, openL1Explorer } from '@/utils/util';
import useCopy from '@/hooks/useCopy';
import dayjs from 'dayjs';
import { TxInfo } from '@/store/types';

const props = defineProps<{
  show: boolean;
  address?: string;
  txList: TxInfo[];
}>();

const emit = defineEmits(['update:show', 'disconnect', 'connect']);

const { copy } = useCopy();

const visible = computed({
  get() {
    return props.show;
  },
  set(val) {
    emit('update:show', val);
  }
});
function formatTime(time: number) {
  return dayjs(time).format('MM-DD HH:mm');
}
function openUrl(item: TxInfo) {
  if (item.L1Chain) {
    openL1Explorer(item.L1Chain, 'hash', item.hash);
  } else {
    openExplorer('hash', item.hash);
  }
}
</script>

<style lang="scss">
@import '../../assets/css/style.scss';
.account-manage {
  max-width: 470px;
  .content {
    /* display: ; */
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      span {
        font-size: 24px;
        color: $txColor;
      }
      i {
        color: $linkColor;
        font-size: 32px;
        cursor: pointer;
        margin-left: 20px;
        &.icon-tiaozhuanlianjie {
          font-size: 30px;
        }
      }
    }
    .bottom {
      padding: 30px 0 25px;
      .el-button {
        width: 205px;
        height: 48px;
        border-radius: 15px;
        border: none;
      }
    }
  }
  .txs {
    max-height: 300px;
    overflow: auto;
    padding-top: 15px;
    p {
      color: #475472;
      margin-bottom: 5px;
      font-size: 16px;
      &.no-data {
        padding-top: 8px;
        font-size: 13px;
        color: #909399;
        text-align: center;
      }
    }
    .tx-item {
      align-items: center;
      margin-bottom: 5px;
    }
    .hash {
      width: 50%;
    }
    .create-time {
      width: 30%;
    }
    .status {
      width: 20%;
      padding-right: 5px;
      display: flex;
      justify-content: flex-end;
      .is-loading {
        transform-origin: center center;
      }
    }
  }
  @media screen and (max-width: 500px) {
    .content .top span {
      font-size: 22px;
      i {
        font-size: 24px;
        &.icon-tiaozhuanlianjie {
          font-size: 22px;
        }
      }
    }
    .content {
      .bottom {
        padding: 20px 0 10px;
        .el-button {
          height: 36px;
        }
      }
    }
  }
}
</style>
