<template>
  <Modal
    titleAlign="left"
    :title="$t('transfer.transfer12')"
    container-class="mt-[10vh]"
    body-class="p-2 pt-0 sm:p-4 sm:pt-0"
    v-model="show"
    @closed="searchVal = ''"
  >
    <Input
      v-if="!hideSearchInput"
      class="mb-2 mx-2"
      v-model="searchVal"
      :placeholder="$t(showAmount ? 'assets.assets8' : 'assets.assets9')">
      <template #prepend>
        <i-custom-search />
      </template>
      
    </Input>
    <ul class="flex flex-wrap gap-2 mx-2 py-2">
      <li
        v-for="item in hotAssets"
        :key="item.assetKey"
        :class="clsxm(
          'flex items-center cursor-pointer h-10 px-2 bg-card2 border border-card2 rounded-xl duration-300 transition-colors',
          item.assetKey === selectedAsset?.assetKey && 'border-primary',
          'hover:border-primary'
        )"
        @click="selectHotAsset(item.assetKey)"
      >
        <SymbolIcon class="w-6 h-6 mr-1.5 md:w-6 md:h-6" :icon="item.symbol" :asset-key="item.assetKey"></SymbolIcon>
        <span>{{ item.symbol }}</span>
        <template v-if="item.registerChain">
          <span class="text-xs text-label">-{{ item.registerChain }}</span>
        </template>
      </li>
    </ul>
    <ul class="max-h-[50vh] overflow-y-auto">
      <li
        v-for="item in assetList"
        :key="item.assetKey"
        :class="clsxm(
          'px-2 py-3 cursor-pointer rounded-xl hover:bg-card2',
          selectedAsset &&
            selectedAsset.chainId === item.chainId &&
            selectedAsset.assetId === item.assetId && 'cursor-not-allowed opacity-60'
        )"
        @click="changeSelect(item)"
      >
        <div class="flex items-center">
          <SymbolIcon class="mr-2 md:mr-3" :icon="item.symbol" :asset-key="item.assetKey"></SymbolIcon>
          <div class="flex-1">
            <div >
              <span class="text-base">{{ item.symbol }}</span>
              <span class="text-xs text-label" v-if="item.originNetwork">-{{ item.originNetwork }}</span>
            </div>
            <div class="text-xs text-label" v-if="showAmount">ID: {{ item.assetKey }}</div>
            <template class="text-xs text-label" v-else>
              <span class="hidden md:inline">{{ item.contractAddress }}</span>
              <span class="inline md:hidden">
                {{ superLong(item.contractAddress!, 15) }}
              </span>
            </template>
          </div>
          <div class="max-w-[60%] text-right text-base truncate" v-if="showBalance">
            <span class="truncate" v-if="showAmount">
              {{ item.listAvailable }}
            </span>
          </div>
        </div>
      </li>
    </ul>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import Modal from '@/components/Base/Modal/index.vue'
import Input from '@/components/Base/Input/index.vue'
import SymbolIcon from '@/components/SymbolIcon.vue';
import { superLong } from '@/utils/util';
import clsxm from '@/utils/clsxm';

import { AssetItem } from '@/store/types';
import { HotAsset } from '@/views/swap/types';

interface Props {
  showDialog: boolean
  assetList: AssetItem[]
  hotAssets?: HotAsset[]
  showAmount?: boolean
  showBalance?: boolean
  selectedAsset?: AssetItem | null
  hideSearchInput?: boolean
}

interface Emit {
  (e: 'filterAsset', val: string): void
  (e: 'changeSelect', asset: AssetItem): void
  (e: 'update:showDialog', val: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  assetList: () => [],
  hotAssets: () => [],
  showAmount: true,
  selectedAsset: null,
  hideSearchInput: false
})

const emit = defineEmits<Emit>()

const show = computed({
  get() {
    return props.showDialog;
  },
  set(val) {
    emit('update:showDialog', val);
  }
});

const searchVal = ref('');
watch(
  () => searchVal.value,
  val => {
    emit('filterAsset', val);
  }
);

function changeSelect(asset: AssetItem) {
  emit('changeSelect', asset);
}
function selectHotAsset(key: string) {
  const asset = props.assetList.find(v => v.assetKey === key);
  console.log(key, 88);
  emit('changeSelect', asset!);
}
</script>
