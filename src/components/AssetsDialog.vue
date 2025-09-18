<template>
  <Modal
    titleAlign="left"
    :title="$t('transfer.transfer12')"
    container-class="mt-[10vh]"
    v-model="show"
    @closed="searchVal = ''">
    <Input
      v-if="!hideSearchInput"
      class="mb-2 bg-card2"
      v-model="searchVal"
      :placeholder="$t(showAmount ? 'assets.assets8' : 'assets.assets9')">
      <template #prepend>
        <i-custom-search />
      </template>
    </Input>
    <ul class="flex flex-wrap gap-2 py-2">
      <li
        v-for="item in hotAssets"
        :key="item.assetKey"
        :class="
          clsxm(
            'flex h-10 cursor-pointer items-center rounded-xl border border-card2 bg-card2 px-2 transition-colors duration-300',
            item.assetKey === selectedAsset?.assetKey && 'border-primary',
            'hover:border-primary'
          )
        "
        @click="selectHotAsset(item.assetKey)">
        <SymbolIcon
          class="mr-1.5 h-6 w-6 md:h-6 md:w-6"
          :icon="item.symbol"
          :asset-key="item.assetKey"></SymbolIcon>
        <span>{{ item.symbol }}</span>
        <template v-if="item.registerChain">
          <span class="text-xs text-label">-{{ item.registerChain }}</span>
        </template>
      </li>
    </ul>
    <VList
      :data="assetList"
      :style="{ height: '50vh' }"
      :item-size="10"
      #default="{ item, index }">
      <div
        :key="item.assetKey"
        :class="
          clsxm(
            'cursor-pointer rounded-xl px-2 py-3 hover:bg-card2',
            selectedAsset &&
              selectedAsset.chainId === item.chainId &&
              selectedAsset.assetId === item.assetId &&
              'cursor-not-allowed opacity-60'
          )
        "
        @click="changeSelect(item)">
        <div class="flex items-center">
          <SymbolIcon
            class="mr-2 md:mr-3"
            :icon="item.symbol"
            :asset-key="item.assetKey"></SymbolIcon>
          <div class="flex-1">
            <div>
              <span class="text-base">{{ item.symbol }}</span>
              <span class="text-xs text-label" v-if="item.originNetwork"
                >-{{ item.originNetwork }}</span
              >
            </div>
            <div class="text-xs text-label" v-if="showAmount">
              ID: {{ item.assetKey }}
            </div>
            <template class="text-xs text-label" v-else>
              <span class="hidden md:inline">{{ item.contractAddress }}</span>
              <span class="inline md:hidden">
                {{ superLong(item.contractAddress!, 15) }}
              </span>
            </template>
          </div>
          <div
            class="max-w-[60%] truncate text-right text-base"
            v-if="showBalance">
            <span class="truncate" v-if="showAmount">
              {{ toThousands(item.listAvailable) }}
            </span>
          </div>
        </div>
      </div>
    </VList>
  </Modal>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import Modal from '@/components/Base/Modal/index.vue'
import Input from '@/components/Base/Input/index.vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import { VList } from 'virtua/vue'
import { superLong, toThousands } from '@/utils/util'
import clsxm from '@/utils/clsxm'

import { AssetItem } from '@/store/types'
import { HotAsset } from '@/views/swap/types'

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
    return props.showDialog
  },
  set(val) {
    emit('update:showDialog', val)
  }
})

const searchVal = ref('')
watch(
  () => searchVal.value,
  val => {
    emit('filterAsset', val)
  }
)

function changeSelect(asset: AssetItem) {
  emit('changeSelect', asset)
}
function selectHotAsset(key: string) {
  const asset = props.assetList.find(v => v.assetKey === key)
  console.log(key, 88)
  emit('changeSelect', asset!)
}
</script>
