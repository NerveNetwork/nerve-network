<template>
  <div class="handle-wrap">
    <div
      v-if="item.progress === '100'"
      class="handle-mint handle-item disabled"
    >
      {{ $t('mint.mint57') }}
    </div>
    <el-tooltip
      v-else-if="countLimit || timeLimit"
      popper-class="mint-popper"
      effect="dark"
      :content="countLimit ? $t('mint.mint47') : $t('mint.mint45')"
      placement="top"
    >
      <div class="handle-mint handle-item disabled">
        {{ $t('mint.mint58') }}
      </div>
    </el-tooltip>
    <div v-else class="handle-mint handle-item" @click="emits('mint', item.id)">
      Mint
    </div>
    <router-link
      class="handle-item"
      :to="`/swap/${item.mintAsset}/${item.mintFeeAsset}`"
    >
      Swap
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, onUnmounted } from 'vue';
import { IMintItem } from '@/service/api/types/mint';
const props = defineProps<{
  item: IMintItem;
}>();
const emits = defineEmits(['mint']);

const countLimit = ref(false);
const timeLimit = ref(false);

let timer: number;
onMounted(() => {
  checkLimit();
});

onUnmounted(() => {
  stopTimer();
});

function checkLimit() {
  const { mintCount, mintCountLimitPerUser } = props.item;
  if (mintCount === mintCountLimitPerUser && mintCountLimitPerUser) {
    countLimit.value = true;
    return;
  } else {
    intervalCheckStart();
  }
}
function intervalCheckStart() {
  const { startTime, whitelistAddr, mintMinutesForWhitelist } = props.item;
  const now = new Date().getTime();
  const _startTime = new Date(startTime).getTime();
  const whitelistStartTime = _startTime - mintMinutesForWhitelist * 60 * 1000;

  if (whitelistAddr) {
    timeLimit.value = now < whitelistStartTime;
  } else {
    timeLimit.value = now < _startTime;
  }
  if (timeLimit.value) {
    timer = window.setTimeout(() => {
      intervalCheckStart();
    }, 1000);
  } else {
    stopTimer();
  }
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
  }
}
// mint限制 1.未开始，2.超过mint次数

watch(() => props.item.startTime);
</script>

<style lang="scss">
@import '../../assets/css/style.scss';
.handle-wrap {
  display: flex;
  align-items: center;
  .handle-item {
    cursor: pointer;
    padding: 3px 12px;
    border-radius: 8px;
    color: $btnColor;
    border: 1px solid $btnColor;
    user-select: none;
    white-space: nowrap;
    &:hover {
      opacity: 0.7;
    }
  }
  .handle-mint {
    margin-right: 10px;
    color: #37e4cc;
    border-color: #37e4cc;
    &.disabled {
      cursor: auto;
      color: #bbc7e3;
      border-color: #bbc7e3;
      background-color: #eef2fc;
      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
