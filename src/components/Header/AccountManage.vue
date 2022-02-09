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

<style lang="scss"></style>
