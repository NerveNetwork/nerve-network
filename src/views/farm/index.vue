<template>
  <div class="w1200 farm">
    <div class="card-wrapper">
      <!-- header -->
      <div
        class="mb-6 flex flex-col items-start md:flex-row md:items-center md:justify-between">
        <div class="mb-4 flex items-center gap-4 md:mb-0 md:gap-6">
          <Select
            class="h-9 w-36 md:w-44"
            dropdownClass="min-w-40"
            v-model="state.sortValue"
            :options="options" />
          <div class="flex cursor-pointer rounded-[20px] bg-card2 text-label">
            <div
              @click="filterListByStatus('pending')"
              :class="[
                'h-9 px-5 text-center leading-9',
                state.farmStatus === 'pending' &&
                  'rounded-[20px] bg-btn-primary text-white'
              ]">
              {{ $t('farm.farm24') }}
            </div>
            <div
              @click="filterListByStatus('end')"
              :class="[
                'h-9 px-4 text-center leading-9',
                state.farmStatus === 'end' &&
                  'rounded-[20px] bg-btn-primary text-white'
              ]">
              {{ $t('farm.farm25') }}
            </div>
          </div>

          <Switch
            class="hidden sm:flex"
            text-class="text-sm"
            v-model="state.mortgageValue"
            :text="$t('farm.farm1')" />
        </div>

        <div class="flex w-full items-center justify-between md:w-auto">
          <Switch
            class="flex sm:hidden"
            text-class="text-sm"
            v-model="state.mortgageValue"
            :text="$t('farm.farm1')" />
          <router-link :to="{ name: 'createFarm' }">
            <Button class="h-9 px-2">
              <span class="mr-1">{{ $t('farm.farm11') }}</span>
              <i-custom-add class="text-white" />
            </Button>
          </router-link>
        </div>
      </div>
      <!-- Farm list -->
       <template v-if="listLoading">
        <div class="flex flex-col gap-4">
          <Skeleton class="h-9" />
          <Skeleton class="h-9" />
          <Skeleton class="h-9" />
        </div>
       </template>
      <div v-else>
        <farm-item
          :list="nerveList"
          :loading="nerveLoading"
          @handleLoading="handleLoading"
          :isPool="props.isPool"
          isNerve
          :isFinished="state.farmStatus === 'end'"></farm-item>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from '@/components/Base/Select/index.vue'
import Switch from '@/components/Base/Switch/index.vue'
import Button from '@/components/Base/Button/index.vue'
import Skeleton from '@/components/Base/Skeleton/index.vue'
import FarmItem from './FarmItem.vue'
import useFarmData from './hooks/useData'
import { useRoute, useRouter } from 'vue-router'

import { SearchState } from './types'

const props = defineProps({
  isPool: {
    type: Boolean,
    default: true
  }
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const options = computed(() => {
  return [
    { label: t('farmRankType.apr'), value: '1' },
    { label: t('farmRankType.usd'), value: '2' }
  ]
})

const listLoading = ref(true)
const nerveLoading = ref(false)
const state = reactive<SearchState>({
  sortValue: '1', // apr -1 liquid -2
  farmStatus: 'pending', // pending | end
  mortgageValue: false
})
const { nerveList, getFarmData, getUserFarm, filterList } = useFarmData()
watch(
  () =>
    [state.sortValue, state.mortgageValue, state.farmStatus] as [
      string,
      boolean,
      string
    ],
  ([type, status, farmStatus]) => {
    // console.log(type, status, 999);
    filterList(type, status, farmStatus)
  }
)
onMounted(async () => {
  const hash = route.params?.hash as string
  // console.log(hash, 123, route)
  // init();
  await getFarmData(hash)
  listLoading.value = false
  getUserFarm(hash)
  nerveLoading.value = false
})

function handleLoading(status: boolean) {
  nerveLoading.value = status
}
function filterListByStatus(status: 'pending' | 'end') {
  state.farmStatus = status
}

function createFarm() {
  router.push({ name: 'createFarm' })
}
</script>
