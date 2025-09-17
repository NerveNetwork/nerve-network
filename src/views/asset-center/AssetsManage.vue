<template>
  <Modal
    container-class="w-[480px]"
    :show-close="false"
    v-model="showDialog"
    @closed="closed">
    <template #title>
      <div
        class="flex items-center justify-between text-lg leading-[50px] sm:leading-[70px]">
        <span>{{ $t('assets.assets7') }}</span>
        <a
          class="text-sm text-primary"
          href="https://docs.google.com/forms/d/e/1FAIpQLSdPXX4EDtzxqBg3OBMIq7EtoiBxnxcqokIeVzAqyXQFYbmf4w/viewform"
          target="_blank">
          {{ $t('assets.assets13') }}
        </a>
      </div>
    </template>
    <Input
      v-model="searchVal"
      :placeholder="$t('assets.assets8')"
      class="mb-5 min-w-[300px] bg-[#20232D]"
      input-class="h-11 leading-[44px]">
      <template #prepend>
        <i-custom-search />
      </template>
    </Input>
    <VList
      v-if="list.length"
      :data="list"
      :style="{ height: '50vh' }"
      :item-size="10"
      #default="{ item, index }">
      <div
        :key="item.assetKey"
        @click="changeSelect(item.assetKey)"
        :class="
          clsxm(
            'flex cursor-pointer items-center justify-between py-1.5 sm:py-3',
            unCancelbleKey(item.assetKey) && 'cursor-not-allowed'
          )
        ">
        <div class="flex items-center">
          <symbol-icon
            :icon="item.symbol"
            :asset-key="item.assetKey"
            class="mr-1 md:mr-3"></symbol-icon>
          <div class="flex flex-col">
            <div class="mb-1 text-sm leading-none md:text-[16px]">
              {{ item.symbol }}
              <span>({{ item.originNetwork }})</span>
            </div>
            <span class="text-xs text-label">
              <span>ID: {{ item.assetKey }}</span>
            </span>
          </div>
        </div>
        <Checkbox
          :checked="item.added"
          :disabled="unCancelbleKey(item.assetKey)"
          @change="changeSelect(item.assetKey)" />
      </div>
    </VList>
    <p v-else class="no-data" style="line-height: 30px">
      {{ $t('public.public19') }}
    </p>
    <div class="flex gap-3 pt-5">
      <Button
        class="flex-1 border-[#3D4152] bg-card2 text-white"
        @click="showDialog = false"
        variant="outline">
        {{ $t('public.public8') }}
      </Button>
      <Button class="flex-1" @click="confirm">
        {{ $t('public.public9') }}
      </Button>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, watch, ref } from 'vue'
import { VList } from 'virtua/vue'
import Modal from '@/components/Base/Modal/index.vue'
import Input from '@/components/Base/Input/index.vue'
import Checkbox from '@/components/Base/Checkbox/index.vue'
import SymbolIcon from '@/components/SymbolIcon.vue'
import Button from '@/components/Base/Button/index.vue'
import clsxm from '@/utils/clsxm'
import _ from 'lodash'
import config from '@/config'
// import VirtualList from "@/components/VirtualList.vue";

import { AssetItemType } from './types'

interface Props {
  mainAssetKey: string
  L1ChainId: number
  showAssetManage: boolean
  assetList: AssetItemType[]
  selectAssets: AssetItemType[]
}

interface Emit {
  (e: 'addAssets', assets: string[]): void
  (e: 'update:showAssetManage', show: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  assetList: () => [],
  selectAssets: () => []
})
const emit = defineEmits<Emit>()

const showDialog = computed({
  get() {
    return props.showAssetManage
  },
  set(val) {
    emit('update:showAssetManage', val)
  }
})

const list = ref<AssetItemType[]>([])
let backupList: AssetItemType[] = []
const searchVal = ref('')
// const virtualList = ref<InstanceType<typeof VirtualList>>();
watch(
  () => props.showAssetManage,
  val => {
    if (val) {
      const cloneList: AssetItemType[] = _.cloneDeep(props.assetList)
      cloneList.map(item => {
        item.added = false
        props.selectAssets.map(v => {
          if (item.assetKey === v.assetKey) {
            item.added = true
          }
        })
      })
      list.value = cloneList
      backupList = _.cloneDeep(cloneList)
      // virtualList.value?.resetScroll();
      filter(searchVal.value)
    }
  }
)

function filter(str: string) {
  if (!str) {
    list.value = backupList.filter(v => v)
  } else {
    list.value = backupList.filter(v => {
      return (
        v.assetKey.indexOf(str) > -1 ||
        v.symbol.toUpperCase().indexOf(str.toUpperCase()) > -1
      )
    })
  }
}
function changeSelect(key: string) {
  console.log(key, 234)
  const isUnCancelble = unCancelbleKey(key)
  if (isUnCancelble) return
  backupList.map(v => {
    if (v.assetKey === key) {
      v.added = !v.added
    }
  })
  filter(searchVal.value)
}

watch(
  () => searchVal.value,
  val => {
    // virtualList.value?.resetScroll();
    filter(val)
  }
)

function confirm() {
  const select: string[] = []
  backupList.map(v => {
    if (v.added) {
      select.push(v.assetKey)
    }
  })
  emit('addAssets', select)
  showDialog.value = false
}

function closed() {
  searchVal.value = ''
  // virtualList.value?.resetScroll();
}

// 不可取消的资产
function unCancelbleKey(key: string) {
  const nvtKey = config.chainId + '-' + config.assetId
  const mainAssetKey = props.mainAssetKey
  const asset = list.value.find(v => v.assetKey === key)!
  const { symbol, registerChainId } = asset
  if (
    symbol === 'USDTN' ||
    (registerChainId === props.L1ChainId && symbol === 'USDT')
  ) {
    return true
  }
  return key === nvtKey || key === mainAssetKey
}

// function submitToken() {
//   window.open(
//     'https://docs.google.com/forms/d/e/1FAIpQLSdPXX4EDtzxqBg3OBMIq7EtoiBxnxcqokIeVzAqyXQFYbmf4w/viewform'
//   )
// }
</script>
