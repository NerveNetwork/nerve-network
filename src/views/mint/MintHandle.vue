<template>
  <div class="handle-wrap">
    <el-tooltip
      v-if="item.progress === '100'"
      popper-class="mint-popper"
      effect="dark"
      :content="$t('mint.mint57')"
      placement="top"
    >
      <div class="handle-mint handle-item disabled">Mint</div>
    </el-tooltip>
    <el-tooltip
      v-else-if="countLimit || timeLimit"
      popper-class="mint-popper"
      effect="dark"
      :content="countLimit ? $t('mint.mint47') : timerLimitText"
      placement="top"
    >
      <div class="handle-mint handle-item disabled">Mint</div>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { IMintItem } from '@/service/api/types/mint';
const props = defineProps<{
  item: IMintItem;
}>();
const emits = defineEmits(['mint']);

const { t } = useI18n();

const countLimit = ref(false);
const timeLimit = ref(false);
const timerLimitText = ref('');

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
  const { startTime, whitelistAddr, mintMinutesForWhitelist, id } = props.item;
  const now = new Date().getTime();
  const _startTime = new Date(startTime).getTime();
  if (mintMinutesForWhitelist) {
    // set whitelist priority
    if (whitelistAddr) {
      const started = now >= _startTime;
      timeLimit.value = !started;
      timerLimitText.value = started ? '' : t('mint.mint45');
    } else {
      const finalStartTime = _startTime + mintMinutesForWhitelist * 60 * 1000;
      const started = now >= finalStartTime;
      // console.log(started, 2345)
      timeLimit.value = !started;
      timerLimitText.value = started ? '' : t('mint.mint46');
    }
  } else {
    const started = now >= _startTime;
    timeLimit.value = !started;
    timerLimitText.value = started ? '' : t('mint.mint45');
  }
  /* const whitelistStartTime = _startTime - mintMinutesForWhitelist * 60 * 1000;

  if (whitelistAddr) {
    timeLimit.value = now < whitelistStartTime;
  } else {
    timeLimit.value = now < _startTime;
  } */
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
