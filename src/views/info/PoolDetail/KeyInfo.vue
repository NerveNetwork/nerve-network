<template>
  <div class="key-info flex-between">
    <div class="left flex-center">
      <div class="symbol-wrap flex-center" v-if="props.isPool">
        <SymbolIcon :icon="props.info.token0Symbol"></SymbolIcon>
        <SymbolIcon :icon="props.info.token1Symbol"></SymbolIcon>
      </div>
      <div class="symbol-wrap" v-else>
        <SymbolIcon :icon="props.info.name" />
      </div>
      <div class="symbol-info">
        <p class="name fw">{{ props.info.name }}</p>
        <p class="key">ID: {{ props.info.assetKey || props.info.tokenLP }}</p>
      </div>
    </div>
    <CollectIcon v-model="isCollected" @change="change" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import useCollect from '../hooks/useCollect';
import SymbolIcon from '@/components/SymbolIcon.vue';
import CollectIcon from '@/components/CollectIcon.vue';
import { useStore } from '@/store';

const props = defineProps<{
  info: any;
  isPool?: boolean;
}>();

const store = useStore();
const { changeCollect } = useCollect();

watch(
  () => props.info,
  val => {
    checkIsCollected(val);
  }
);
const isCollected = ref(false);
function checkIsCollected(info: any) {
  let flag = false;
  if (props.isPool) {
    const watchPools = store.state.watchPools;
    flag = watchPools.indexOf(info.address) > -1;
  } else {
    const watchTokens = store.state.watchTokens;
    flag = watchTokens.indexOf(info.assetKey) > -1;
  }
  isCollected.value = flag;
}

function change(status: boolean) {
  // console.log(status);
  const type = props.isPool ? 'pool' : 'token';
  const value = props.isPool ? props.info.address : props.info.assetKey;
  changeCollect(value, status, type);
}
</script>

<style lang="scss">
.key-info {
  .symbol-wrap {
    margin-right: 10px;
    img {
      width: 42px;
      height: 42px;
      background-color: #fff;
    }
    img:last-of-type {
      margin-left: -10px;
    }
  }
  .symbol-info {
    .name {
      font-size: 20px;
    }
    .key {
      color: #94A6CE;
      font-size: 14px;
    }
  }
  .collect {
    cursor: pointer;
  }
}
</style>
