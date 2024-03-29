<template>
  <div class="handle-wrap">
    <template v-if="!nerveAddress">
      <AuthButton />
    </template>
    <template v-else>
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
        v-else-if="progressLimit || countLimit || timeLimit"
        popper-class="mint-popper"
        effect="dark"
        :content="
          progressLimit
            ? 'Ended'
            : countLimit
            ? $t('mint.mint47')
            : timeLimitText
        "
        placement="top"
      >
        <div class="handle-mint handle-item disabled">Mint</div>
      </el-tooltip>
      <div
        v-else
        class="handle-mint handle-item"
        @click="emits('mint', item.id)"
      >
        Mint
      </div>
      <router-link
        class="handle-item"
        :to="`/swap/${item.mintAsset}/${item.mintFeeAsset}`"
      >
        Swap
      </router-link>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AuthButton from '@/components/AuthButton.vue';
import { IMintItem } from '@/service/api/types/mint';

const props = defineProps<{
  item: IMintItem;
  nerveAddress: string;
}>();
const emits = defineEmits(['mint']);

const { t } = useI18n();

const timeLimit = ref(false);
const timeLimitText = ref('');

const progressLimit = computed(() => {
  const { progress } = props.item;
  return Number(progress) - 100 >= 0;
});

const countLimit = computed(() => {
  const { mintCount, mintCountLimitPerUser, progress } = props.item;
  if (Number(progress) - 100 >= 0) {
    return true;
  } else if (mintCountLimitPerUser && mintCount === mintCountLimitPerUser) {
    return true;
  }
  return false;
});

let timer: number;
watch(
  () => props.item.id,
  val => {
    stopTimer();
    if (val || val === 0) {
      checkLimit();
    }
  },
  { immediate: true }
);

function checkLimit() {
  if (!countLimit.value && !progressLimit.value) {
    intervalCheckStart();
  } else {
    stopTimer();
  }
}
function intervalCheckStart() {
  const { startTime, whitelistAddr, mintMinutesForWhitelist } = props.item;
  const now = new Date().getTime();
  const _startTime = new Date(startTime).getTime(); // whitelist start time
  const generalUserStartTime = _startTime + mintMinutesForWhitelist * 60 * 1000; // general user start time
  if (now < _startTime) {
    // mint not start
    timeLimit.value = true;
    timeLimitText.value = t('mint.mint45');
  } else {
    // mint start
    if (mintMinutesForWhitelist) {
      // set whitelist priority
      if (whitelistAddr) {
        timeLimit.value = false;
      } else {
        const started = now >= generalUserStartTime;
        // console.log(started, 2345)
        timeLimit.value = !started;
        timeLimitText.value = started ? '' : t('mint.mint46');
      }
    } else {
      timeLimit.value = false;
    }
  }

  if (timeLimit.value) {
    timer = window.setTimeout(() => {
      checkLimit();
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
