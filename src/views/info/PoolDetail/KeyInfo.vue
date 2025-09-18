<template>
  <div class="key-info flex items-center">
    <!-- Pool -->
    <template v-if="props.isPool">
      <div class="flex items-center" v-if="props.isPool">
        <SymbolIcon class="mr-1.5" :icon="symbols[1]" :asset-key="assetKeys[1]"></SymbolIcon>
        <SymbolIcon :icon="symbols[0]" :asset-key="assetKeys[0]"></SymbolIcon>
      </div>
      <div class="text-base font-medium md:text-2xl md:leading-[30px] mr-1.5">
        <router-link :to="`/info/tokens/${assetKeys[0]}`" class="text-primary cursor-pointer">
          {{ symbols[0] }}
        </router-link>
        /
        <router-link :to="`/info/tokens/${assetKeys[1]}`" class="text-primary cursor-pointer">
          {{ symbols[1] }}
        </router-link>
      </div>
      <div class="text-label">ID: {{ props.info.assetKey || props.info.tokenLP }}</div>
      <CollectIcon class="ml-7" v-model="isCollected" @change="change" />
    </template>
    <!-- Token -->
    <template v-else>
      <SymbolIcon class="mr-3 md:h-10 md:w-10" :icon="props.info.name" :asset-key="props.info.assetKey" />
      <div>
        <div class="flex items-center">
          <div class="text-base font-medium md:text-2xl md:leading-[30px]">
            {{ props.info.name }}
          </div>
          <div class="text-label ml-1.5">ID: {{ props.info.assetKey || props.info.tokenLP }}</div>
          <CollectIcon class="ml-7" v-model="isCollected" @change="change" />
        </div>
        <div class="text-base">
          ${{ props.info.price }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import useCollect from '../hooks/useCollect';
import SymbolIcon from '@/components/SymbolIcon.vue';
import CollectIcon from '@/components/CollectIcon.vue';
import { useInfoStore } from '@/store/info';
import { sortAssetsByValuation } from '@/utils/util';

const props = defineProps<{
  info: any;
  isPool?: boolean;
}>();

const router = useRouter();
const infoStore = useInfoStore()

const { changeCollect } = useCollect();

const symbols = computed(() => {
  const { token0Symbol, token1Symbol } = props.info;

  if (!token0Symbol) return ['', ''];
  if (!token1Symbol) return [token0Symbol, ''];
  return sortAssetsByValuation(token0Symbol, token1Symbol);
});

const assetKeys = computed(() => {
  if (!props.isPool) return [];
  const { token0Symbol, token1Symbol, token0, token1 } = props.info;
  if (symbols.value[0] === token0Symbol && symbols.value[1] === token1Symbol) {
    return [token0, token1];
  } else {
    return [token1, token0];
  }
});

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
    const watchPools = infoStore.watchPools;
    flag = watchPools.indexOf(info.address) > -1;
  } else {
    const watchTokens = infoStore.watchTokens;
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

function toAsset(key: string) {
  router.push('/info/tokens/' + key);
}
</script>
