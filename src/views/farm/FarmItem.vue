<template>
  <div class="farm-item" v-loading="loading">
    <div
      class="no-data flex h-20 items-center justify-center"
      v-if="!list.length">
      {{ $t('public.public19') }}
    </div>
    <div class="" v-for="(item, index) of list" :key="index">
      <div class="" @click="showId(item.farmHash)">
        <div class="flex items-center flex-wrap gap-2 cursor-pointer border-b border-line py-3">
          <div class="flex w-full md:w-auto items-center justify-between">
            <FarmSymbol
              :name="item.name"
              :logo1="item.logo"
              :logo2="item.logo2" />
            <div :class="['block md:hidden duration-300 transition-transform', item.showDetail && 'rotate-180']"><i-custom-arrow-down /></div>
          </div>
          <div class="flex md:flex-1 w-full md:w-auto">
            <div class="flex-1">
              <div class="text-xs text-label">{{ $t('farm.farm2') }}</div>
              <div>
                {{ toThousands(item.pendingReward) }}
                {{ item.syrupTokenSymbol }}
              </div>
            </div>
            <div class="flex-1">
              <div class="text-xs text-label">{{ $t('farm.farm3') }}</div>
              <div>
                {{
                  isFinished ? '--' : Number(item.apr) ? item.apr + '%' : '--'
                }}
              </div>
            </div>
            <div class="flex-1">
              <div class="text-xs text-label">{{ $t('farm.farm4') }}</div>
              <div>
                {{
                  Number(item.tatalStakeTokenUSD)
                    ? '$' + toThousands(item.tatalStakeTokenUSD)
                    : '--'
                }}
              </div>
            </div>
          </div>
          <div :class="['hidden md:block duration-300 transition-transform', item.showDetail && 'rotate-180']"><i-custom-arrow-down /></div>
        </div>
      </div>
      <collapse-transition>
        <DetailsBar
          :tokenInfo="item"
          :isNerve="isNerve"
          :isPool="isPool"
          :isFinished="isFinished"
          :nerveAddress="nerveAddress"
          v-show="item.showDetail"
          @loading="handleLoading"></DetailsBar>
      </collapse-transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue'
import { storeToRefs } from 'pinia'
import DetailsBar from './DetailsBar.vue'
import CollapseTransition from '@/components/CollapseTransition.vue'
import FarmSymbol from './FarmSymbol.vue'
import { useWalletStore } from '@/store/wallet'
import { NerveFarmItem, UniFarmItem } from './types'
import { toThousands } from '@/utils/util'

const props = defineProps({
  loading: Boolean,
  list: {
    type: Array as PropType<NerveFarmItem[] | UniFarmItem[]>,
    default: () => []
  },
  isNerve: Boolean,
  isPool: Boolean,
  isFinished: Boolean
})
const emit = defineEmits(['handleLoading'])

const walletStore = useWalletStore()
const { nerveAddress } = storeToRefs(walletStore)

//详情
function showId(hash: string) {
  for (let item of props.list) {
    if (item.farmHash === hash) {
      item.showDetail = !item.showDetail
    } else {
      item.showDetail = false
    }
  }
}
function handleLoading(status: boolean) {
  emit('handleLoading', status)
}
</script>
